import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "#Lo28de06" ,
    database: "waikiki",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;

/*
const pool = mysql.createPool({
    host: "localhost",
    user: "waikikip_Admin", 
    password: "3xU06)sn0TDH" ,
    database: "waikikip_padel",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
*/