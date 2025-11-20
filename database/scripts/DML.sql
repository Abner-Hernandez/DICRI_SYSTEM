USE DICRI_DB;
GO

INSERT INTO rol (nombre, descripcion) VALUES
('Técnico', 'Personal de campo que recolecta evidencias en la escena del crimen'),
('Coordinador', 'Supervisor que revisa y aprueba/rechaza expedientes'),
('Administrador', 'Gestión completa del sistema y usuarios');
GO

INSERT INTO estado_expediente (nombre, descripcion) VALUES
('En Registro', 'Expediente abierto, los técnicos están registrando indicios'),
('En Revisión', 'Expediente enviado al coordinador para validación'),
('Aprobado', 'Expediente validado y cerrado exitosamente'),
('Rechazado', 'Expediente devuelto para correcciones');
GO

INSERT INTO tipo_indicio (nombre, descripcion) VALUES
('Material', 'Objetos físicos tangibles'),
('Digital', 'Evidencia electrónica o informática'),
('Biológico', 'Muestras orgánicas, ADN, fluidos'),
('Balístico', 'Armas de fuego, proyectiles, casquillos'),
('Documental', 'Documentos, escritos, registros'),
('Fotográfico', 'Imágenes, videos de la escena');
GO

INSERT INTO permiso (nombre, descripcion, modulo) VALUES
('crear_expediente', 'Crear nuevos expedientes', 'Expedientes'),
('editar_expediente', 'Modificar expedientes existentes', 'Expedientes'),
('ver_expediente', 'Visualizar expedientes', 'Expedientes'),
('aprobar_expediente', 'Aprobar expedientes en revisión', 'Expedientes'),
('rechazar_expediente', 'Rechazar expedientes para corrección', 'Expedientes'),
('registrar_indicio', 'Agregar indicios a expedientes', 'Indicios'),
('editar_indicio', 'Modificar indicios existentes', 'Indicios'),
('eliminar_indicio', 'Eliminar indicios', 'Indicios'),
('ver_auditoria', 'Consultar registros de auditoría', 'Auditoría'),
('gestionar_usuarios', 'Crear, editar y eliminar usuarios', 'Usuarios'),
('generar_reportes', 'Generar informes y estadísticas', 'Reportes');
GO

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'Técnico'
AND p.nombre IN ('crear_expediente', 'editar_expediente', 'ver_expediente', 
                 'registrar_indicio', 'editar_indicio');
GO

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'Coordinador'
AND p.nombre IN ('ver_expediente', 'aprobar_expediente', 'rechazar_expediente', 
                 'ver_auditoria', 'generar_reportes');
GO

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'Administrador';
GO

INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol) VALUES
('Admin', 'Sistema', 'admin@dicri.gob.gt', '$2b$10$lPi8Z.hPTq698c8vVa7pf.0sT08BTr.QpIELXEO7t1K0196XvXQfe', 
 (SELECT id_rol FROM rol WHERE nombre = 'Administrador'));
GO

INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol) VALUES
('Juan', 'Pérez', 'juan.perez@dicri.gob.gt', '$2b$10$lPi8Z.hPTq698c8vVa7pf.0sT08BTr.QpIELXEO7t1K0196XvXQfe', 
 (SELECT id_rol FROM rol WHERE nombre = 'Técnico')),
('María', 'López', 'maria.lopez@dicri.gob.gt', '$2b$10$lPi8Z.hPTq698c8vVa7pf.0sT08BTr.QpIELXEO7t1K0196XvXQfe', 
 (SELECT id_rol FROM rol WHERE nombre = 'Coordinador'));
GO

-- Opciones de menú: Se modifican para incluir 'nombre_componente'

USE DICRI_DB;
GO

-- 1. Insertar opciones raíz (incluyendo nombre_componente)
-- Nota: 'Inicio' y 'Expedientes' son contenedores, 'Auditoría' es navegable.
INSERT INTO opcion_menu (nombre, ruta, icono, id_opcion_padre, orden, activo, requiere_permiso, nombre_componente) VALUES
('Inicio', '/inicio', 'HomeIcon', NULL, 1, 1, 0, 'ExpedientesLista'),
('Expedientes', NULL, 'FolderIcon', NULL, 2, 1, 0, NULL),
('Reportes', NULL, 'AssessmentIcon', NULL, 3, 1, 0, NULL),
('Administración', NULL, 'SettingsIcon', NULL, 4, 1, 1, NULL),
('Auditoría', '/auditoria', 'HistoryIcon', NULL, 5, 1, 1, 'AuditoriaLista');
GO

