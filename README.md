# Proyecto Dicri

Este es un proyecto que consta de tres servicios principales: una base de datos, un backend y un frontend, todos ellos gestionados mediante Docker. El propósito de este proyecto es brindar una plataforma completa para la gestión, procesamiento y análisis de evidencia criminalística. 

A continuación se detallan los servicios y cómo ejecutar el proyecto localmente.

[Ver el manual técnico completo](Documentacion/manual-tecnico.md)

## Servicios

### 1. **Base de Datos (SQL Server)**

Este servicio utiliza SQL Server como base de datos. Se configura mediante un contenedor Docker y se inicializa con un script de configuración y variables de entorno.

- **Contenedor**: `dicri_database`
- **Imagen**: SQL Server (Microsoft)
- **Puertos expuestos**: `1433:1433` (puerto por defecto de SQL Server)
- **Volúmenes**:
  - `sqlserver_data:/var/opt/mssql` para almacenar los datos de la base de datos.
  - `./database/scripts:/docker-entrypoint-initdb.d` para scripts de inicialización.
  - `./database/init-db.sh:/init-db.sh` para el script de configuración inicial.
- **Comprobación de estado**: Se realiza con un `healthcheck` usando la herramienta `sqlcmd`.

#### Variables de entorno

- `ACCEPT_EULA`: Aceptación del contrato de licencia.
- `SA_PASSWORD`: Contraseña del usuario administrador de SQL Server.
- `DB_USER_APP`: Usuario de la aplicación.
- `DB_PASSWORD_APP`: Contraseña de la aplicación.
- `DB_NAME`: Nombre de la base de datos.
- `DB_HOST_INIT`: Dirección del host de la base de datos.

---

### 2. **Backend (API)**

El servicio backend es una API RESTful que interactúa con la base de datos y proporciona la lógica de negocio. Está construido con Node.js y express.

- **Contenedor**: `dicri_backend`
- **Puertos expuestos**: `5000:5000`
- **Dependencias**: Depende del servicio de base de datos, que debe estar en buen estado (`depends_on: service_healthy`).
- **Comando**: `npm start` para iniciar el servidor.

#### Variables de entorno

- `DB_HOST`: Dirección del host de la base de datos.
- `DB_USER`: Usuario de la base de datos.
- `DB_PASSWORD`: Contraseña de la base de datos.
- `JWT_SECRET`: Clave secreta para la autenticación JWT.
- `API_HOST`: Dirección del backend.
- `UPLOAD_PATH`: Ruta para las cargas de archivos.
- `LOG_LEVEL`: Nivel de los logs (e.g., `debug`, `info`).

---

### 3. **Frontend**

Este servicio corresponde al cliente web, que interactúa con la API del backend para proporcionar la interfaz de usuario.

- **Contenedor**: `dicri_frontend`
- **Puertos expuestos**: `80:80` (puerto estándar de HTTP)
- **Dependencias**: Depende del servicio backend, que debe estar en ejecución (`depends_on: service_started`).
- **Comando**: `npm start` para iniciar el servidor de desarrollo de React.

#### Variables de entorno

- `CHOKIDAR_USEPOLLING`: Habilita el uso de polling para la recarga en caliente de cambios.
- `REACT_APP_API_URL`: URL del backend a la que se conecta el frontend.

---

## Requisitos

- Docker
- Docker Compose

## Configuración del entorno

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno (asegúrate de reemplazar los valores con tus configuraciones):

    ```env
    DB_EULA=Y
    DB_SA_PASSWORD=yourStrongPassword
    DB_MSSQL_PID=Developer
    DB_USER_APP=app_user
    DB_PASSWORD_APP=yourAppPassword
    DB_USER_ADMIN=admin_user
    DB_NAME=your_database_name
    DB_HOST_INIT=localhost
    DB_AUTHENTICATION_MODE=SQL
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=1h
    API_PORT=5000
    BACKEND_URL=localhost
    ```

2. Asegúrate de tener configurado el archivo `.env` con todas las variables necesarias.

## Ejecución del proyecto

Para ejecutar el proyecto, solo necesitas correr el siguiente comando en la raíz del proyecto donde se encuentra el archivo `docker-compose.yml`:

```bash
docker-compose up --build
```
