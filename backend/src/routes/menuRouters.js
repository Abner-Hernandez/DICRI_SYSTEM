const express = require('express');
const { 
  obtenerMenuUsuario, 
  obtenerPermisosUsuario,
  verificarPermisoUsuario 
} = require('../controllers/menu');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, obtenerMenuUsuario);
router.get('/permisos', authenticateToken, obtenerPermisosUsuario);
router.post('/verificar-permiso', authenticateToken, verificarPermisoUsuario);

module.exports = router;