CREATE DATABASE DICRI_DB;
GO

USE DICRI_DB;
GO

CREATE TABLE [rol] (
  [id_rol] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(50) UNIQUE NOT NULL,
  [descripcion] text,
  CONSTRAINT CHK_rol_nombre CHECK (nombre IN ('Técnico', 'Coordinador', 'Administrador'))
)
GO

CREATE TABLE [usuario] (
  [id_usuario] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) NOT NULL,
  [apellido] varchar(100) NOT NULL,
  [email] varchar(150) UNIQUE NOT NULL,
  [password_hash] varchar(255) NOT NULL,
  [id_rol] int NOT NULL,
  [activo] bit DEFAULT (1),
  [fecha_creacion] datetime DEFAULT (GETDATE()),
  [fecha_modificacion] datetime
)
GO

CREATE TABLE [permiso] (
  [id_permiso] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) UNIQUE NOT NULL,
  [descripcion] text,
  [modulo] varchar(50)
)
GO

CREATE TABLE [rol_permiso] (
  [id_rol] int,
  [id_permiso] int,
  PRIMARY KEY ([id_rol], [id_permiso])
)
GO

CREATE TABLE [estado_expediente] (
  [id_estado] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(50) UNIQUE NOT NULL,
  [descripcion] text,
  CONSTRAINT CHK_estado_nombre CHECK (nombre IN ('En Registro', 'En Revisión', 'Aprobado', 'Rechazado'))
)
GO

CREATE TABLE [expediente] (
  [id_expediente] int PRIMARY KEY IDENTITY(1, 1),
  [numero_expediente] varchar(50) UNIQUE NOT NULL,
  [descripcion_general] text NOT NULL,
  [fecha_registro] datetime NOT NULL DEFAULT (GETDATE()),
  [fecha_incidente] date,
  [lugar_incidente] text,
  [id_usuario_registro] int NOT NULL,
  [id_estado] int NOT NULL,
  [justificacion_rechazo] text,
  [fecha_aprobacion] datetime,
  [id_usuario_aprobacion] int,
  [fecha_modificacion] datetime
)
GO

CREATE TABLE [tipo_indicio] (
  [id_tipo] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) UNIQUE NOT NULL,
  [descripcion] text
)
GO

CREATE TABLE [indicio] (
  [id_indicio] int PRIMARY KEY IDENTITY(1, 1),
  [id_expediente] int NOT NULL,
  [numero_indicio] varchar(50) NOT NULL,
  [nombre_objeto] varchar(200) NOT NULL,
  [descripcion] text NOT NULL,
  [color] varchar(100),
  [tamanio] varchar(100),
  [peso] decimal(10,2),
  [unidad_peso] varchar(20),
  [ubicacion_hallazgo] text NOT NULL,
  [id_tipo_indicio] int,
  [id_usuario_registro] int NOT NULL,
  [fecha_registro] datetime NOT NULL DEFAULT (GETDATE()),
  [observaciones] text
)
GO

CREATE TABLE [historial_expediente] (
  [id_historial] int PRIMARY KEY IDENTITY(1, 1),
  [id_expediente] int NOT NULL,
  [id_estado_anterior] int,
  [id_estado_nuevo] int NOT NULL,
  [id_usuario] int NOT NULL,
  [fecha_cambio] datetime NOT NULL DEFAULT (GETDATE()),
  [comentario] text
)
GO

CREATE TABLE [tecnico_expediente] (
  [id_expediente] int,
  [id_usuario] int,
  [fecha_asignacion] datetime DEFAULT (GETDATE()),
  PRIMARY KEY ([id_expediente], [id_usuario])
)
GO

CREATE TABLE [adjunto_indicio] (
  [id_adjunto] int PRIMARY KEY IDENTITY(1, 1),
  [id_indicio] int NOT NULL,
  [nombre_archivo] varchar(255) NOT NULL,
  [ruta_archivo] varchar(500) NOT NULL,
  [tipo_mime] varchar(100),
  [tamanio_bytes] bigint,
  [id_usuario_carga] int NOT NULL,
  [fecha_carga] datetime NOT NULL DEFAULT (GETDATE())
)
GO

CREATE TABLE [auditoria] (
  [id_auditoria] bigint PRIMARY KEY IDENTITY(1, 1),
  [tabla] varchar(100) NOT NULL,
  [id_registro] int NOT NULL,
  [accion] varchar(50) NOT NULL,
  [id_usuario] int NOT NULL,
  [fecha_accion] datetime NOT NULL DEFAULT (GETDATE()),
  [datos_anteriores] nvarchar(max),
  [datos_nuevos] nvarchar(max),
  [ip_address] varchar(45),
  CONSTRAINT CHK_auditoria_accion CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
)
GO

