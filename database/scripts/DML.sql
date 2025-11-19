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
('Admin', 'Sistema', 'admin@dicri.gob.gt', '$2a$10$rP8KvZ5yX.Jz8YhHqF3qZOGxK5H8nV2xW4fD1sT6uY7cE9bL0mN3q', 
 (SELECT id_rol FROM rol WHERE nombre = 'Administrador'));
GO

INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol) VALUES
('Juan', 'Pérez', 'juan.perez@dicri.gob.gt', '$2a$10$8KvZ5yX.Jz8YhHqF3qZOGxK5H8nV2xW4fD1sT6uY7cE9bL0mN3qrP', 
 (SELECT id_rol FROM rol WHERE nombre = 'Técnico')),
('María', 'López', 'maria.lopez@dicri.gob.gt', '$2a$10$9LwA6zY.Kz9ZiIrG4rRaPxL6I9oW3yX5gE2tU7vZ8dF0cM1nO4sS', 
 (SELECT id_rol FROM rol WHERE nombre = 'Coordinador'));
GO