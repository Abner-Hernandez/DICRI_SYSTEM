const { getPool, sql } = require('../config/database');

const listarIndiciosPorExpediente = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`
        SELECT i.id_indicio, i.numero_indicio, i.descripcion, i.color,
               i.tamanio, i.peso, i.ubicacion_hallazgo, i.fecha_registro,
               t.nombre as tipo_indicio,
               u.nombre + ' ' + u.apellido as tecnico_registro
        FROM indicio i
        INNER JOIN tipo_indicio t ON i.id_tipo_indicio = t.id_tipo
        INNER JOIN usuario u ON i.id_usuario_registro = u.id_usuario
        WHERE i.id_expediente = @id_expediente
        ORDER BY i.fecha_registro DESC
      `);

    res.json({ indicios: result.recordset });
  } catch (error) {
    next(error);
  }
};

const crearIndicio = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;
    const {
      numero_indicio,
      descripcion,
      color,
      tamanio,
      peso,
      ubicacion_hallazgo,
      id_tipo
    } = req.body;
    
    const id_usuario = req.user.id_usuario;

    // Verificar que el expediente esté en estado "En Registro"
    const pool = getPool();
    const expediente = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`
        SELECT e.id_estado, est.nombre as estado
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente
      `);

    if (expediente.recordset.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    if (expediente.recordset[0].estado !== 'En Registro') {
      return res.status(400).json({ 
        error: 'No se pueden agregar indicios a expedientes que no estén en estado "En Registro"' 
      });
    }

    const result = await pool.request()
      .input('numero_indicio', sql.VarChar, numero_indicio)
      .input('nombre_objeto', sql.VarChar, descripcion) // Usando descripcion como nombre_objeto temporalmente
      .input('descripcion', sql.Text, descripcion)
      .input('color', sql.VarChar, color)
      .input('tamanio', sql.VarChar, tamanio)
      .input('peso', sql.Decimal, peso)
      .input('ubicacion_hallazgo', sql.Text, ubicacion_hallazgo)
      .input('id_expediente', sql.Int, id_expediente)
      .input('id_tipo_indicio', sql.Int, id_tipo)
      .input('id_usuario_registro', sql.Int, id_usuario)
      .input('ip_address', sql.VarChar, req.ip)
      .output('id_indicio_out', sql.Int)
      .execute('sp_registrar_indicio');

    res.status(201).json({
      mensaje: 'Indicio registrado exitosamente',
      id_indicio: result.output.id_indicio_out
    });
  } catch (error) {
    next(error);
  }
};

const obtenerTiposIndicio = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT id_tipo, nombre, descripcion
      FROM tipo_indicio
      WHERE activo = 1
      ORDER BY nombre
    `);

    res.json({ tipos: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarIndiciosPorExpediente,
  crearIndicio,
  obtenerTiposIndicio
};