const pool = require("../config/db");

exports.getCanchas = async () => {
    const [rows] = await pool.query("SELECT * FROM canchas");
    return rows;
};

exports.createCancha = async (name, image, pricePerHour) => {
    const [result] = await pool.query(
        "INSERT INTO canchas (name, image, price_per_hour) VALUES (?, ?, ?)",
        [name, image, pricePerHour]
    );
    return result.insertId;
};

exports.getCanchaById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM canchas WHERE id = ?", [id]);
    return rows[0];
};