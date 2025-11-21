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

-- inserción de insumos

USE DICRI_DB;
GO

DECLARE @id_tecnico INT, @id_coordinador INT;
DECLARE @id_estado_registro INT, @id_estado_revision INT, @id_estado_aprobado INT;
DECLARE @id_expediente INT, @contador INT;

SELECT @id_tecnico = id_usuario FROM usuario WHERE email = 'juan.perez@dicri.gob.gt';
SELECT @id_coordinador = id_usuario FROM usuario WHERE email = 'maria.lopez@dicri.gob.gt';

SELECT @id_estado_registro = id_estado FROM estado_expediente WHERE nombre = 'En Registro';
SELECT @id_estado_revision = id_estado FROM estado_expediente WHERE nombre = 'En Revisión';
SELECT @id_estado_aprobado = id_estado FROM estado_expediente WHERE nombre = 'Aprobado';

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado, fecha_aprobacion, id_usuario_aprobacion)
VALUES ('EXP-2024-001', 'Robo con violencia en comercio local', '2024-01-15', 'Zona 1, Ciudad de Guatemala', DATEADD(DAY, -45, GETDATE()), @id_tecnico, @id_estado_aprobado, DATEADD(DAY, -40, GETDATE()), @id_coordinador);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -45, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -45, GETDATE()), 'Expediente creado');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_registro, @id_estado_revision, @id_tecnico, DATEADD(DAY, -43, GETDATE()), 'Expediente enviado a revisión');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_revision, @id_estado_aprobado, @id_coordinador, DATEADD(DAY, -40, GETDATE()), 'Expediente aprobado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Pistola calibre 9mm', 'Arma de fuego marca Glock modelo 19', 'Negro', '20cm x 15cm', 850.00, 'gramos', 'Mostrador principal', 4, @id_tecnico, DATEADD(DAY, -45, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Casquillos de bala', 'Tres casquillos calibre 9mm', 'Dorado', '2cm', 15.00, 'gramos', 'Piso junto a la caja registradora', 4, @id_tecnico, DATEADD(DAY, -45, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Pasamontañas', 'Máscara negra usada por el sospechoso', 'Negro', '30cm x 25cm', 120.00, 'gramos', 'Entrada del establecimiento', 1, @id_tecnico, DATEADD(DAY, -45, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado, fecha_aprobacion, id_usuario_aprobacion)
VALUES ('EXP-2024-002', 'Homicidio en vía pública', '2024-02-10', 'Zona 18, Colonia Santa Fé', DATEADD(DAY, -38, GETDATE()), @id_tecnico, @id_estado_aprobado, DATEADD(DAY, -35, GETDATE()), @id_coordinador);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -38, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -38, GETDATE()), 'Expediente creado');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_registro, @id_estado_revision, @id_tecnico, DATEADD(DAY, -36, GETDATE()), 'Expediente enviado a revisión');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_revision, @id_estado_aprobado, @id_coordinador, DATEADD(DAY, -35, GETDATE()), 'Expediente aprobado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Muestra de sangre', 'Muestra biológica tomada del lugar', 'Rojo oscuro', '5ml', 5.00, 'ml', 'Acera frente al poste de luz', 3, @id_tecnico, DATEADD(DAY, -38, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Proyectil', 'Proyectil calibre 38 recuperado', 'Plateado', '3cm', 8.50, 'gramos', 'Pared del edificio', 4, @id_tecnico, DATEADD(DAY, -38, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Celular víctima', 'Teléfono Samsung Galaxy S21', 'Negro', '15cm x 7cm', 180.00, 'gramos', 'Junto al cuerpo de la víctima', 2, @id_tecnico, DATEADD(DAY, -38, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-004', 'Documento de identidad', 'DPI de la víctima', 'Azul', '8.5cm x 5.5cm', 5.00, 'gramos', 'Bolsillo del pantalón', 5, @id_tecnico, DATEADD(DAY, -38, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-003', 'Hurto de vehículo en estacionamiento', '2024-03-05', 'Centro Comercial Oakland, Zona 10', DATEADD(DAY, -20, GETDATE()), @id_tecnico, @id_estado_revision);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -20, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -20, GETDATE()), 'Expediente creado');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_registro, @id_estado_revision, @id_tecnico, DATEADD(DAY, -18, GETDATE()), 'Expediente enviado a revisión');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Video vigilancia', 'Grabación de cámara de seguridad', NULL, 'Digital', NULL, NULL, 'Sistema de cámaras del parqueo', 2, @id_tecnico, DATEADD(DAY, -20, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Herramienta de apertura', 'Destornillador usado para forzar cerradura', 'Rojo', '20cm', 150.00, 'gramos', 'Piso del estacionamiento', 1, @id_tecnico, DATEADD(DAY, -20, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-004', 'Agresión sexual en parque municipal', '2024-03-12', 'Parque Central, Zona 1 Mixco', DATEADD(DAY, -15, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -15, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -15, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Muestra de ADN', 'Muestra biológica de la víctima', NULL, '2ml', 2.00, 'ml', 'Hospital Roosevelt', 3, @id_tecnico, DATEADD(DAY, -15, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Prenda de vestir', 'Camisa rasgada de la víctima', 'Blanco', '60cm x 40cm', 200.00, 'gramos', 'Lugar de los hechos', 1, @id_tecnico, DATEADD(DAY, -15, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-005', 'Fraude electrónico mediante phishing', '2024-03-18', 'Zona 15, Vista Hermosa', DATEADD(DAY, -10, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -10, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -10, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Correo electrónico fraudulento', 'Email con enlace malicioso', NULL, 'Digital', NULL, NULL, 'Servidor de correo', 2, @id_tecnico, DATEADD(DAY, -10, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Captura de pantalla', 'Captura del sitio web falso', NULL, 'Digital', NULL, NULL, 'Computadora de la víctima', 2, @id_tecnico, DATEADD(DAY, -10, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Estados de cuenta bancarios', 'Extractos mostrando transacciones fraudulentas', NULL, NULL, NULL, NULL, 'Banco Crédito', 5, @id_tecnico, DATEADD(DAY, -10, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-006', 'Incendio intencional en bodega', '2024-03-20', 'Zona 12, Colonia Pamplona', DATEADD(DAY, -8, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -8, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -8, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Bidón con restos de gasolina', 'Recipiente plástico con rastros de combustible', 'Rojo', '30cm x 20cm', 500.00, 'gramos', 'Patio trasero de la bodega', 1, @id_tecnico, DATEADD(DAY, -8, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Fósforos', 'Caja de fósforos parcialmente quemada', 'Rojo y blanco', '5cm x 3cm', 20.00, 'gramos', 'Cerca del punto de ignición', 1, @id_tecnico, DATEADD(DAY, -8, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-007', 'Tráfico de drogas en sector residencial', '2024-03-22', 'Zona 7, Colonia El Milagro', DATEADD(DAY, -6, GETDATE()), @id_tecnico, @id_estado_revision);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -6, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -6, GETDATE()), 'Expediente creado');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_registro, @id_estado_revision, @id_tecnico, DATEADD(DAY, -4, GETDATE()), 'Expediente enviado a revisión');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Paquetes de marihuana', 'Cinco paquetes envueltos en plástico', 'Verde', '15cm x 10cm', 500.00, 'gramos', 'Interior del vehículo', 1, @id_tecnico, DATEADD(DAY, -6, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Balanza digital', 'Balanza de precisión con residuos', 'Negro', '10cm x 10cm', 300.00, 'gramos', 'Guantera del vehículo', 1, @id_tecnico, DATEADD(DAY, -6, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Dinero en efectivo', 'Q25,000 en billetes de diferentes denominaciones', NULL, NULL, NULL, NULL, 'Mochila en asiento trasero', 1, @id_tecnico, DATEADD(DAY, -6, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-008', 'Secuestro express en ruta al trabajo', '2024-03-24', 'Carretera a El Salvador, km 15', DATEADD(DAY, -4, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -4, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -4, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'GPS del vehículo', 'Dispositivo de rastreo con último registro', 'Negro', '8cm x 5cm', 80.00, 'gramos', 'Debajo del tablero', 2, @id_tecnico, DATEADD(DAY, -4, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Notas manuscritas', 'Papel con instrucciones para la víctima', 'Blanco', '20cm x 15cm', 5.00, 'gramos', 'Interior del vehículo abandonado', 5, @id_tecnico, DATEADD(DAY, -4, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-009', 'Estafa piramidal mediante inversiones falsas', '2024-03-25', 'Edificio de oficinas, Zona 10', DATEADD(DAY, -3, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -3, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -3, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Contratos de inversión', 'Documentos firmados por las víctimas', 'Blanco', NULL, NULL, NULL, 'Oficina principal', 5, @id_tecnico, DATEADD(DAY, -3, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Disco duro de computadora', 'Almacenamiento con base de datos de clientes', 'Negro', '10cm x 7cm', 100.00, 'gramos', 'Computadora de escritorio', 2, @id_tecnico, DATEADD(DAY, -3, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Libro de cuentas', 'Registro manual de transacciones', 'Azul', '25cm x 20cm', 400.00, 'gramos', 'Cajón del escritorio', 5, @id_tecnico, DATEADD(DAY, -3, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-010', 'Falsificación de documentos oficiales', '2024-03-26', 'Centro Histórico, Zona 1', DATEADD(DAY, -2, GETDATE()), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -2, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -2, GETDATE()), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'DPI falsificados', 'Diez documentos con datos alterados', 'Azul', '8.5cm x 5.5cm', 50.00, 'gramos', 'Imprenta clandestina', 5, @id_tecnico, DATEADD(DAY, -2, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Impresora especializada', 'Equipo para impresión de documentos', 'Blanco', '40cm x 30cm', 5000.00, 'gramos', 'Mesa de trabajo', 1, @id_tecnico, DATEADD(DAY, -2, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-011', 'Extorsión telefónica a comerciante', '2024-03-27', 'Zona 3, Mercado Central', DATEADD(DAY, -1, GETDATE()), @id_tecnico, @id_estado_revision);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, DATEADD(DAY, -1, GETDATE()));

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, DATEADD(DAY, -1, GETDATE()), 'Expediente creado');

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, @id_estado_registro, @id_estado_revision, @id_tecnico, GETDATE(), 'Expediente enviado a revisión');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Grabación de llamada', 'Audio de amenaza telefónica', NULL, 'Digital', NULL, NULL, 'Celular de la víctima', 2, @id_tecnico, DATEADD(DAY, -1, GETDATE()));

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Registro de llamadas', 'Historial de números entrantes', NULL, 'Digital', NULL, NULL, 'Sistema de telefonía', 2, @id_tecnico, DATEADD(DAY, -1, GETDATE()));

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-012', 'Vandalismo en instalaciones públicas', '2024-03-27', 'Parque de la Industria, Zona 9', GETDATE(), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, GETDATE());

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, GETDATE(), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Latas de pintura en aerosol', 'Cinco latas usadas de diferentes colores', 'Multicolor', '20cm x 8cm', 250.00, 'gramos', 'Basurero cercano', 1, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Fotografías del graffiti', 'Imágenes de alta resolución de los daños', NULL, 'Digital', NULL, NULL, 'Monumento vandalizado', 6, @id_tecnico, GETDATE());

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-013', 'Posesión ilegal de armas de fuego', '2024-03-28', 'Zona 21, Colonia Utatlán', GETDATE(), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, GETDATE());

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, GETDATE(), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Revólver calibre 38', 'Arma sin registro legal', 'Negro', '18cm x 12cm', 700.00, 'gramos', 'Closet del dormitorio', 4, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Municiones', 'Caja con 50 balas calibre 38', 'Dorado', '10cm x 8cm', 400.00, 'gramos', 'Mismo closet', 4, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Silenciador artesanal', 'Dispositivo casero para reducir ruido', 'Gris', '15cm x 5cm', 300.00, 'gramos', 'Caja de herramientas', 4, @id_tecnico, GETDATE());

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-014', 'Violencia intrafamiliar con lesiones graves', '2024-03-28', 'Zona 11, Colonia Roosevelt', GETDATE(), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, GETDATE());

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, GETDATE(), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Objeto contundente', 'Tubo metálico usado en la agresión', 'Plateado', '50cm x 3cm', 800.00, 'gramos', 'Sala de estar', 1, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Fotografías forenses', 'Documentación de lesiones en la víctima', NULL, 'Digital', NULL, NULL, 'Hospital San Juan de Dios', 6, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Reporte médico', 'Dictamen de lesiones graves', 'Blanco', '21cm x 28cm', 10.00, 'gramos', 'Centro médico forense', 5, @id_tecnico, GETDATE());

INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, fecha_registro, id_usuario_registro, id_estado)
VALUES ('EXP-2024-015', 'Allanamiento de morada y robo', '2024-03-29', 'Zona 14, Colonia La Cañada', GETDATE(), @id_tecnico, @id_estado_registro);

SET @id_expediente = SCOPE_IDENTITY();

INSERT INTO tecnico_expediente (id_expediente, id_usuario, fecha_asignacion) VALUES (@id_expediente, @id_tecnico, GETDATE());

INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, fecha_cambio, comentario)
VALUES (@id_expediente, NULL, @id_estado_registro, @id_tecnico, GETDATE(), 'Expediente creado');

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-001', 'Huellas dactilares', 'Impresiones en ventana forzada', NULL, NULL, NULL, NULL, 'Ventana del baño', 3, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-002', 'Palanca de hierro', 'Herramienta usada para forzar entrada', 'Negro', '40cm x 3cm', 1200.00, 'gramos', 'Jardín trasero', 1, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-003', 'Fibras textiles', 'Fragmentos de ropa en vidrios rotos', 'Negro', '5cm', 2.00, 'gramos', 'Marco de la ventana', 1, @id_tecnico, GETDATE());

INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, id_usuario_registro, fecha_registro)
VALUES (@id_expediente, 'IND-004', 'Calzado con barro', 'Huella de zapato deportivo talla 42', 'Café', '30cm', NULL, NULL, 'Piso de la cocina', 1, @id_tecnico, GETDATE());
GO