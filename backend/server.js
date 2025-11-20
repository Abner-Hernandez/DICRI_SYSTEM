require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.API_PORT || 5000;
const HOST = process.env.API_HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();
    console.log('Conexión a SQL Server establecida');

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});
