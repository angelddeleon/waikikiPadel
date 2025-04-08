import pool from "../config/db.js";

// Crear un nuevo pago
export const createPago = async (userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus = "pendiente") => {
    const [result] = await pool.query(
        "INSERT INTO pagos (user_id, reserva_id, amount, payment_method, payment_proof, payment_status) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus]
    );
    return result.insertId;
};

// Obtener todos los pagos
export const getPagos = async () => {
    const [rows] = await pool.query("SELECT * FROM pagos");
    return rows;
};

// Obtener un pago por ID
export const getPagoById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM pagos WHERE id = ?", [id]);
    return rows[0];
};
