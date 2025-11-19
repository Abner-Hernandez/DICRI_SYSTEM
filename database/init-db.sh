#!/bin/bash

# =================================================================
# VARIABLES DE CREDENCIALES
# =================================================================
DB_SA_PASSWORD="${SA_PASSWORD}"
DB_USER="${DB_USER}"
DB_USER_APP="${DB_USER_APP}"
DB_PASSWORD_APP="${DB_PASSWORD_APP}"
DB_NAME="${DB_NAME}"
DB_HOST="${DB_HOST:-localhost}"
SQLCMD="/opt/mssql-tools/bin/sqlcmd"

echo "Esperando a que SQL Server esté listo..."

STATUS=1
MAX_RETRIES=20
COUNT=0

while [ $STATUS -ne 0 ] && [ $COUNT -lt $MAX_RETRIES ]; do
    echo "Verificando conexión (Intento $((COUNT + 1)))..."
    ${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d master -Q "SELECT 1" -h -1 -W
    STATUS=$?
    if [ $STATUS -ne 0 ]; then
        sleep 5
        COUNT=$((COUNT + 1))
    fi
done

if [ $STATUS -ne 0 ]; then
    echo "¡ERROR FATAL! SQL Server no respondió después de $((MAX_RETRIES * 5)) segundos."
    exit 1
fi
echo "SQL Server está listo. Iniciando scripts de inicialización."

echo "Ejecutando scripts DDL..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d master -i /docker-entrypoint-initdb.d/DDL.sql

echo "Creando usuario de aplicación (${DB_USER_APP})..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d master -Q "
    IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'${DB_USER_APP}')
    BEGIN
        CREATE LOGIN [${DB_USER_APP}] WITH PASSWORD=N'${DB_PASSWORD_APP}', 
        DEFAULT_DATABASE=[${DB_NAME}], 
        CHECK_EXPIRATION=OFF, 
        CHECK_POLICY=OFF
    END;

    USE [${DB_NAME}];

    IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'${DB_USER_APP}')
    BEGIN
        CREATE USER [${DB_USER_APP}] FOR LOGIN [${DB_USER_APP}];
    END;
    
    ALTER ROLE db_datareader ADD MEMBER [${DB_USER_APP}];
    ALTER ROLE db_datawriter ADD MEMBER [${DB_USER_APP}];
"

echo "Ejecutando scripts DML..."
${SQLCMD} -S ${DB_HOST} -U ${DB_USER} -P "${DB_SA_PASSWORD}" -d ${DB_NAME} -i /docker-entrypoint-initdb.d/DML.sql

echo "Base de datos DICRI inicializada exitosamente!"