CREATE UNIQUE INDEX [indicio_index_0] ON [indicio] ("id_expediente", "numero_indicio")
GO

CREATE INDEX IDX_auditoria_tabla ON auditoria(tabla)
GO

CREATE INDEX IDX_auditoria_fecha ON auditoria(fecha_accion)
GO

CREATE INDEX IDX_auditoria_usuario ON auditoria(id_usuario)
GO

CREATE INDEX IDX_auditoria_tabla_registro ON auditoria(tabla, id_registro)
GO

ALTER TABLE [usuario] ADD FOREIGN KEY ([id_rol]) REFERENCES [rol] ([id_rol])
GO

ALTER TABLE [rol_permiso] ADD FOREIGN KEY ([id_rol]) REFERENCES [rol] ([id_rol])
GO

ALTER TABLE [rol_permiso] ADD FOREIGN KEY ([id_permiso]) REFERENCES [permiso] ([id_permiso])
GO

ALTER TABLE [expediente] ADD FOREIGN KEY ([id_usuario_registro]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [expediente] ADD FOREIGN KEY ([id_estado]) REFERENCES [estado_expediente] ([id_estado])
GO

ALTER TABLE [expediente] ADD FOREIGN KEY ([id_usuario_aprobacion]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [indicio] ADD FOREIGN KEY ([id_expediente]) REFERENCES [expediente] ([id_expediente])
GO

ALTER TABLE [indicio] ADD FOREIGN KEY ([id_tipo_indicio]) REFERENCES [tipo_indicio] ([id_tipo])
GO

ALTER TABLE [indicio] ADD FOREIGN KEY ([id_usuario_registro]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [historial_expediente] ADD FOREIGN KEY ([id_expediente]) REFERENCES [expediente] ([id_expediente])
GO

ALTER TABLE [historial_expediente] ADD FOREIGN KEY ([id_estado_anterior]) REFERENCES [estado_expediente] ([id_estado])
GO

ALTER TABLE [historial_expediente] ADD FOREIGN KEY ([id_estado_nuevo]) REFERENCES [estado_expediente] ([id_estado])
GO

ALTER TABLE [historial_expediente] ADD FOREIGN KEY ([id_usuario]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [tecnico_expediente] ADD FOREIGN KEY ([id_expediente]) REFERENCES [expediente] ([id_expediente])
GO

ALTER TABLE [tecnico_expediente] ADD FOREIGN KEY ([id_usuario]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [adjunto_indicio] ADD FOREIGN KEY ([id_indicio]) REFERENCES [indicio] ([id_indicio])
GO

ALTER TABLE [adjunto_indicio] ADD FOREIGN KEY ([id_usuario_carga]) REFERENCES [usuario] ([id_usuario])
GO

ALTER TABLE [auditoria] ADD FOREIGN KEY ([id_usuario]) REFERENCES [usuario] ([id_usuario])
GO

CREATE PROCEDURE sp_registrar_auditoria
    @tabla VARCHAR(100),
    @id_registro INT,
    @accion VARCHAR(50),
    @id_usuario INT,
    @datos_anteriores NVARCHAR(MAX) = NULL,
    @datos_nuevos NVARCHAR(MAX) = NULL,
    @ip_address VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_anteriores, datos_nuevos, ip_address)
    VALUES (@tabla, @id_registro, @accion, @id_usuario, @datos_anteriores, @datos_nuevos, @ip_address);
END;
GO

CREATE PROCEDURE sp_crear_expediente
    @numero_expediente VARCHAR(50),
    @descripcion_general TEXT,
    @fecha_incidente DATE,
    @lugar_incidente TEXT,
    @id_usuario_registro INT,
    @ip_address VARCHAR(45) = NULL,
    @id_expediente_out INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @id_rol INT;
        SELECT @id_rol = id_rol FROM usuario WHERE id_usuario = @id_usuario_registro;
        
        IF @id_rol NOT IN (SELECT id_rol FROM rol WHERE nombre IN ('Técnico', 'Administrador'))
        BEGIN
            RAISERROR('El usuario no tiene permisos para crear expedientes', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_inicial INT;
        SELECT @id_estado_inicial = id_estado FROM estado_expediente WHERE nombre = 'En Registro';
        
        INSERT INTO expediente (numero_expediente, descripcion_general, fecha_incidente, lugar_incidente, 
                                id_usuario_registro, id_estado)
        VALUES (@numero_expediente, @descripcion_general, @fecha_incidente, @lugar_incidente, 
                @id_usuario_registro, @id_estado_inicial);
        
        SET @id_expediente_out = SCOPE_IDENTITY();
        
        INSERT INTO tecnico_expediente (id_expediente, id_usuario)
        VALUES (@id_expediente_out, @id_usuario_registro);
        
        INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, comentario)
        VALUES (@id_expediente_out, NULL, @id_estado_inicial, @id_usuario_registro, 'Expediente creado');
        
        COMMIT TRANSACTION;
        
        SELECT 'Expediente creado exitosamente' AS mensaje, @id_expediente_out AS id_expediente;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_registrar_indicio
    @id_expediente INT,
    @numero_indicio VARCHAR(50),
    @nombre_objeto VARCHAR(200),
    @descripcion TEXT,
    @color VARCHAR(100) = NULL,
    @tamanio VARCHAR(100) = NULL,
    @peso DECIMAL(10,2) = NULL,
    @unidad_peso VARCHAR(20) = NULL,
    @ubicacion_hallazgo TEXT,
    @id_tipo_indicio INT = NULL,
    @id_usuario_registro INT,
    @observaciones TEXT = NULL,
    @ip_address VARCHAR(45) = NULL,
    @id_indicio_out INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @id_estado INT, @nombre_estado VARCHAR(50);
        SELECT @id_estado = e.id_estado, @nombre_estado = est.nombre 
        FROM expediente e 
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente;
        
        IF @nombre_estado != 'En Registro'
        BEGIN
            RAISERROR('No se pueden agregar indicios. El expediente ya no está en estado de registro', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (
            SELECT 1 FROM tecnico_expediente 
            WHERE id_expediente = @id_expediente AND id_usuario = @id_usuario_registro
        )
        AND NOT EXISTS (
            SELECT 1 FROM usuario u INNER JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = @id_usuario_registro AND r.nombre = 'Administrador'
        )
        BEGIN
            RAISERROR('El usuario no está asignado a este expediente', 16, 1);
            RETURN;
        END
        
        INSERT INTO indicio (id_expediente, numero_indicio, nombre_objeto, descripcion, color, 
                            tamanio, peso, unidad_peso, ubicacion_hallazgo, id_tipo_indicio, 
                            id_usuario_registro, observaciones)
        VALUES (@id_expediente, @numero_indicio, @nombre_objeto, @descripcion, @color, 
                @tamanio, @peso, @unidad_peso, @ubicacion_hallazgo, @id_tipo_indicio, 
                @id_usuario_registro, @observaciones);
        
        SET @id_indicio_out = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SELECT 'Indicio registrado exitosamente' AS mensaje, @id_indicio_out AS id_indicio;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_enviar_a_revision
    @id_expediente INT,
    @id_usuario INT,
    @ip_address VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @id_estado_actual INT, @nombre_estado VARCHAR(50);
        SELECT @id_estado_actual = e.id_estado, @nombre_estado = est.nombre
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente;
        
        IF @nombre_estado != 'En Registro'
        BEGIN
            RAISERROR('El expediente ya no está en estado de registro', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM indicio WHERE id_expediente = @id_expediente)
        BEGIN
            RAISERROR('El expediente debe tener al menos un indicio registrado', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_revision INT;
        SELECT @id_estado_revision = id_estado FROM estado_expediente WHERE nombre = 'En Revisión';
        
        UPDATE expediente 
        SET id_estado = @id_estado_revision 
        WHERE id_expediente = @id_expediente;
        
        INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, comentario)
        VALUES (@id_expediente, @id_estado_actual, @id_estado_revision, @id_usuario, 'Expediente enviado a revisión');
        
        COMMIT TRANSACTION;
        
        SELECT 'Expediente enviado a revisión exitosamente' AS mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_aprobar_expediente
    @id_expediente INT,
    @id_usuario_coordinador INT,
    @ip_address VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @id_rol INT, @nombre_rol VARCHAR(50);
        SELECT @id_rol = u.id_rol, @nombre_rol = r.nombre
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario_coordinador;
        
        IF @nombre_rol NOT IN ('Coordinador', 'Administrador')
        BEGIN
            RAISERROR('Solo coordinadores o administradores pueden aprobar expedientes', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_actual INT, @nombre_estado VARCHAR(50);
        SELECT @id_estado_actual = e.id_estado, @nombre_estado = est.nombre
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente;
        
        IF @nombre_estado != 'En Revisión'
        BEGIN
            RAISERROR('El expediente no está en estado de revisión', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_aprobado INT;
        SELECT @id_estado_aprobado = id_estado FROM estado_expediente WHERE nombre = 'Aprobado';
        
        UPDATE expediente 
        SET id_estado = @id_estado_aprobado,
            fecha_aprobacion = GETDATE(),
            id_usuario_aprobacion = @id_usuario_coordinador,
            justificacion_rechazo = NULL
        WHERE id_expediente = @id_expediente;
        
        INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, comentario)
        VALUES (@id_expediente, @id_estado_actual, @id_estado_aprobado, @id_usuario_coordinador, 'Expediente aprobado');
        
        COMMIT TRANSACTION;
        
        SELECT 'Expediente aprobado exitosamente' AS mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_rechazar_expediente
    @id_expediente INT,
    @id_usuario_coordinador INT,
    @justificacion_rechazo TEXT,
    @ip_address VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @nombre_rol VARCHAR(50);
        SELECT @nombre_rol = r.nombre
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario_coordinador;
        
        IF @nombre_rol NOT IN ('Coordinador', 'Administrador')
        BEGIN
            RAISERROR('Solo coordinadores o administradores pueden rechazar expedientes', 16, 1);
            RETURN;
        END
        
        IF @justificacion_rechazo IS NULL OR LEN(LTRIM(RTRIM(@justificacion_rechazo))) = 0
        BEGIN
            RAISERROR('La justificación de rechazo es obligatoria', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_actual INT, @nombre_estado VARCHAR(50);
        SELECT @id_estado_actual = e.id_estado, @nombre_estado = est.nombre
        FROM expediente e
        INNER JOIN estado_expediente est ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente;
        
        IF @nombre_estado != 'En Revisión'
        BEGIN
            RAISERROR('El expediente no está en estado de revisión', 16, 1);
            RETURN;
        END
        
        DECLARE @id_estado_registro INT;
        SELECT @id_estado_registro = id_estado FROM estado_expediente WHERE nombre = 'En Registro';
        
        UPDATE expediente 
        SET id_estado = @id_estado_registro,
            justificacion_rechazo = @justificacion_rechazo
        WHERE id_expediente = @id_expediente;
        
        INSERT INTO historial_expediente (id_expediente, id_estado_anterior, id_estado_nuevo, id_usuario, comentario)
        VALUES (@id_expediente, @id_estado_actual, @id_estado_registro, @id_usuario_coordinador, 
                'Expediente rechazado: ' + @justificacion_rechazo);
        
        COMMIT TRANSACTION;
        
        SELECT 'Expediente rechazado. Devuelto para corrección' AS mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE TRIGGER trg_expediente_insert
ON expediente
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_usuario INT;
    SELECT @id_usuario = id_usuario_registro FROM inserted;
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_nuevos)
    SELECT 
        'expediente',
        id_expediente,
        'INSERT',
        @id_usuario,
        (SELECT * FROM inserted i WHERE i.id_expediente = inserted.id_expediente FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_expediente_update
ON expediente
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        DECLARE @id_usuario INT;
        SELECT @id_usuario = COALESCE(id_usuario_aprobacion, id_usuario_registro) FROM inserted;
        
        INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_anteriores, datos_nuevos)
        SELECT 
            'expediente',
            i.id_expediente,
            'UPDATE',
            @id_usuario,
            (SELECT * FROM deleted d WHERE d.id_expediente = i.id_expediente FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted ins WHERE ins.id_expediente = i.id_expediente FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    END
END;
GO

CREATE TRIGGER trg_indicio_insert
ON indicio
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_usuario INT;
    SELECT @id_usuario = id_usuario_registro FROM inserted;
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_nuevos)
    SELECT 
        'indicio',
        id_indicio,
        'INSERT',
        @id_usuario,
        (SELECT * FROM inserted i WHERE i.id_indicio = inserted.id_indicio FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_indicio_update
ON indicio
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_usuario INT;
    SELECT @id_usuario = id_usuario_registro FROM inserted;
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_anteriores, datos_nuevos)
    SELECT 
        'indicio',
        i.id_indicio,
        'UPDATE',
        @id_usuario,
        (SELECT * FROM deleted d WHERE d.id_indicio = i.id_indicio FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT * FROM inserted ins WHERE ins.id_indicio = i.id_indicio FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted i;
END;
GO

CREATE TRIGGER trg_indicio_delete
ON indicio
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_usuario INT = CAST(CONTEXT_INFO() AS INT);
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_anteriores)
    SELECT 
        'indicio',
        id_indicio,
        'DELETE',
        COALESCE(@id_usuario, 1),
        (SELECT * FROM deleted d WHERE d.id_indicio = deleted.id_indicio FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM deleted;
END;
GO

CREATE TRIGGER trg_usuario_update
ON usuario
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO auditoria (tabla, id_registro, accion, id_usuario, datos_anteriores, datos_nuevos)
    SELECT 
        'usuario',
        i.id_usuario,
        'UPDATE',
        i.id_usuario,
        (SELECT * FROM deleted d WHERE d.id_usuario = i.id_usuario FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT * FROM inserted ins WHERE ins.id_usuario = i.id_usuario FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted i;
END;
GO

-- Menús en base a roles y permisos

USE DICRI_DB;
GO

CREATE TABLE [opcion_menu] (
  [id_opcion] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) NOT NULL,
  [ruta] varchar(200),
  [icono] varchar(50),
  [id_opcion_padre] int,
  [orden] int DEFAULT 0,
  [activo] bit DEFAULT 1,
  [requiere_permiso] bit DEFAULT 1,
  CONSTRAINT FK_opcion_menu_padre FOREIGN KEY ([id_opcion_padre]) REFERENCES [opcion_menu]([id_opcion])
)
GO

CREATE TABLE [permiso_opcion_menu] (
  [id_permiso] int NOT NULL,
  [id_opcion] int NOT NULL,
  PRIMARY KEY ([id_permiso], [id_opcion]),
  CONSTRAINT FK_permiso_opcion_permiso FOREIGN KEY ([id_permiso]) REFERENCES [permiso]([id_permiso]),
  CONSTRAINT FK_permiso_opcion_menu FOREIGN KEY ([id_opcion]) REFERENCES [opcion_menu]([id_opcion])
)
GO

CREATE INDEX IDX_opcion_menu_padre ON opcion_menu(id_opcion_padre)
GO

CREATE INDEX IDX_opcion_menu_activo ON opcion_menu(activo)
GO

CREATE PROCEDURE sp_obtener_menu_usuario
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH MenuRecursivo AS (
        SELECT 
            om.id_opcion,
            om.nombre,
            om.ruta,
            om.icono,
            om.id_opcion_padre,
            om.orden,
            om.requiere_permiso,
            0 AS nivel
        FROM opcion_menu om
        WHERE om.activo = 1 
          AND om.id_opcion_padre IS NULL
          AND (
              om.requiere_permiso = 0 
              OR EXISTS (
                  SELECT 1 
                  FROM usuario u
                  INNER JOIN rol_permiso rp ON u.id_rol = rp.id_rol
                  INNER JOIN permiso_opcion_menu pom ON rp.id_permiso = pom.id_permiso
                  WHERE u.id_usuario = @id_usuario 
                    AND pom.id_opcion = om.id_opcion
              )
          )
        
        UNION ALL
        
        SELECT 
            om.id_opcion,
            om.nombre,
            om.ruta,
            om.icono,
            om.id_opcion_padre,
            om.orden,
            om.requiere_permiso,
            mr.nivel + 1
        FROM opcion_menu om
        INNER JOIN MenuRecursivo mr ON om.id_opcion_padre = mr.id_opcion
        WHERE om.activo = 1
          AND (
              om.requiere_permiso = 0
              OR EXISTS (
                  SELECT 1 
                  FROM usuario u
                  INNER JOIN rol_permiso rp ON u.id_rol = rp.id_rol
                  INNER JOIN permiso_opcion_menu pom ON rp.id_permiso = pom.id_permiso
                  WHERE u.id_usuario = @id_usuario 
                    AND pom.id_opcion = om.id_opcion
              )
          )
    )
    SELECT 
        id_opcion,
        nombre,
        ruta,
        icono,
        id_opcion_padre,
        orden,
        nivel
    FROM MenuRecursivo
    ORDER BY nivel, orden, nombre;
END;
GO

CREATE PROCEDURE sp_verificar_permiso_usuario
    @id_usuario INT,
    @nombre_permiso VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM usuario u
            INNER JOIN rol_permiso rp ON u.id_rol = rp.id_rol
            INNER JOIN permiso p ON rp.id_permiso = p.id_permiso
            WHERE u.id_usuario = @id_usuario 
              AND p.nombre = @nombre_permiso
              AND u.activo = 1
        ) THEN 1
        ELSE 0
    END AS tiene_permiso;
END;
GO

CREATE PROCEDURE sp_obtener_permisos_usuario
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        p.id_permiso,
        p.nombre,
        p.descripcion,
        p.modulo
    FROM usuario u
    INNER JOIN rol_permiso rp ON u.id_rol = rp.id_rol
    INNER JOIN permiso p ON rp.id_permiso = p.id_permiso
    WHERE u.id_usuario = @id_usuario
      AND u.activo = 1
    ORDER BY p.modulo, p.nombre;
END;
GO