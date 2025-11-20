const express = require('express');
const { body } = require('express-validator');
const { 
  listarExpedientes, 
  crearExpediente, 
  obtenerExpediente,
  actualizarExpediente,
  eliminarExpediente
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

// Actualizar expediente (solo el técnico que lo creó)
router.put('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  body('descripcion_general').optional().notEmpty().withMessage('Descripción no puede estar vacía'),
  body('fecha_incidente').optional().isISO8601().withMessage('Fecha de incidente debe ser válida'),
  body('lugar_incidente').optional().notEmpty().withMessage('Lugar de incidente no puede estar vacío'),
  validateRequest
], actualizarExpediente);

// Eliminar expediente (solo el técnico que lo creó)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador')
], eliminarExpediente);

// Rutas para indicios dentro de expedientes
const { 
  listarIndiciosPorExpediente, 
  crearIndicio, 
  obtenerTiposIndicio 
} = require('../controllers/indicioController');

router.get('/:id_expediente/indicios', authenticateToken, listarIndiciosPorExpediente);

router.post('/:id_expediente/indicios', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  body('numero_indicio').notEmpty().withMessage('Número de indicio requerido'),
  body('descripcion').notEmpty().withMessage('Descripción requerida'),
  body('id_tipo').isInt().withMessage('Tipo de indicio requerido'),
  body('ubicacion_hallazgo').notEmpty().withMessage('Ubicación de hallazgo requerida'),
  validateRequest
], crearIndicio);

// Ruta para obtener tipos de indicios disponibles
router.get('/tipos/indicios', authenticateToken, obtenerTiposIndicio);

// Rutas para flujo de revisión y aprobación
const { 
  enviarARevision,
  aprobarExpediente, 
  rechazarExpediente,
  listarExpedientesEnRevision,
  obtenerHistorialExpediente
} = require('../controllers/revisionController');

// Enviar expediente a revisión (solo técnicos)
router.post('/:id_expediente/enviar-revision', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador')
], enviarARevision);

// Aprobar expediente (solo coordinadores)
router.post('/:id_expediente/aprobar', [
  authenticateToken,
  authorizeRoles('Coordinador', 'Administrador'),
  body('observaciones').optional()
], aprobarExpediente);

// Rechazar expediente (solo coordinadores)
router.post('/:id_expediente/rechazar', [
  authenticateToken,
  authorizeRoles('Coordinador', 'Administrador'),
  body('justificacion').notEmpty().withMessage('Justificación requerida'),
  validateRequest
], rechazarExpediente);

// Listar expedientes en revisión (solo coordinadores)
router.get('/revision/pendientes', [
  authenticateToken,
  authorizeRoles('Coordinador', 'Administrador')
], listarExpedientesEnRevision);

// Obtener historial de un expediente
router.get('/:id_expediente/historial', authenticateToken, obtenerHistorialExpediente);

module.exports = router;