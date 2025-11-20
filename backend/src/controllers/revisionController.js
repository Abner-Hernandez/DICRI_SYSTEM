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
      .input('id_usuario_coordinador', sql.Int, id_usuario)
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
      .input('id_usuario_coordinador', sql.Int, id_usuario)
      .input('justificacion_rechazo', sql.VarChar, justificacion)
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
             ISNULL(indicios_count.total_indicios, 0) as total_indicios
      FROM expediente e
      INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
      INNER JOIN usuario u ON e.id_usuario_registro = u.id_usuario
      LEFT JOIN (
        SELECT id_expediente, COUNT(*) as total_indicios
        FROM indicio
        GROUP BY id_expediente
      ) indicios_count ON e.id_expediente = indicios_count.id_expediente
      WHERE est.nombre = 'En Revisión'
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
        SELECT 
          CASE 
            WHEN h.id_estado_anterior IS NULL THEN 'Expediente creado'
            WHEN est_nuevo.nombre = 'En Revisión' THEN 'Enviado a revisión'
            WHEN est_nuevo.nombre = 'Aprobado' THEN 'Expediente aprobado'
            WHEN est_nuevo.nombre = 'En Registro' AND est_anterior.nombre = 'En Revisión' THEN 'Expediente rechazado'
            ELSE 'Cambio de estado'
          END as accion,
          h.comentario as observaciones,
          h.fecha_cambio as fecha_accion,
          u.nombre + ' ' + u.apellido as usuario,
          ISNULL(est_anterior.nombre, '') as estado_anterior,
          est_nuevo.nombre as estado_nuevo
        FROM historial_expediente h
        INNER JOIN usuario u ON h.id_usuario = u.id_usuario
        INNER JOIN estado_expediente est_nuevo ON h.id_estado_nuevo = est_nuevo.id_estado
        LEFT JOIN estado_expediente est_anterior ON h.id_estado_anterior = est_anterior.id_estado
        WHERE h.id_expediente = @id_expediente
        ORDER BY h.fecha_cambio DESC
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