DECLARE @id_expedientes INT, @id_reportes INT, @id_admin INT;

SELECT @id_expedientes = id_opcion FROM opcion_menu WHERE nombre = 'Expedientes';
SELECT @id_reportes = id_opcion FROM opcion_menu WHERE nombre = 'Reportes';
SELECT @id_admin = id_opcion FROM opcion_menu WHERE nombre = 'Administración';

-- 2. Insertar sub-opciones de Expedientes (incluyendo nombre_componente)
INSERT INTO opcion_menu (nombre, ruta, icono, id_opcion_padre, orden, activo, requiere_permiso, nombre_componente) VALUES
('Nuevo Expediente', '/expedientes/nuevo', 'AddIcon', @id_expedientes, 1, 1, 1, 'NuevoExpediente'),
('Mis Expedientes', '/expedientes/mis-expedientes', 'ListIcon', @id_expedientes, 2, 1, 1, 'ExpedientesLista'),
('En Revisión', '/expedientes/revision', 'RateReviewIcon', @id_expedientes, 3, 1, 1, 'ExpedientesLista'),
('Todos los Expedientes', '/expedientes/todos', 'ViewListIcon', @id_expedientes, 4, 1, 1, 'ExpedientesLista'),
('Expedientes Aprobados', '/expedientes/aprobados', 'CheckCircleIcon', @id_expedientes, 5, 1, 1, 'ExpedientesLista');

-- 3. Insertar sub-opciones de Reportes (incluyendo nombre_componente)
INSERT INTO opcion_menu (nombre, ruta, icono, id_opcion_padre, orden, activo, requiere_permiso, nombre_componente) VALUES
('Reporte de Expedientes', '/reportes/expedientes', 'DescriptionIcon', @id_reportes, 1, 1, 1, 'ReporteExpedientes'),
('Estadísticas', '/reportes/estadisticas', 'BarChartIcon', @id_reportes, 2, 1, 1, 'ReporteEstadisticas'),
('Reporte de Indicios', '/reportes/indicios', 'BallotIcon', @id_reportes, 3, 1, 1, 'ReporteIndicios');

-- 4. Insertar sub-opciones de Administración (incluyendo nombre_componente)
INSERT INTO opcion_menu (nombre, ruta, icono, id_opcion_padre, orden, activo, requiere_permiso, nombre_componente) VALUES
('Usuarios', '/admin/usuarios', 'PeopleIcon', @id_admin, 1, 1, 1, 'UsuariosGestion'), -- Cambiado de CrearUsuario a UsuariosGestion
('Roles y Permisos', '/admin/roles', 'SecurityIcon', @id_admin, 2, 1, 1, 'RolesPermisos'),
('Tipos de Indicio', '/admin/tipos-indicio', 'CategoryIcon', @id_admin, 3, 1, 1, 'TiposIndicio');
GO

-- Permisos de menú (iguales que antes)

INSERT INTO permiso (nombre, descripcion, modulo) VALUES
('ver_menu_expedientes', 'Ver menú de expedientes', 'Menu'),
('crear_expediente_menu', 'Acceso a crear expediente desde menú', 'Menu'),
('ver_mis_expedientes_menu', 'Ver mis expedientes en menú', 'Menu'),
('ver_expedientes_revision_menu', 'Ver expedientes en revisión en menú', 'Menu'),
('ver_todos_expedientes_menu', 'Ver todos los expedientes en menú', 'Menu'),
('ver_expedientes_aprobados_menu', 'Ver expedientes aprobados en menú', 'Menu'),
('ver_menu_reportes', 'Ver menú de reportes', 'Menu'),
('ver_reporte_expedientes_menu', 'Acceso a reporte de expedientes', 'Menu'),
('ver_estadisticas_menu', 'Ver estadísticas en menú', 'Menu'),
('ver_reporte_indicios_menu', 'Ver reporte de indicios', 'Menu'),
('ver_menu_administracion', 'Ver menú de administración', 'Menu'),
('ver_usuarios_menu', 'Gestionar usuarios desde menú', 'Menu'),
('ver_roles_menu', 'Gestionar roles desde menú', 'Menu'),
('ver_tipos_indicio_menu', 'Gestionar tipos de indicio', 'Menu'),
('ver_auditoria_menu', 'Ver auditoría desde menú', 'Menu');
GO

DECLARE @id_expedientes INT, @id_nuevo_exp INT, @id_mis_exp INT, @id_revision INT, 
        @id_todos_exp INT, @id_aprobados INT, @id_reportes INT, @id_rep_exp INT,
        @id_estadisticas INT, @id_rep_indicios INT, @id_admin INT, @id_usuarios INT,
        @id_roles INT, @id_tipos INT, @id_auditoria INT;

