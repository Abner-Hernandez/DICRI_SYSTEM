#!/bin/bash

# =================================================================
# ... (VARIABLES DE CREDENCIALES, SQLCMD)
# =================================================================
DB_SA_PASSWORD="${SA_PASSWORD}"
DB_USER="${DB_USER}"
DB_USER_APP="${DB_USER_APP}"
DB_PASSWORD_APP="${DB_PASSWORD_APP}"
DB_NAME="${DB_NAME}"
DB_HOST="${DB_HOST:-localhost}"
SQLCMD="/opt/mssql-tools/bin/sqlcmd"

echo "Esperando a que SQL Server esté listo..."

# ... (LÓGICA DE REINTENTOS)
# ...
if [ $STATUS -ne 0 ]; then
    echo "¡ERROR FATAL! SQL Server no respondió después de $((MAX_RETRIES * 5)) segundos."
    exit 1
fi
echo "SQL Server está listo. Iniciando scripts de inicialización."

# -----------------------------------------------------------------
# 1. CREACIÓN DE BASE DE DATOS Y OBJETOS DDL
# -----------------------------------------------------------------
echo "Ejecutando scripts DDL (incluye CREATE DATABASE)..."
# Usamos 'master' y ejecutamos el DDL para garantizar que la base de datos exista
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d master -i /docker-entrypoint-initdb.d/DDL.sql

if [ $? -ne 0 ]; then
    echo "Error ejecutando DDL.sql. Saliendo."
    exit 1
fi
echo "DDL.sql ejecutado exitosamente."
echo ""

# -----------------------------------------------------------------
# 2. CREACIÓN DE USUARIO (LOGIN y USER)
# -----------------------------------------------------------------
echo "Creando usuario de aplicación (${DB_USER_APP}) y asignando roles..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d master -Q "
    -- CREAR LOGIN A NIVEL DE SERVIDOR
    IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'${DB_USER_APP}')
    BEGIN
        CREATE LOGIN [${DB_USER_APP}] WITH PASSWORD=N'${DB_PASSWORD_APP}', 
        DEFAULT_DATABASE=[${DB_NAME}], 
        CHECK_EXPIRATION=OFF, 
        CHECK_POLICY=OFF
    END;

    USE [${DB_NAME}];

    -- CREAR USER A NIVEL DE BASE DE DATOS Y ASIGNAR ROLES
    IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'${DB_USER_APP}')
    BEGIN
        CREATE USER [${DB_USER_APP}] FOR LOGIN [${DB_USER_APP}];
    END;
    
    -- Asignación de Roles Básicos
    ALTER ROLE db_datareader ADD MEMBER [${DB_USER_APP}];
    ALTER ROLE db_datawriter ADD MEMBER [${DB_USER_APP}];
    
    PRINT 'Usuario de aplicación y roles asignados';
"

if [ $? -ne 0 ]; then
    echo "Error creando usuario/asignando roles básicos."
    exit 1
fi
echo "Usuario de aplicación creado y roles básicos asignados."
echo ""

# -----------------------------------------------------------------
# 3. ASIGNACIÓN DE PERMISOS ESPECÍFICOS (EXECUTE)
# -----------------------------------------------------------------
echo "Otorgando permisos EXECUTE a todos los procedimientos almacenados..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d ${DB_NAME} -Q "
    DECLARE @sql NVARCHAR(MAX) = '';
    
    SELECT @sql = @sql + 
        'GRANT EXECUTE ON ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + 
        ' TO [${DB_USER_APP}];' + CHAR(13)
    FROM sys.objects
    WHERE type IN ('P', 'PC')
      AND is_ms_shipped = 0;
    
    IF LEN(@sql) > 0
    BEGIN
        EXEC sp_executesql @sql;
        PRINT 'Permisos EXECUTE otorgados a ${DB_USER_APP}';
    END
    ELSE
    BEGIN
        PRINT 'No se encontraron procedimientos almacenados para asignar EXECUTE';
    END;
"

if [ $? -ne 0 ]; then
    echo "Error otorgando permisos EXECUTE."
    exit 1
fi
echo "Permisos EXECUTE otorgados."
echo ""

# -----------------------------------------------------------------
# 4. EJECUCIÓN DE SCRIPTS DML
# -----------------------------------------------------------------
echo "Ejecutando scripts DML..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d ${DB_NAME} -i /docker-entrypoint-initdb.d/DML.sql

if [ $? -ne 0 ]; then
    echo "Error ejecutando DML.sql. Saliendo."
    exit 1
fi

echo "Base de datos ${DB_NAME} inicializada exitosamente!"