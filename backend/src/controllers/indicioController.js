const { getPool, sql } = require('../config/database');

const listarIndiciosPorExpediente = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;

    const pool = getPool();
    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`
        SELECT i.id_indicio, i.numero_indicio, i.nombre_objeto, i.descripcion, i.color,
               i.tamanio, i.peso, i.unidad_peso, i.ubicacion_hallazgo, i.fecha_registro,
               i.observaciones,
               COALESCE(t.nombre, 'Sin tipo') as tipo_evidencia,
               CONVERT(varchar, i.fecha_registro, 23) as fecha_registro_formatted,
               u.nombre + ' ' + u.apellido as tecnico_registro
        FROM indicio i
        LEFT JOIN tipo_indicio t ON i.id_tipo_indicio = t.id_tipo
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
      nombre_objeto,
      descripcion,
      ubicacion_hallazgo,
      id_tipo_indicio,
      observaciones,
      color,
      tamanio,
      peso,
      unidad_peso
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

    // Validar que el tipo de indicio existe si se proporciona
    if (id_tipo_indicio) {
      const tipoResult = await pool.request()
        .input('id_tipo', sql.Int, id_tipo_indicio)
        .query(`SELECT id_tipo FROM tipo_indicio WHERE id_tipo = @id_tipo`);

      if (tipoResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Tipo de indicio no válido' });
      }
    }

    const result = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .input('numero_indicio', sql.VarChar, numero_indicio)
      .input('nombre_objeto', sql.VarChar, nombre_objeto)
      .input('descripcion', sql.VarChar, descripcion)
      .input('color', sql.VarChar, color || null)
      .input('tamanio', sql.VarChar, tamanio || null)
      .input('peso', sql.Decimal, peso ? parseFloat(peso) : null)
      .input('unidad_peso', sql.VarChar, unidad_peso || null)
      .input('ubicacion_hallazgo', sql.VarChar, ubicacion_hallazgo)
      .input('id_tipo_indicio', sql.Int, id_tipo_indicio || null)
      .input('id_usuario_registro', sql.Int, id_usuario)
      .input('observaciones', sql.VarChar, observaciones || null)
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
      ORDER BY nombre
    `);

    res.json({ tipos: result.recordset });
  } catch (error) {
    next(error);
  }
};

const obtenerSiguienteNumeroIndicio = async (req, res, next) => {
  try {
    const { id_expediente } = req.params;
    
    const pool = getPool();
    
    // Obtener el número de expediente para formar el número de indicio
    const expedienteResult = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`SELECT numero_expediente FROM expediente WHERE id_expediente = @id_expediente`);
    
    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    const numeroExpediente = expedienteResult.recordset[0].numero_expediente;

    // Contar indicios existentes para este expediente
    const conteoResult = await pool.request()
      .input('id_expediente', sql.Int, id_expediente)
      .query(`SELECT COUNT(*) as total FROM indicio WHERE id_expediente = @id_expediente`);
    
    const siguienteNumero = conteoResult.recordset[0].total + 1;
    const numeroIndicio = `${numeroExpediente}-IND-${siguienteNumero.toString().padStart(3, '0')}`;

    res.json({ numero_indicio: numeroIndicio });
  } catch (error) {
    next(error);
  }
};

const obtenerIndicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();
    const result = await pool.request()
      .input('id_indicio', sql.Int, id)
      .query(`
        SELECT i.id_indicio, i.numero_indicio, i.nombre_objeto, i.descripcion, i.color,
               i.tamanio, i.peso, i.unidad_peso, i.ubicacion_hallazgo, 
               i.fecha_registro, i.observaciones,
               COALESCE(t.nombre, 'Sin tipo') as tipo_evidencia,
               CONVERT(varchar, i.fecha_registro, 23) as fecha_registro_formatted,
               u.nombre + ' ' + u.apellido as tecnico_registro
        FROM indicio i
        LEFT JOIN tipo_indicio t ON i.id_tipo_indicio = t.id_tipo
        INNER JOIN usuario u ON i.id_usuario_registro = u.id_usuario
        WHERE i.id_indicio = @id_indicio
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Indicio no encontrado' });
    }

    res.json({ indicio: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

const actualizarIndicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre_objeto,
      descripcion,
      tipo_evidencia,
      ubicacion_hallazgo,
      observaciones,
      color,
      tamanio,
      peso,
      unidad_peso
    } = req.body;
    
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar que el indicio existe
    const indicioResult = await pool.request()
      .input('id_indicio', sql.Int, id)
      .query(`
        SELECT i.id_indicio, i.id_expediente, i.id_usuario_registro,
               e.id_estado, est.nombre as estado_expediente
        FROM indicio i
        INNER JOIN expediente e ON i.id_expediente = e.id_expediente
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE i.id_indicio = @id_indicio
      `);

    if (indicioResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Indicio no encontrado' });
    }

    const indicio = indicioResult.recordset[0];
    
    // Verificar que el expediente esté en estado "En Registro"
    if (indicio.estado_expediente !== 'En Registro') {
      return res.status(400).json({ 
        error: 'Solo se pueden editar indicios de expedientes en estado "En Registro"' 
      });
    }

    // Verificar permisos (técnico que creó el indicio o administrador)
    const usuarioResult = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query(`
        SELECT r.nombre as rol
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario
      `);

    const rolUsuario = usuarioResult.recordset[0]?.rol;
    
    if (indicio.id_usuario_registro !== id_usuario && rolUsuario !== 'Administrador') {
      return res.status(403).json({ 
        error: 'Solo el técnico que registró el indicio o un administrador pueden modificarlo' 
      });
    }

    // Buscar o crear el tipo de indicio
    let tipoResult = await pool.request()
      .input('nombre_tipo', sql.VarChar, tipo_evidencia)
      .query(`SELECT id_tipo FROM tipo_indicio WHERE nombre = @nombre_tipo`);

    let id_tipo_indicio = null;
    if (tipoResult.recordset.length === 0) {
      // Crear nuevo tipo de indicio si no existe
      const nuevoTipo = await pool.request()
        .input('nombre_tipo', sql.VarChar, tipo_evidencia)
        .input('descripcion_tipo', sql.VarChar, `Tipo de evidencia: ${tipo_evidencia}`)
        .query(`
          INSERT INTO tipo_indicio (nombre, descripcion) 
          VALUES (@nombre_tipo, @descripcion_tipo);
          SELECT SCOPE_IDENTITY() as id_tipo;
        `);
      id_tipo_indicio = nuevoTipo.recordset[0].id_tipo;
    } else {
      id_tipo_indicio = tipoResult.recordset[0].id_tipo;
    }

    // Actualizar el indicio
    await pool.request()
      .input('id_indicio', sql.Int, id)
      .input('nombre_objeto', sql.VarChar, nombre_objeto)
      .input('descripcion', sql.VarChar, descripcion)
      .input('ubicacion_hallazgo', sql.VarChar, ubicacion_hallazgo)
      .input('id_tipo_indicio', sql.Int, id_tipo_indicio)
      .input('observaciones', sql.VarChar, observaciones)
      .input('color', sql.VarChar, color || null)
      .input('tamanio', sql.VarChar, tamanio || null)
      .input('peso', sql.Decimal, peso ? parseFloat(peso) : null)
      .input('unidad_peso', sql.VarChar, unidad_peso || null)
      .query(`
        UPDATE indicio 
        SET nombre_objeto = @nombre_objeto,
            descripcion = @descripcion,
            ubicacion_hallazgo = @ubicacion_hallazgo,
            id_tipo_indicio = @id_tipo_indicio,
            observaciones = @observaciones,
            color = @color,
            tamanio = @tamanio,
            peso = @peso,
            unidad_peso = @unidad_peso
        WHERE id_indicio = @id_indicio
      `);

    res.json({ mensaje: 'Indicio actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarIndicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar que el indicio existe
    const indicioResult = await pool.request()
      .input('id_indicio', sql.Int, id)
      .query(`
        SELECT i.id_indicio, i.id_expediente, i.id_usuario_registro,
               e.id_estado, est.nombre as estado_expediente
        FROM indicio i
        INNER JOIN expediente e ON i.id_expediente = e.id_expediente
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE i.id_indicio = @id_indicio
      `);

    if (indicioResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Indicio no encontrado' });
    }

    const indicio = indicioResult.recordset[0];
    
    // Verificar que el expediente esté en estado "En Registro"
    if (indicio.estado_expediente !== 'En Registro') {
      return res.status(400).json({ 
        error: 'Solo se pueden eliminar indicios de expedientes en estado "En Registro"' 
      });
    }

    // Verificar permisos (técnico que creó el indicio o administrador)
    const usuarioResult = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query(`
        SELECT r.nombre as rol
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario
      `);

    const rolUsuario = usuarioResult.recordset[0]?.rol;
    
    if (indicio.id_usuario_registro !== id_usuario && rolUsuario !== 'Administrador') {
      return res.status(403).json({ 
        error: 'Solo el técnico que registró el indicio o un administrador pueden eliminarlo' 
      });
    }

    // Eliminar adjuntos si existen
    await pool.request()
      .input('id_indicio', sql.Int, id)
      .query('DELETE FROM adjunto_indicio WHERE id_indicio = @id_indicio');

    // Eliminar el indicio
    await pool.request()
      .input('id_indicio', sql.Int, id)
      .query('DELETE FROM indicio WHERE id_indicio = @id_indicio');

    res.json({ mensaje: 'Indicio eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarIndiciosPorExpediente,
  crearIndicio,
  obtenerTiposIndicio,
  obtenerSiguienteNumeroIndicio,
  obtenerIndicio,
  actualizarIndicio,
  eliminarIndicio
};