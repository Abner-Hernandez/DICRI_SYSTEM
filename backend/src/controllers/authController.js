const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT u.id_usuario, u.nombre, u.apellido, u.email, 
               u.password_hash, u.activo, r.nombre as rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.recordset[0];

    if (!usuario.activo) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);

    // console.log(password);
    // console.log(usuario.password_hash);
    // console.log(passwordMatch);
    // console.log(await bcrypt.hash("password123", 10));

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        email: usuario.email,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({ usuario: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };