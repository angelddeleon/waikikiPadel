const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "waikikip_admin",
    password: "K(ivE][]T1{b",
    database: "waikikip_waikiki",
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
});

module.exports = pool;

/**
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "#Lo28de06",
    database: "waikiki",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;
*/