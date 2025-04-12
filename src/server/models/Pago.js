const pool = require("../config/db");

exports.createPago = async (userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus = "pendiente") => {
    const [result] = await pool.query(
        "INSERT INTO pagos (user_id, reserva_id, amount, payment_method, payment_proof, payment_status) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, reservaId, amount, paymentMethod, paymentProof, paymentStatus]
    );
    return result.insertId;
};

exports.getPagos = async () => {
    const [rows] = await pool.query("SELECT * FROM pagos");
    return rows;
};

exports.getPagoById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM pagos WHERE id = ?", [id]);
    return rows[0];
};