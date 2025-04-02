import {
    getReservas,
    getReservaById,
    getReservasPorUsuario,
    updateReservaStatus,
    deleteReserva,
} from "../models/Reserva.js";
import pool from "../config/db.js";


import fs from 'fs';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = '../uploads/comprobante/';
      fs.access(uploadPath, fs.constants.W_OK, (err) => {
          if (err) {
              console.error('No se puede escribir en la carpeta:', err);
              return cb(new Error('Error al escribir en la carpeta destino.'));
          }
          cb(null, uploadPath);
      });
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname); // Conserva el nombre original
  },
});

const upload = multer({ storage });

export const uploadImage = (req, res) => {
  return new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
          if (err) {
              console.error('Error al subir la imagen:', err);
              return reject(new Error('Error al subir la imagen'));
          }
          if (!req.body) {
              return reject(new Error('No se proporcionó ninguna imagen'));
          }
           // Usa el nombre original en tu lógica
          resolve(req.body.image); // Retorna la ruta del archivo
      });
  });
};

export const crearReserva = async (req, res) => {
    const user_id = req.user.userId;
    const { cancha_id, fecha, horarios, monto, metodoPago, nombreImg } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "No se pudo obtener el ID del usuario" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener el valor de monto de la tabla tasa donde id = 1
        const [tasaResult] = await connection.query(
            `SELECT monto FROM tasa WHERE id = 1`
        );

        if (tasaResult.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: "No se encontró la tasa configurada" });
        }

        const tasa_monto = tasaResult[0].monto;

        // Insertar en pagos (asegúrate que la columna en la tabla se llame igual)
        const [pagoResult] = await connection.query(
            `INSERT INTO pagos 
            (user_id, amount, payment_method, payment_proof, payment_status, tasa_valor) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, monto, metodoPago, nombreImg, "pendiente", tasa_monto]
        );
        const pago_id = pagoResult.insertId;

        // Then create each reservation with the same payment ID
        for (const horario of horarios) {
            const { start_time, end_time } = horario;

            // Verify if the schedule is available
            const [horarioExistente] = await connection.query(
                `SELECT id FROM horarios 
                 WHERE cancha_id = ? AND date = ? AND start_time = ? AND end_time = ?`,
                [cancha_id, fecha, start_time, end_time]
            );

            if (horarioExistente.length > 0) {
                await connection.rollback();
                return res.status(400).json({ message: "El horario ya está ocupado" });
            }

            // Create the schedule
            const [horarioResult] = await connection.query(
                `INSERT INTO horarios (cancha_id, date, start_time, end_time, estado) 
                 VALUES (?, ?, ?, ?, 'ocupado')`,
                [cancha_id, fecha, start_time, end_time]
            );

            // Create the reservation with the payment ID
            await connection.query(
                `INSERT INTO reservaciones (user_id, horario_id, pago_id, status) 
                 VALUES (?, ?, ?, 'pendiente')`,
                [user_id, horarioResult.insertId, pago_id]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            message: "Reserva y pago creados exitosamente",
            pago_id: pago_id
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error al crear la reserva:", error);
        res.status(500).json({ message: "Error al crear la reserva", error });
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