const { getPool, sql } = require('../config/database');

const listarExpedientes = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT e.id_expediente, e.numero_expediente, e.descripcion_general,
             e.fecha_registro, e.fecha_incidente, e.lugar_incidente,
             est.nombre as estado,
             u.nombre + ' ' + u.apellido as tecnico_registro
      FROM expediente e
      INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
      INNER JOIN usuario u ON e.id_usuario_registro = u.id_usuario
      ORDER BY e.fecha_registro DESC
    `);

    res.json({ expedientes: result.recordset });
  } catch (error) {
    next(error);
  }
};

const crearExpediente = async (req, res, next) => {
  try {
    const { numero_expediente, descripcion_general, fecha_incidente, lugar_incidente } = req.body;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    const result = await pool.request()
      .input('numero_expediente', sql.VarChar, numero_expediente)
      .input('descripcion_general', sql.Text, descripcion_general)
      .input('fecha_incidente', sql.Date, fecha_incidente)
      .input('lugar_incidente', sql.Text, lugar_incidente)
      .input('id_usuario_registro', sql.Int, id_usuario)
      .input('ip_address', sql.VarChar, req.ip)
      .output('id_expediente_out', sql.Int)
      .execute('sp_crear_expediente');

    res.status(201).json({
      mensaje: 'Expediente creado exitosamente',
      id_expediente: result.output.id_expediente_out
    });
  } catch (error) {
    next(error);
  }
};

const obtenerExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id)
      .query(`
        SELECT e.*, est.nombre as estado,
               u.nombre + ' ' + u.apellido as tecnico_registro
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        INNER JOIN usuario u ON e.id_usuario_registro = u.id_usuario
        WHERE e.id_expediente = @id_expediente
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    res.json({ expediente: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarExpedientes, crearExpediente, obtenerExpediente };