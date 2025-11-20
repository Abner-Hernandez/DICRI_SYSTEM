const sql = require('mssql');

const config = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server');
    return pool;
  } catch (error) {
    console.error('Error conectando a SQL Server:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Base de datos no conectada. Llamar connectDB() primero.');
  }
  return pool;
};

const closeDB = async () => {
  if (pool) {
    await pool.close();
    console.log('✅ Conexión a SQL Server cerrada');
  }
};

module.exports = { connectDB, getPool, closeDB, sql };