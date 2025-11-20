const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ mensaje: 'Listar indicios - Por implementar' });
});

router.post('/', authenticateToken, (req, res) => {
  res.json({ mensaje: 'Crear indicio - Por implementar' });
});

module.exports = router;