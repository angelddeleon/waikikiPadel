import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "waikikip_admin",
    password: "*Qe0_$Z%XwIY" ,
    database: "waikikip_waikiki",
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
});

export default pool;

/**
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
 */