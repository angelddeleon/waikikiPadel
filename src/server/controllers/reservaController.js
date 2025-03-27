import {
    getReservas,
    getReservaById,
    getReservasPorUsuario,
    updateReservaStatus,
    deleteReserva,
} from "../models/Reserva.js";
import pool from "../config/db.js";

// Controlador de creación de reserva y pago
export const crearReserva = async (req, res) => {
    const user_id = req.user.userId;  // Obtener el user_id del token decodificado
    const { cancha_id, fecha, horarios, monto, metodoPago } = req.body;  // Obtenemos los parámetros necesarios

    if (!user_id) {
        return res.status(400).json({ message: "No se pudo obtener el ID del usuario" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();  // Iniciar transacción

        // Verificar si los horarios están disponibles
        for (const horario of horarios) {
            const { start_time, end_time } = horario;

            // Verificar si el horario ya está ocupado
            const [horarioExistente] = await connection.query(
                `SELECT id FROM horarios 
                 WHERE cancha_id = ? AND date = ? AND start_time = ? AND end_time = ?`,
                [cancha_id, fecha, start_time, end_time]
            );

            if (horarioExistente.length > 0) {
                await connection.rollback(); // Revertir la transacción si el horario ya está ocupado
                return res.status(400).json({ message: "El horario ya está ocupado" });
            }

            // Crear el horario
            const [result] = await connection.query(
                `INSERT INTO horarios (cancha_id, date, start_time, end_time, estado) 
                 VALUES (?, ?, ?, ?, 'ocupado')`,
                [cancha_id, fecha, start_time, end_time]
            );

            // Crear la reserva
            const [reservaResult] = await connection.query(
                `INSERT INTO reservaciones (user_id, horario_id, status) 
                 VALUES (?, ?, 'pendiente')`,
                [user_id, result.insertId]  // Asociamos el horario insertado con la reserva
            );

            // Almacenar el pago
            const [pagoResult] = await connection.query(
                `INSERT INTO pagos (user_id, reserva_id, amount, payment_method, payment_proof, payment_status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    reservaResult.insertId, 
                    monto, 
                    metodoPago, 
                    null,
                    "pendiente"
                ]
            );
        }

        await connection.commit();  // Confirmar la transacción
        res.status(201).json({ message: "Reserva y pago creados exitosamente" });
    } catch (error) {
        await connection.rollback();  // Revertir la transacción en caso de error
        console.error("Error al crear la reserva:", error);
        res.status(500).json({ message: "Error al crear la reserva", error });
    } finally {
        connection.release();  // Liberar la conexión
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

// Función para obtener las reservas de un usuario (incluyendo las canceladas)
export const obtenerReservasUsuario = async (req, res) => {
    try {
        const user_id = req.user.userId;

        console.log("ID recibido:", user_id);  // Verifica que el ID está llegando correctamente

        // Llamar al modelo para obtener todas las reservas del usuario
        const reservas = await getReservasPorUsuario(user_id);

        // Si no tiene reservas, devolver un array vacío
        if (!reservas || reservas.length === 0) {
            return res.status(200).json([]); // Cambié el 404 a 200 y retorno un array vacío
        }

        // Devolver todas las reservas como un array de objetos
        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener las reservas del usuario:", error);
        res.status(500).json({ message: "Error al obtener las reservas", error });
    }
};