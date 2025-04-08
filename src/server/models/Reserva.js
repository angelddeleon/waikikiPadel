import pool from "../config/db.js";

// Obtener todas las reservas
export const getReservas = async () => {
    const [rows] = await pool.query("SELECT * FROM reservaciones");
    return rows;
};

// Obtener una reserva por ID
export const getReservaById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM reservaciones WHERE id = ?", [id]);
    return rows[0];
};

