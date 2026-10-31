require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'kieza_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 🔹 Força a sessão para UTF-8 de forma segura
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query("SET NAMES utf8mb4");
    await conn.query("SET CHARACTER SET utf8mb4");
    await conn.query("SET character_set_connection=utf8mb4");
    conn.release();
    console.log("Conectado ao banco de dados MySQL com sucesso!");
  } catch (err) {
    console.warn("Aviso ao conectar ao MySQL:", err.message);
  }
})();

module.exports = pool;