SELECT @id_expedientes = id_opcion FROM opcion_menu WHERE nombre = 'Expedientes';
SELECT @id_nuevo_exp = id_opcion FROM opcion_menu WHERE nombre = 'Nuevo Expediente';
SELECT @id_mis_exp = id_opcion FROM opcion_menu WHERE nombre = 'Mis Expedientes';
SELECT @id_revision = id_opcion FROM opcion_menu WHERE nombre = 'En Revisión';
SELECT @id_todos_exp = id_opcion FROM opcion_menu WHERE nombre = 'Todos los Expedientes';
SELECT @id_aprobados = id_opcion FROM opcion_menu WHERE nombre = 'Expedientes Aprobados';
SELECT @id_reportes = id_opcion FROM opcion_menu WHERE nombre = 'Reportes';
SELECT @id_rep_exp = id_opcion FROM opcion_menu WHERE nombre = 'Reporte de Expedientes';
SELECT @id_estadisticas = id_opcion FROM opcion_menu WHERE nombre = 'Estadísticas';
SELECT @id_rep_indicios = id_opcion FROM opcion_menu WHERE nombre = 'Reporte de Indicios';
SELECT @id_admin = id_opcion FROM opcion_menu WHERE nombre = 'Administración';
SELECT @id_usuarios = id_opcion FROM opcion_menu WHERE nombre = 'Usuarios';
SELECT @id_roles = id_opcion FROM opcion_menu WHERE nombre = 'Roles y Permisos';
SELECT @id_tipos = id_opcion FROM opcion_menu WHERE nombre = 'Tipos de Indicio';
SELECT @id_auditoria = id_opcion FROM opcion_menu WHERE nombre = 'Auditoría';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_expedientes
FROM permiso p WHERE p.nombre = 'ver_menu_expedientes';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_nuevo_exp
FROM permiso p WHERE p.nombre = 'crear_expediente_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_mis_exp
FROM permiso p WHERE p.nombre = 'ver_mis_expedientes_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_revision
FROM permiso p WHERE p.nombre = 'ver_expedientes_revision_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_todos_exp
FROM permiso p WHERE p.nombre = 'ver_todos_expedientes_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_aprobados
FROM permiso p WHERE p.nombre = 'ver_expedientes_aprobados_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_reportes
FROM permiso p WHERE p.nombre = 'ver_menu_reportes';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_rep_exp
FROM permiso p WHERE p.nombre = 'ver_reporte_expedientes_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_estadisticas
FROM permiso p WHERE p.nombre = 'ver_estadisticas_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_rep_indicios
FROM permiso p WHERE p.nombre = 'ver_reporte_indicios_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_admin
FROM permiso p WHERE p.nombre = 'ver_menu_administracion';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_usuarios
FROM permiso p WHERE p.nombre = 'ver_usuarios_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_roles
FROM permiso p WHERE p.nombre = 'ver_roles_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_tipos
FROM permiso p WHERE p.nombre = 'ver_tipos_indicio_menu';

INSERT INTO permiso_opcion_menu (id_permiso, id_opcion)
SELECT p.id_permiso, @id_auditoria
FROM permiso p WHERE p.nombre = 'ver_auditoria_menu';
GO

DECLARE @id_tecnico INT, @id_coordinador INT, @id_admin INT;

SELECT @id_tecnico = id_rol FROM rol WHERE nombre = 'Técnico';
SELECT @id_coordinador = id_rol FROM rol WHERE nombre = 'Coordinador';
SELECT @id_admin = id_rol FROM rol WHERE nombre = 'Administrador';

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT @id_tecnico, p.id_permiso
FROM permiso p
WHERE p.nombre IN (
    'ver_menu_expedientes',
    'crear_expediente_menu',
    'ver_mis_expedientes_menu'
);

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT @id_coordinador, p.id_permiso
FROM permiso p
WHERE p.nombre IN (
    'ver_menu_expedientes',
    'ver_expedientes_revision_menu',
    'ver_todos_expedientes_menu',
    'ver_expedientes_aprobados_menu',
    'ver_menu_reportes',
    'ver_reporte_expedientes_menu',
    'ver_estadisticas_menu',
    'ver_reporte_indicios_menu',
    'ver_auditoria_menu'
);

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT @id_admin, p.id_permiso
FROM permiso p
WHERE p.modulo = 'Menu';
GO