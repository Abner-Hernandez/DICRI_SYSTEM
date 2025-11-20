const express = require('express');
const { body } = require('express-validator');
const { 
  listarExpedientes, 
  crearExpediente, 
  obtenerExpediente 
} = require('../controllers/expedienteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/', authenticateToken, listarExpedientes);

router.post('/', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  body('numero_expediente').notEmpty().withMessage('Número de expediente requerido'),
  body('descripcion_general').notEmpty().withMessage('Descripción requerida'),
  validateRequest
], crearExpediente);

router.get('/:id', authenticateToken, obtenerExpediente);

module.exports = router;