DECLARE @LoginName NVARCHAR(50) = N'dicri_backend';
DECLARE @Password NVARCHAR(50) = N'User-Dicri_2025';
DECLARE @DatabaseName NVARCHAR(50) = N'DICRI_DB';

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = @LoginName)
BEGIN
    CREATE LOGIN @LoginName WITH PASSWORD=@Password, 
    DEFAULT_DATABASE=@DatabaseName, 
    CHECK_EXPIRATION=OFF, 
    CHECK_POLICY=OFF;
END
GO

REVOKE VIEW ANY DATABASE TO PUBLIC;
GO

USE DICRI_DB;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = @LoginName)
BEGIN
    CREATE USER @LoginName FOR LOGIN @LoginName;
END
GO

ALTER ROLE db_datareader ADD MEMBER @LoginName;
ALTER ROLE db_datawriter ADD MEMBER @LoginName;
GO