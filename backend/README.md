ackend del Sistema de Gestión de Evidencias para la Dirección de Investigación Criminalística.

## Stack Tecnológico

- **Node.js** v18+
- **Express** v4.18
- **SQL Server** 2022
- **mssql** v10 (Driver SQL Server)
- **JWT** para autenticación
- **Jest** para testing

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración (DB, JWT, etc)
│   ├── controllers/    # Controladores de rutas
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas
│   ├── middlewares/    # Middlewares personalizados
│   ├── services/       # Lógica de negocio
│   └── utils/          # Utilidades
├── tests/
│   ├── unit/          # Tests unitarios
│   └── integration/   # Tests de integración
├── server.js          # Punto de entrada
└── package.json
```

## Instalación

```bash
npm install
```

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
DB_HOST=database
DB_PORT=1433
DB_USER=SA
DB_PASSWORD=DICRI_Pass123!
DB_NAME=DICRI_DB
JWT_SECRET=your_secret_key
API_PORT=5000
```

## Scripts Disponibles

```bash
npm run dev              # Desarrollo con nodemon
npm start                # Producción
npm test                 # Todos los tests con coverage
npm run test:unit        # Solo tests unitarios
npm run test:integration # Solo tests de integración
npm run lint             # Verificar código
npm run lint:fix         # Corregir errores de linting
```

## Endpoints Principales

### Autenticación
- POST `/api/auth/login` - Iniciar sesión
- POST `/api/auth/logout` - Cerrar sesión
- GET `/api/auth/me` - Obtener usuario actual

### Expedientes
- GET `/api/expedientes` - Listar expedientes
- POST `/api/expedientes` - Crear expediente
- GET `/api/expedientes/:id` - Obtener expediente
- PUT `/api/expedientes/:id` - Actualizar expediente
- POST `/api/expedientes/:id/enviar-revision` - Enviar a revisión
- POST `/api/expedientes/:id/aprobar` - Aprobar expediente
- POST `/api/expedientes/:id/rechazar` - Rechazar expediente

### Indicios
- GET `/api/indicios` - Listar indicios
- POST `/api/indicios` - Crear indicio
- GET `/api/indicios/:id` - Obtener indicio
- PUT `/api/indicios/:id` - Actualizar indicio
- DELETE `/api/indicios/:id` - Eliminar indicio

### Usuarios
- GET `/api/usuarios` - Listar usuarios
- POST `/api/usuarios` - Crear usuario
- GET `/api/usuarios/:id` - Obtener usuario
- PUT `/api/usuarios/:id` - Actualizar usuario

## Testing

El proyecto usa **Jest** para pruebas unitarias e integración:

```bash
# Ejecutar todos los tests
npm test

# Tests con watch mode
npm run test:watch

# Solo unitarios
npm run test:unit

# Solo integración
npm run test:integration

# Ver coverage
npm test -- --coverage
```

## Docker

```bash
# Desarrollo
docker build -f Dockerfile.dev -t dicri-backend-dev .
docker run -p 5000:5000 dicri-backend-dev

# Producción
docker build -t dicri-backend .
docker run -p 5000:5000 dicri-backend
```

## Procedimientos Almacenados

El backend utiliza los siguientes SPs del SQL Server:

- `sp_crear_expediente`
- `sp_registrar_indicio`
- `sp_enviar_a_revision`
- `sp_aprobar_expediente`
- `sp_rechazar_expediente`

Ver `database/scripts/DDL.sql` para más detalles.

## Convenciones de Código

- Usar comillas simples (`'`)
- Punto y coma obligatorio
- 2 espacios de indentación
- Nombres de variables en camelCase
- Nombres de archivos en camelCase
- Usar async/await en lugar de callbacks

## Contribuir

1. Crear rama: `git checkout -b feature/nueva-funcionalidad`
2. Hacer cambios y commit: `git commit -m "Descripción"`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request