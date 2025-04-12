const pool = require("../config/db");

exports.getReservas = async () => {
    const [rows] = await pool.query("SELECT * FROM reservaciones");
    return rows;
};

exports.getReservaById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM reservaciones WHERE id = ?", [id]);
    return rows[0];
};