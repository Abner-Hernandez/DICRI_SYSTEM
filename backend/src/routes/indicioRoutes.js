const express = require('express');
const { body } = require('express-validator');
const { 
  obtenerIndicio,
  actualizarIndicio,
  eliminarIndicio
} = require('../controllers/indicioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Obtener un indicio específico
router.get('/:id', authenticateToken, obtenerIndicio);

// Actualizar un indicio
router.put('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  body('nombre_objeto').notEmpty().withMessage('Nombre del objeto requerido'),
  body('descripcion').notEmpty().withMessage('Descripción requerida'),
  body('tipo_evidencia').notEmpty().withMessage('Tipo de evidencia requerido'),
  body('ubicacion_hallazgo').notEmpty().withMessage('Ubicación de hallazgo requerida'),
  validateRequest
], actualizarIndicio);

// Eliminar un indicio
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador')
], eliminarIndicio);

module.exports = router;