import pool from "../config/db.js";

// Obtener todas las canchas
export const getCanchas = async () => {
    const [rows] = await pool.query("SELECT * FROM canchas");
    return rows;
};

// Crear una nueva cancha
export const createCancha = async (name, image, pricePerHour) => {
    const [result] = await pool.query(
        "INSERT INTO canchas (name, image, price_per_hour) VALUES (?, ?, ?)",
        [name, image, pricePerHour]
    );
    return result.insertId;
};

// Obtener una cancha por ID
export const getCanchaById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM canchas WHERE id = ?", [id]);
    return rows[0];
};

