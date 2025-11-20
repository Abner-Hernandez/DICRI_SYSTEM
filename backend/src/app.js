const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const expedienteRoutes = require('./routes/expedienteRoutes');
const indicioRoutes = require('./routes/indicioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const menuRouters = require('./routes/menuRouters');

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'DICRI API'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/indicios', indicioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/menu', menuRouters);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use(errorHandler);

module.exports = app;