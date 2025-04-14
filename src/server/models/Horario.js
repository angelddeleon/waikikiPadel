const pool = require("../config/db");

exports.getHorarios = async () => {
    const [rows] = await pool.query("SELECT * FROM horarios");
    return rows;
};

exports.createHorario = async (cancha_id, date, start_time, end_time, estado = "disponible") => {
    const [result] = await pool.query(
        "INSERT INTO horarios (cancha_id, date, start_time, end_time, estado) VALUES (?, ?, ?, ?, ?)",
        [cancha_id, date, start_time, end_time, estado]
    );
    return result.insertId;
};

exports.getHorarioById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM horarios WHERE id = ?", [id]);
    return rows[0];
};

exports.updateHorarioEstado = async (id, estado) => {
    await pool.query("UPDATE horarios SET estado = ? WHERE id = ?", [estado, id]);
};

exports.deleteHorario = async (id) => {
    await pool.query("DELETE FROM horarios WHERE id = ?", [id]);
};