import {
    getReservas,
    getReservaById,
    getReservasPorUsuario,
    updateReservaStatus,
    deleteReserva,
} from "../models/Reserva.js";
import pool from "../config/db.js";
import multer from 'multer';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para comprobantes
const comprobanteDir = path.join(__dirname, '../../uploads/comprobante');
const comprobanteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobanteDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `comprobante-${uniqueSuffix}${ext}`);
  }
});

export const uploadImage = multer({
  storage: comprobanteStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, JPG) o PDF'));
  }
}).single('image');

export const crearReserva = async (req, res) => {
    const user_id = req.user?.userId;
    
    if (!user_id) {
        return res.status(401).json({ 
            success: false,
            error: "No autorizado. Debes iniciar sesión." 
        });
    }

    const { cancha_id, fecha, horarios, monto, metodoPago, nombreImg } = req.body;

    // Validaciones básicas
    if (!cancha_id || !fecha || !horarios || !monto || !metodoPago) {
        return res.status(400).json({ 
            success: false,
            error: "Faltan datos requeridos para la reserva" 
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar disponibilidad de horarios
        for (const horario of horarios) {
            const { start_time, end_time } = horario;
            
            const [existing] = await connection.query(
                `SELECT id FROM horarios 
                 WHERE cancha_id = ? AND date = ? AND (
                    (start_time < ? AND end_time > ?) OR
                    (start_time >= ? AND start_time < ?) OR
                    (end_time > ? AND end_time <= ?)
                 ) AND estado = 'ocupado'`,
                [cancha_id, fecha, end_time, start_time, start_time, end_time, start_time, end_time]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return res.status(409).json({ 
                    success: false,
                    error: `El horario ${start_time}-${end_time} ya está ocupado` 
                });
            }
        }

        // Obtener tasa
        const [tasa] = await connection.query(`SELECT monto FROM tasa WHERE id = 1`);
        if (tasa.length === 0) {
            await connection.rollback();
            return res.status(500).json({ 
                success: false,
                error: "Error en configuración del sistema" 
            });
        }

        // Crear pago
        const [pago] = await connection.query(
            `INSERT INTO pagos 
            (user_id, amount, payment_method, payment_proof, payment_status, tasa_valor) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, monto, metodoPago, nombreImg || null, "pendiente", tasa[0].monto]
        );
        const pago_id = pago.insertId;

        // Crear horarios y reservas
        for (const horario of horarios) {
            const { start_time, end_time } = horario;

            const [horarioRes] = await connection.query(
                `INSERT INTO horarios (cancha_id, date, start_time, end_time, estado) 
                 VALUES (?, ?, ?, ?, 'ocupado')`,
                [cancha_id, fecha, start_time, end_time]
            );

            await connection.query(
                `INSERT INTO reservaciones (user_id, horario_id, pago_id, status) 
                 VALUES (?, ?, ?, 'pendiente')`,
                [user_id, horarioRes.insertId, pago_id]
            );
        }

        await connection.commit();
        
        return res.status(201).json({ 
            success: true,
            message: "Reserva creada exitosamente",
            data: {
                pago_id,
                cancha_id,
                fecha,
                comprobante_url: nombreImg ? `http://localhost:3000/uploads/comprobante/${nombreImg}` : null
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error al crear reserva:", error);
        return res.status(500).json({ 
            success: false,
            error: "Error interno del servidor al procesar la reserva"
        });
    } finally {
        connection.release();
    }
};

// Obtener todas las reservas
export const obtenerReservas = async (req, res) => {
    try {
        const reservas = await getReservas();
        res.status(200).json(reservas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reservas", error });
    }
};

// Obtener una reserva por ID
export const obtenerReservaPorId = async (req, res) => {
    try {
        const reserva = await getReservaById(req.params.id);
        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }
        res.status(200).json(reserva);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la reserva", error });
    }
};

// Actualizar el estado de una reserva
export const actualizarEstadoReserva = async (req, res) => {
    try {
        const { status } = req.body;
        await updateReservaStatus(req.params.id, status);
        res.status(200).json({ message: "Estado de la reserva actualizado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado de la reserva", error });
    }
};

// Eliminar una reserva
export const eliminarReserva = async (req, res) => {
    try {
        await deleteReserva(req.params.id);
        res.status(200).json({ message: "Reserva eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reserva", error });
    }
};

// Función para obtener las reservas de un usuario organizadas
export const obtenerReservasUsuario = async (req, res) => {
    try {
        const user_id = req.user.userId;

        // Consulta SQL mejorada con ordenamiento y filtrado
        const [reservas] = await pool.query(`
            SELECT 
                r.id,
                r.status,
                h.date AS fecha_reserva,
                DATE_FORMAT(h.date, '%d/%m/%Y') AS fecha_formateada,
                h.start_time,
                h.end_time,
                c.name AS cancha_name,
                c.image AS cancha_image,
                p.payment_status,
                CASE 
                    WHEN h.date < CURDATE() THEN 'pasado'
                    WHEN h.date = CURDATE() AND h.end_time < CURTIME() THEN 'pasado'
                    ELSE 'futuro'
                END AS estado_tiempo
            FROM reservaciones r
            JOIN horarios h ON r.horario_id = h.id
            JOIN canchas c ON h.cancha_id = c.id
            LEFT JOIN pagos p ON r.pago_id = p.id
            WHERE r.user_id = ?
            AND (
                -- Solo reservaciones futuras o de hoy que no hayan terminado
                (h.date > CURDATE()) OR 
                (h.date = CURDATE() AND h.end_time > CURTIME())
            )
            AND (
                -- Excluir canceladas de días anteriores
                NOT (r.status = 'cancelada' AND h.date < CURDATE())
            )
            ORDER BY 
                h.date ASC,            -- Orden por fecha (hoy, luego mañana)
                h.start_time ASC       -- Luego por hora de inicio
        `, [user_id]);

        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        res.status(500).json({ 
            message: "Error al obtener las reservas",
            error: error.message 
        });
    }
};