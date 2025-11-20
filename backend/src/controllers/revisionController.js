const { getPool, sql } = require('../config/database');

const enviarARevision = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar que el expediente tenga al menos un indicio
    const indicios = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query('SELECT COUNT(*) as total FROM indicio WHERE id_expediente = @id_expediente');

    if (indicios.recordset[0].total === 0) {
      return res.status(400).json({ 
        error: 'El expediente debe tener al menos un indicio para enviarse a revisión' 
      });
    }

    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .input('id_usuario', sql.Int, id_usuario)
      .input('ip_address', sql.VarChar, req.ip)
      .execute('sp_enviar_a_revision');

    res.json({ mensaje: 'Expediente enviado a revisión exitosamente' });
  } catch (error) {
    next(error);
  }
};

const aprobarExpediente = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;
    const { observaciones } = req.body;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .input('id_usuario', sql.Int, id_usuario)
      .input('observaciones', sql.Text, observaciones || '')
      .input('ip_address', sql.VarChar, req.ip)
      .execute('sp_aprobar_expediente');

    res.json({ mensaje: 'Expediente aprobado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const rechazarExpediente = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;
    const { justificacion } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!justificacion || justificacion.trim().length === 0) {
      return res.status(400).json({ 
        error: 'La justificación es requerida para rechazar un expediente' 
      });
    }

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .input('id_usuario', sql.Int, id_usuario)
      .input('justificacion', sql.Text, justificacion)
      .input('ip_address', sql.VarChar, req.ip)
      .execute('sp_rechazar_expediente');

    res.json({ mensaje: 'Expediente rechazado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const listarExpedientesEnRevision = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT e.id_expediente, e.numero_expediente, e.descripcion_general,
             e.fecha_registro, e.fecha_incidente, e.lugar_incidente,
             est.nombre as estado,
             u.nombre + ' ' + u.apellido as tecnico_registro,
             COUNT(i.id_indicio) as total_indicios
      FROM expediente e
      INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
      INNER JOIN usuario u ON e.id_usuario_registro = u.id_usuario
      LEFT JOIN indicio i ON e.id_expediente = i.id_expediente
      WHERE est.nombre = 'En Revisión'
      GROUP BY e.id_expediente, e.numero_expediente, e.descripcion_general,
               e.fecha_registro, e.fecha_incidente, e.lugar_incidente,
               est.nombre, u.nombre, u.apellido
      ORDER BY e.fecha_registro DESC
    `);

    res.json({ expedientes: result.recordset });
  } catch (error) {
    next(error);
  }
};

const obtenerHistorialExpediente = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`
        SELECT h.accion, h.observaciones, h.fecha_accion,
               u.nombre + ' ' + u.apellido as usuario
        FROM historial_expediente h
        INNER JOIN usuario u ON h.id_usuario = u.id_usuario
        WHERE h.id_expediente = @id_expediente
        ORDER BY h.fecha_accion DESC
      `);

    res.json({ historial: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enviarARevision,
  aprobarExpediente,
  rechazarExpediente,
  listarExpedientesEnRevision,
  obtenerHistorialExpediente
};