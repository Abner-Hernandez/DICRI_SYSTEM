const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', [
  authenticateToken, 
  authorizeRoles('Administrador')
], (req, res) => {
  res.json({ mensaje: 'Listar usuarios - Por implementar' });
});

module.exports = router;
