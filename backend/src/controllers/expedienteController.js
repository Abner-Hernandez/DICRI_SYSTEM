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

const actualizarExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { numero_expediente, descripcion_general, fecha_incidente, lugar_incidente } = req.body;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar que el expediente existe y que el usuario tiene permisos
    const expedienteResult = await pool.request()
      .input('id_expediente', sql.Int, id)
      .query(`
        SELECT e.id_expediente, e.id_usuario_registro, e.numero_expediente, est.nombre as estado
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente
      `);

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    const expediente = expedienteResult.recordset[0];
    
    // Solo el técnico que creó el expediente puede modificarlo (o un administrador)
    const usuarioResult = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query(`
        SELECT r.nombre as rol
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario
      `);

    const rolUsuario = usuarioResult.recordset[0]?.rol;
    
    if (expediente.id_usuario_registro !== id_usuario && rolUsuario !== 'Administrador') {
      return res.status(403).json({ error: 'Solo el técnico que creó el expediente o un administrador pueden modificarlo' });
    }
    
    // Solo se puede modificar si está en estado "En Registro"
    if (expediente.estado !== 'En Registro') {
      return res.status(400).json({ error: 'Solo se pueden modificar expedientes en estado "En Registro"' });
    }

    // Si se está cambiando el número de expediente, verificar que no exista otro con el mismo número
    if (numero_expediente && numero_expediente !== expediente.numero_expediente) {
      const duplicadoResult = await pool.request()
        .input('numero_expediente', sql.VarChar, numero_expediente)
        .input('id_expediente_actual', sql.Int, id)
        .query(`
          SELECT id_expediente 
          FROM expediente 
          WHERE numero_expediente = @numero_expediente 
            AND id_expediente != @id_expediente_actual
        `);

      if (duplicadoResult.recordset.length > 0) {
        return res.status(400).json({ error: 'Ya existe un expediente con ese número' });
      }
    }

    // Actualizar el expediente
    await pool.request()
      .input('id_expediente', sql.Int, id)
      .input('numero_expediente', sql.VarChar, numero_expediente || expediente.numero_expediente)
      .input('descripcion_general', sql.VarChar, descripcion_general)
      .input('fecha_incidente', sql.Date, fecha_incidente)
      .input('lugar_incidente', sql.VarChar, lugar_incidente)
      .query(`
        UPDATE expediente 
        SET numero_expediente = @numero_expediente,
            descripcion_general = @descripcion_general,
            fecha_incidente = @fecha_incidente,
            lugar_incidente = @lugar_incidente,
            fecha_modificacion = GETDATE()
        WHERE id_expediente = @id_expediente
      `);

    res.json({ mensaje: 'Expediente actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar que el expediente existe y que el usuario tiene permisos
    const expedienteResult = await pool.request()
      .input('id_expediente', sql.Int, id)
      .query(`
        SELECT e.id_expediente, e.id_usuario_registro, est.nombre as estado
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente
      `);

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    const expediente = expedienteResult.recordset[0];
    
    // Solo el técnico que creó el expediente puede eliminarlo
    if (expediente.id_usuario_registro !== id_usuario) {
      return res.status(403).json({ error: 'Solo el técnico que creó el expediente puede eliminarlo' });
    }
    
    // Solo se puede eliminar si está en estado "En Registro"
    if (expediente.estado !== 'En Registro') {
      return res.status(400).json({ error: 'Solo se pueden eliminar expedientes en estado "En Registro"' });
    }

    // Verificar que no tenga indicios asociados
    const indiciosResult = await pool.request()
      .input('id_expediente', sql.Int, id)
      .query('SELECT COUNT(*) as total FROM indicio WHERE id_expediente = @id_expediente');

    if (indiciosResult.recordset[0].total > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un expediente que tiene indicios asociados' });
    }

    // Eliminar registros relacionados primero
    await pool.request()
      .input('id_expediente', sql.Int, id)
      .query('DELETE FROM tecnico_expediente WHERE id_expediente = @id_expediente');

    await pool.request()
      .input('id_expediente', sql.Int, id)
      .query('DELETE FROM historial_expediente WHERE id_expediente = @id_expediente');

    // Eliminar el expediente
    await pool.request()
      .input('id_expediente', sql.Int, id)
      .query('DELETE FROM expediente WHERE id_expediente = @id_expediente');

    res.json({ mensaje: 'Expediente eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  listarExpedientes, 
  crearExpediente, 
  obtenerExpediente, 
  actualizarExpediente, 
  eliminarExpediente 
};