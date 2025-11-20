const { getPool, sql } = require('../config/database');

const obtenerMenuUsuario = async (req, res, next) => {
  try {
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    const result = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .execute('sp_obtener_menu_usuario');

    const menuPlano = result.recordset;
    
    const construirArbol = (items, idPadre = null) => {
      return items
        .filter(item => item.id_opcion_padre === idPadre)
        .map(item => ({
          id: item.id_opcion,
          nombre: item.nombre,
          ruta: item.ruta,
          icono: item.icono,
          componente: item.nombre_componente,
          incluyeEnMenu: item.ruta !== null,
          items: construirArbol(items, item.id_opcion)
        }));
    };

    const menuArbol = construirArbol(menuPlano);

    res.json({ menu: menuArbol });
  } catch (error) {
    next(error);
  }
};

const obtenerPermisosUsuario = async (req, res, next) => {
  try {
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    const result = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .execute('sp_obtener_permisos_usuario');

    res.json({ permisos: result.recordset });
  } catch (error) {
    next(error);
  }
};

const verificarPermisoUsuario = async (req, res, next) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { nombre_permiso } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .input('nombre_permiso', sql.VarChar, nombre_permiso)
      .execute('sp_verificar_permiso_usuario');

    res.json({ tiene_permiso: result.recordset[0].tiene_permiso === 1 });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  obtenerMenuUsuario, 
  obtenerPermisosUsuario,
  verificarPermisoUsuario
};