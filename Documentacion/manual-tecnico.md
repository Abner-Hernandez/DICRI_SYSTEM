# Manual Técnico
## Sistema de Gestión de Evidencia Criminalística DICRI

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Autor:** Equipo de Desarrollo DICRI

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Base de Datos](#3-base-de-datos)
4. [Backend API](#4-backend-api)
5. [Frontend](#5-frontend)
6. [Seguridad y Autenticación](#6-seguridad-y-autenticación)
7. [Configuración y Despliegue](#7-configuración-y-despliegue)
8. [Pruebas con Postman](#8-pruebas-con-postman)

---

## 1. Introducción

### 1.1 Propósito del Sistema

El **Sistema de Gestión de Evidencia Criminalística DICRI** es una solución integral diseñada para facilitar la gestión y el seguimiento de los expedientes criminales y sus evidencias dentro de la **División de Investigación Criminal**. El sistema permite la administración de los casos, desde la recolección de indicios hasta la revisión y aprobación de los expedientes por parte de los coordinadores. Su principal objetivo es mejorar la eficiencia y seguridad en el manejo de la evidencia criminalística, optimizando los procesos de investigación.

### 1.2 Tecnologías Utilizadas

El sistema DICRI está desarrollado utilizando un conjunto de tecnologías modernas que garantizan la robustez, escalabilidad y seguridad del sistema.

#### Backend
- **Node.js v18**: Plataforma basada en JavaScript que permite la ejecución del código en el servidor, ideal para aplicaciones escalables y de alto rendimiento.
- **Express.js v4.18**: Framework web para Node.js que facilita la creación de APIs robustas y eficientes, con un enrutamiento flexible.
- **SQL Server 2022**: Sistema de gestión de bases de datos relacional utilizado para almacenar la información crítica de los expedientes e indicios.
- **JWT (JSON Web Tokens)**: Sistema de autenticación basado en tokens, utilizado para gestionar sesiones de usuario de manera segura.
- **Bcrypt**: Biblioteca para encriptación de contraseñas, garantizando la seguridad de las credenciales de los usuarios.

#### Frontend
- **React v18.2**: Librería para construir interfaces de usuario interactivas y eficientes. Utilizada para desarrollar el frontend del sistema.
- **TypeScript v4.4**: Lenguaje de programación que añade tipado estático a JavaScript, lo que ayuda a evitar errores y mejora el mantenimiento del código.
- **Material-UI v7.3**: Framework de componentes para React que proporciona una interfaz de usuario atractiva y fácil de usar.
- **React Router v6.4**: Biblioteca para manejar la navegación dentro de la aplicación React, permitiendo una experiencia de usuario fluida.
- **React Hook Form v7.39**: Librería para gestionar formularios en React de manera eficiente y sencilla.
- **jspdf v3.0.4**: Librería para generar documentos PDF dinámicos a partir de los datos del sistema.
- **React Google Charts v5.2.1**: Librería que permite integrar gráficos interactivos en la aplicación, proporcionando representaciones visuales de datos.

#### Infraestructura
- **Docker y Docker Compose**: Herramientas para la creación, despliegue y administración de contenedores, lo que facilita la implementación del sistema en diferentes entornos.
- **Nginx**: Servidor web y proxy inverso utilizado para servir la aplicación en producción, asegurando el rendimiento y escalabilidad.

### 1.3 Roles de Usuario

El sistema está diseñado para ser utilizado por diferentes tipos de usuarios, cada uno con distintos niveles de acceso y responsabilidades dentro del proceso de gestión de expedientes.

1. **Técnico**: Este rol está encargado de crear, gestionar y actualizar expedientes e indicios. Los técnicos son responsables de registrar las pruebas y asociarlas a los expedientes correspondientes.
2. **Coordinador**: El coordinador tiene la capacidad de revisar los expedientes creados por los técnicos y aprobar o rechazar los casos según corresponda. Este rol supervisa el progreso de las investigaciones.
3. **Administrador**: Este rol tiene acceso completo al sistema, incluyendo la gestión de usuarios, configuración del sistema y monitoreo de la actividad dentro de la plataforma. Los administradores también pueden gestionar los permisos de otros usuarios.

---

## 2.0 Arquitectura del Sistema
![alt text](image-1.png)

### 2.1 Arquitectura General

El sistema **DICRI** adopta una arquitectura **MVC distribuida** y contenerizada mediante **Docker Compose**, permitiendo separación de responsabilidades, comunicación segura entre servicios y despliegue modular.

### 2.2 Capa de Presentación (Frontend – Vista del MVC)
- Implementada con **React + TypeScript**.  
- Renderiza vistas, maneja navegación, estados y validaciones básicas.  
- Se ejecuta en un contenedor Docker que expone el puerto **80**.  
- Todo acceso al backend se realiza a través de solicitudes HTTP internas.  
- No tiene comunicación directa con la base de datos.

### 2.3 Capa de Aplicación (Backend – Controlador y parte del Modelo del MVC)
- Construida con **Node.js + Express**.  
- Expone una **API REST** por el puerto **5000**.  
- Encargada de:  
  - Procesar solicitudes provenientes del frontend.  
  - Aplicar lógica de negocio, reglas de validación y flujos internos.  
  - Manejar autenticación y autorización mediante **JWT**.  
  - Ejecutar middlewares para auditoría, seguridad, sanitización y control de acceso.  
- Representa la parte funcional del **Controlador** y parte del **Modelo** del patrón MVC, ya que gestiona la interacción con la base de datos.

### 2.4 Capa de Datos (Modelo del MVC)
- Gestionada por **Microsoft SQL Server** ejecutado en un contenedor propio.  
- Expone el puerto **1433** solo dentro de la red interna.  
- Su función es almacenar información relacionada a:  
  - Expedientes  
  - Indicios  
  - Usuarios, roles, permisos  
  - Historial y auditoría  
- La interacción siempre es a través del backend, nunca desde el frontend.

### 2.5 Red Interna: Docker Network 
Los contenedores del sistema se comunican mediante una **Docker Network interna**, garantizando:

- Aislamiento entre servicios hacia el exterior.  
- Comunicación segura entre frontend, backend y base de datos.  
- Resolución automática de nombres (por ejemplo: `backend`, `mssql`).  
- Prohibición de acceso directo a backend y SQL Server desde el exterior.

### 2.6 Punto de Entrada a la Arquitectura
Solo el **Frontend** expone un puerto hacia el exterior (**80**).  
El flujo completo es:

**Cliente Web → Puerto 80 → Frontend React → Backend (5000) → SQL Server (1433)**

El cliente nunca accede directamente al backend ni a la base de datos.

---

### 2.7 Flujo General según el Diagrama
1. El usuario accede al sistema mediante navegador → **Frontend React**.  
2. El frontend realiza peticiones `/api/...` hacia el **Backend Node.js** usando la red interna.  
3. El backend valida JWT, ejecuta middlewares y procesa la lógica solicitada.  
4. Si se requiere información persistente, el backend se comunica con **SQL Server**.  
5. El backend devuelve la respuesta al frontend.  
6. El frontend actualiza la UI según los datos recibidos.

### 2.2 Estructura de Directorios

La estructura de directorios del proyecto está organizada de manera que cada componente tiene su propia carpeta con sus respectivos archivos de configuración, código fuente y recursos.



```
proyecto-dicri/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── expedienteController.js
│   │   │   ├── indicioController.js
│   │   │   ├── revisionController.js
│   │   │   └── menu.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validationMiddleware.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── expedienteRoutes.js
│   │       ├── indicioRoutes.js
│   │       ├── menuRouters.js
│   │       └── usuarioRoutes.js
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── clases/
│   │   │   ├── itemMenu.tsx
│   │   │   └── usuario.tsx
│   │   ├── componentes/
│   │   │   ├── login.tsx
│   │   │   ├── crearUsuario.tsx
│   │   │   ├── expedientesLista.tsx
│   │   │   ├── nuevoExpediente.tsx
│   │   │   ├── detalleExpediente.tsx
│   │   │   ├── editarExpediente.tsx
│   │   │   ├── nuevoIndicio.tsx
│   │   │   ├── detalleIndicio.tsx
│   │   │   ├── editarIndicio.tsx
│   │   │   ├── reporteExpedientes.tsx
│   │   │   └── reporteEstadisticas.tsx
│   │   ├── context/
│   │   │   └── usuarioContext.tsx
│   │   ├── hooks/
│   │   │   └── usePermisos.ts
│   │   ├── navbar/
│   │   │   └── menu.tsx
│   │   ├── provider/
│   │   │   └── usuarioProvider.tsx
│   │   ├── reducers/
│   │   │   └── usuarioReducer.tsx
│   │   ├── routers/
│   │   │   └── appRouter.tsx
│   │   └── types/
│   │       └── actions.ts
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── scripts/
│   │   ├── DDL.sql
│   │   └── DML.sql
│   ├── init-db.sh
│   └── Dockerfile
├── docker-compose.yml
├── .env
└── README.md
```

---

## 3. Base de Datos

### Descripción General

La base de datos del sistema DICRI está diseñada para garantizar
integridad, trazabilidad y consistencia en el manejo de expedientes e
indicios. Su modelo relacional permite controlar estados, asociar
técnicos a casos y mantener un historial detallado de cada cambio.
Incluye tablas principales para usuarios, expedientes e indicios, así
como procedimientos almacenados enfocados en validar permisos, gestionar
flujos y registrar auditoría.

------------------------------------------------------------------------

### 3.1 Modelo Entidad-Relación

#### Tablas Principales:

**usuario**\
Representa a los usuarios del sistema y almacena información personal,
credenciales cifradas y el rol asignado.

``` sql
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
```

**expediente**\
Contiene la información principal del caso, fechas relevantes, estado
del expediente y quién lo registró o aprobó.

``` sql
CREATE TABLE [expediente] (
  [id_expediente] int PRIMARY KEY IDENTITY(1, 1),
  [numero_expediente] varchar(50) UNIQUE NOT NULL,
  [descripcion_general] VARCHAR(MAX) NOT NULL,
  [fecha_registro] datetime NOT NULL DEFAULT (GETDATE()),
  [fecha_incidente] date,
  [lugar_incidente] VARCHAR(MAX),
  [id_usuario_registro] int NOT NULL,
  [id_estado] int NOT NULL,
  [justificacion_rechazo] VARCHAR(MAX),
  [fecha_aprobacion] datetime,
  [id_usuario_aprobacion] int,
  [fecha_modificacion] datetime
)
```

**indicio**\
Registra cada objeto o evidencia asociada a un expediente, incluyendo
características físicas y metadatos del hallazgo.

``` sql
CREATE TABLE [indicio] (
  [id_indicio] int PRIMARY KEY IDENTITY(1, 1),
  [id_expediente] int NOT NULL,
  [numero_indicio] varchar(50) NOT NULL,
  [nombre_objeto] varchar(200) NOT NULL,
  [descripcion] VARCHAR(MAX) NOT NULL,
  [color] varchar(100),
  [tamanio] varchar(100),
  [peso] decimal(10,2),
  [unidad_peso] varchar(20),
  [ubicacion_hallazgo] VARCHAR(MAX) NOT NULL,
  [id_tipo_indicio] int,
  [id_usuario_registro] int NOT NULL,
  [fecha_registro] datetime NOT NULL DEFAULT (GETDATE()),
  [observaciones] VARCHAR(MAX)
)
```

------------------------------------------------------------------------

### 3.2 Procedimientos Almacenados

Los procedimientos almacenados implementan reglas de negocio críticas,
asegurando que el flujo de estados y permisos se respete antes de
modificar datos.

#### sp_crear_expediente

Gestiona validaciones de rol, crea el expediente, asigna al técnico y
genera historial.

``` sql
-- Código omitido aquí por brevedad en este archivo
```

#### sp_enviar_a\_revision

Valida el estado actual, revisa que existan indicios y cambia el estado
a "En Revisión".

``` sql
-- Código omitido aquí por brevedad en este archivo
```

------------------------------------------------------------------------

### 3.3 Script de Inicialización

Este script automatiza la creación de la base de datos, usuarios,
permisos y datos iniciales dentro del contenedor SQL Server,
garantizando entornos reproducibles.

``` bash
-- Código omitido aquí por brevedad en este archivo
```
---

## 4. Backend API
Descripción general de la lógica del servidor, manejo de solicitudes, seguridad y comunicación con la base de datos.

### 4.1 Configuración de la Base de Datos
Define la conexión hacia SQL Server, incluyendo parámetros, credenciales, opciones de seguridad y creación del pool de conexiones.

**Archivo: `backend/src/config/database.js`**

```javascript
const sql = require('mssql');

const config = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: 
        process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server');
    return pool;
  } catch (error) {
    console.error('Error conectando:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Base de datos no conectada');
  }
  return pool;
};

module.exports = { connectDB, getPool, sql };
```

### 4.2 Controlador de Autenticación
Gestiona el proceso de login, validación de credenciales, verificación de usuarios activos y generación del token JWT.

**Archivo: `backend/src/controllers/authController.js`**

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT u.id_usuario, u.nombre, u.apellido, 
               u.email, u.password_hash, u.activo, 
               r.nombre as rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401)
        .json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.recordset[0];

    if (!usuario.activo) {
      return res.status(401)
        .json({ error: 'Usuario inactivo' });
    }

    const passwordMatch = await bcrypt.compare(
      password, 
      usuario.password_hash
    );

    if (!passwordMatch) {
      return res.status(401)
        .json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        email: usuario.email,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
```

### 4.3 Middleware de Autenticación
Valida tokens JWT, verifica usuarios activos y establece permisos según roles permitidos en cada ruta del API.

**Archivo: `backend/src/middlewares/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401)
        .json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET
    );
    
    const pool = getPool();
    const result = await pool.request()
      .input('id_usuario', sql.Int, decoded.id_usuario)
      .query(`
        SELECT u.id_usuario, u.nombre, u.apellido, 
               u.email, u.activo, r.nombre as rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario 
          AND u.activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401)
        .json({ error: 'Usuario no encontrado' });
    }

    req.user = result.recordset[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401)
        .json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401)
        .json({ error: 'Token expirado' });
    }
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos' 
      });
    }
    next();
  };
};

module.exports = { 
  authenticateToken, 
  authorizeRoles 
};
```

### 4.4 Controlador de Expedientes
Implementa las operaciones para crear, actualizar y gestionar expedientes, aplicando reglas de negocio y validaciones de permisos.

**Archivo: `backend/src/controllers/expedienteController.js`**

```javascript
const { getPool, sql } = require('../config/database');

const crearExpediente = async (req, res, next) => {
  try {
    const { 
      numero_expediente, 
      descripcion_general, 
      fecha_incidente, 
      lugar_incidente 
    } = req.body;
    
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    const result = await pool.request()
      .input('numero_expediente', 
        sql.VarChar, numero_expediente)
      .input('descripcion_general', 
        sql.Text, descripcion_general)
      .input('fecha_incidente', 
        sql.Date, fecha_incidente)
      .input('lugar_incidente', 
        sql.Text, lugar_incidente)
      .input('id_usuario_registro', 
        sql.Int, id_usuario)
      .input('ip_address', sql.VarChar, req.ip)
      .output('id_expediente_out', sql.Int)
      .execute('sp_crear_expediente');

    res.status(201).json({
      mensaje: 'Expediente creado exitosamente',
      id_expediente: result.output.id_expediente_out
    });
  } catch (error) {
    next(error);
  }
};

const actualizarExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      numero_expediente, 
      descripcion_general, 
      fecha_incidente, 
      lugar_incidente 
    } = req.body;
    
    const id_usuario = req.user.id_usuario;

    const pool = getPool();
    
    // Verificar permisos
    const expedienteResult = await pool.request()
      .input('id_expediente', sql.Int, id)
      .query(`
        SELECT e.id_expediente, 
               e.id_usuario_registro, 
               est.nombre as estado
        FROM expediente e
        INNER JOIN estado_expediente est 
          ON e.id_estado = est.id_estado
        WHERE e.id_expediente = @id_expediente
      `);

    if (expedienteResult.recordset.length === 0) {
      return res.status(404)
        .json({ error: 'Expediente no encontrado' });
    }

    const expediente = expedienteResult.recordset[0];
    
    // Validar propietario
    const usuarioResult = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query(`
        SELECT r.nombre as rol
        FROM usuario u 
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario
      `);

    const rolUsuario = usuarioResult.recordset[0]?.rol;
    
    if (expediente.id_usuario_registro !== id_usuario 
        && rolUsuario !== 'Administrador') {
      return res.status(403).json({ 
        error: 'No tiene permisos' 
      });
    }
    
    // Validar estado
    if (expediente.estado !== 'En Registro') {
      return res.status(400).json({ 
        error: 'Solo se pueden modificar expedientes en registro' 
      });
    }

    // Actualizar
    await pool.request()
      .input('id_expediente', sql.Int, id)
      .input('numero_expediente', 
        sql.VarChar, numero_expediente)
      .input('descripcion_general', 
        sql.VarChar, descripcion_general)
      .input('fecha_incidente', 
        sql.Date, fecha_incidente)
      .input('lugar_incidente', 
        sql.VarChar, lugar_incidente)
      .query(`
        UPDATE expediente 
        SET numero_expediente = @numero_expediente,
            descripcion_general = @descripcion_general,
            fecha_incidente = @fecha_incidente,
            lugar_incidente = @lugar_incidente,
            fecha_modificacion = GETDATE()
        WHERE id_expediente = @id_expediente
      `);

    res.json({ 
      mensaje: 'Expediente actualizado exitosamente' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  crearExpediente, 
  actualizarExpediente 
};
```

### 4.5 Rutas del API
Define los endpoints públicos del módulo de expedientes, asociando controladores, validaciones y middleware de seguridad.

**Archivo: `backend/src/routes/expedienteRoutes.js`**

```javascript
const express = require('express');
const { body } = require('express-validator');
const { 
  listarExpedientes, 
  crearExpediente, 
  obtenerExpediente,
  actualizarExpediente,
  eliminarExpediente
} = require('../controllers/expedienteController');
const { 
  authenticateToken, 
  authorizeRoles 
} = require('../middlewares/authMiddleware');
const { 
  validateRequest 
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Listar expedientes
router.get('/', 
  authenticateToken, 
  listarExpedientes
);

// Crear expediente
router.post('/', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  body('numero_expediente')
    .notEmpty()
    .withMessage('Número requerido'),
  body('descripcion_general')
    .notEmpty()
    .withMessage('Descripción requerida'),
  validateRequest
], crearExpediente);

// Obtener expediente por ID
router.get('/:id', 
  authenticateToken, 
  obtenerExpediente
);

// Actualizar expediente
router.put('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador'),
  validateRequest
], actualizarExpediente);

// Eliminar expediente
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('Técnico', 'Administrador')
], eliminarExpediente);

module.exports = router;
```
---

# 5. Frontend

## 5.1 Contexto de Usuario

El contexto administra el estado global del usuario autenticado, permitiendo compartir información como datos personales, permisos, rol y token entre todos los componentes del sistema sin usar prop-drilling. Su objetivo principal es centralizar información crítica de sesión.

**Archivo: frontend/src/context/usuarioContext.tsx**
```ts
export const initialState: Usuario = new Usuario(
    '',           // nombre
    '',           // apellido
    '',           // email
    0,            // id_rol
    'Sin Rol' as rol, // rol_nombre
    false,        // conectado
    true,         // activo
    null,         // id_usuario
    []            // permisos
);

export type AsyncDispatch = (action: ActionType) => Promise<void> | void;

export interface UsuarioContextValue {
    state: Usuario;
    dispatch: AsyncDispatch;
}

const UsuarioContext = React.createContext<UsuarioContextValue>({
    state: initialState,
    dispatch: async () => {}
});
```


## 5.2 Reducer de Usuario

El reducer define cómo cambia el estado del usuario en función de acciones como iniciar sesión, cerrar sesión, actualizar información o establecer permisos. Además sincroniza el estado con `sessionStorage`, lo que permite mantener la sesión después de recargar el navegador.

**Archivo: `frontend/src/reducers/usuarioReducer.tsx`**

```ts
const ComponentMap = {
    'ExpedientesLista': ExpedientesLista,
    'CrearUsuario': CrearUsuario,
    'NuevoExpediente': NuevoExpediente,
    'DetalleExpediente': DetalleExpediente,
    'EditarExpediente': EditarExpediente,
    'NuevoIndicio': NuevoIndicio,
    'DetalleIndicio': DetalleIndicio,
    'EditarIndicio': EditarIndicio,
    'Login': Login,
    'ReporteExpedientes': ReportesExpedientes,
    'ReporteEstadisticas': ReporteEstadisticas
};

// --- Tipos Agregados ---

type ComponentType = React.ComponentType<any>;

interface ProtectedRouteProps {
    element: ComponentType;
    isConnected: boolean;
    path: string;
    userRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    element: Component, 
    isConnected, 
    userRole 
}) => {
    if (!isConnected) {
        return <Navigate to="/ingreso" replace />;
    }
    return <Component userRole={userRole} />; 
};

const AppRouter = () => {
    const { state } = useContext(UsuarioContext);

    const generateRoutes = (menu: ItemMenu[]): JSX.Element[] => {
        let routes: JSX.Element[] = [];

        menu.forEach((item) => {
            if (item.ruta && item.componente) {
                const Component = ComponentMap[item.componente as keyof typeof ComponentMap];
                
                if (Component) {
                    routes.push(
                        <Route 
                            key={item.id}
                            path={item.ruta} 
                            element={
                                <ProtectedRoute 
                                    element={Component} 
                                    isConnected={state.conectado}
                                    path={item.ruta}
                                    userRole={state.rol || 'Administrador'} 
                                />
                            } 
                        />
                    );
                } 
            }

            if (item.items && item.items.length > 0) {
                routes = routes.concat(generateRoutes(item.items));
            }
        });

        return routes;
    };

    const dynamicRoutes = state.menuItems ? generateRoutes(state.menuItems) : [];

    return (
        <BrowserRouter>
            <IdleTimerWrapper> 
                {state.conectado && <Menu />}
                
                <Routes>
                    <Route path="/ingreso" element={<Login />} />

                    {/* Rutas generadas dinámicamente desde el menú */}
                    {dynamicRoutes}

                    <Route path="/acceso-denegado" element={<h1>Acceso Denegado</h1>} />

                    {/* Ruta catch-all (Redirección) */}
                    <Route 
                        path="*" 
                        element={<Navigate to=
                        {state.conectado ? "/inicio" : "/ingreso"} />} 
                    />
                    <Route 
                        path="/expedientes/nuevo" 
                        element={
                            state.conectado ? 
                            <NuevoExpediente /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes/:id" 
                        element={
                            state.conectado ? 
                            <DetalleExpediente /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes/:id/indicios/nuevo" 
                        element={
                            state.conectado ? 
                            <NuevoIndicio /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes/:id/editar" 
                        element={
                            state.conectado ? 
                            <EditarExpediente /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes/:id/indicios/:indicioId" 
                        element={
                            state.conectado ? 
                            <DetalleIndicio /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes/:id/indicios/:indicioId/editar" 
                        element={
                            state.conectado ? 
                            <EditarIndicio /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                </Routes>
            </IdleTimerWrapper>
        </BrowserRouter>
    )
}

export default AppRouter;

```

## 5.3 Provider del Usuario

El **UsuarioProvider** es el núcleo que conecta el sistema de autenticación del frontend con el estado global de React. Su función es orquestar:

- La **recuperación de la sesión** desde `sessionStorage`.
- El **manejo centralizado del reducer** (`usuarioReducer`).
- La **ejecución del proceso de login** mediante request real al backend.
- La **exposición del estado y dispatch tipado** al resto de la aplicación.

El resultado es un proveedor robusto que garantiza que todas las vistas del sistema conozcan el estado del usuario, sus permisos y su sesión actual.


**Archivo: frontend/src/provider/usuarioProvider.tsx**
```Typescript
const getUsuarioFromStorage = (): Usuario => {
    const conectado = sessionStorage.getItem('conectado') === 'true';
    if (conectado) {
        return new Usuario(
            sessionStorage.getItem('nombre') || '',
            sessionStorage.getItem('apellido') || '',
            sessionStorage.getItem('email') || '',
            0, // id_rol no se guarda en sessionStorage
            sessionStorage.getItem('rol') || '',
            true,
            true,
            null, // id_usuario no se guarda en sessionStorage
            []
        );
    }
    return initialState;
};

function UsuarioProvider({ children }: { children: React.ReactNode }) {    
    const [state, defaultDispatch] = useReducer(usuarioReducer, getUsuarioFromStorage());
    const dispatch = async (action: ActionType) => {
        if (action.type === 'conectarse') {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email: action.correoElectronico,
                        password: action.password
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('Error de autenticación');
                }
                
                const data = await response.json();
                
                defaultDispatch({ 
                    type: 'iniciar_sesion_exitoso', 
                    payload: {
                        usuario: data.usuario,
                        token: data.token
                    }
                });
                
            } catch (error) {
                console.error("Fallo la conexión:", error);
            }
        } else {
            defaultDispatch(action);
        }
    };

    const contextValue: UsuarioContextValue = {
        state,
        dispatch,
    };

    return (
        <UsuarioContext.Provider value={contextValue}>
            {children}
        </UsuarioContext.Provider>
    );
}
```

## 5.4 Clases de Dominio

Las clases de dominio representan las estructuras fundamentales que el frontend utiliza para modelar la información que proviene del backend. Son *objetos fuertemente tipados* que permiten mantener coherencia, validación implícita y autocompletado en todo el código.  
Estas clases no solo almacenan datos, sino que también ayudan a estructurar la lógica del sistema, especialmente en áreas como **autenticación, permisos y construcción dinámica del menú**.

---

### 5.4.1 Clase `ItemMenu`

`ItemMenu` modela cada opción del menú según los permisos del usuario. Esta clase es clave para construir dinámicamente el árbol de navegación en función del rol y las autorizaciones otorgadas por el backend.

**Archivo: frontend/src/itemMenu.tsx**
```ts
export class ItemMenu {
    id: number;
    nombre: string;
    ruta: string | null;
    icono: string;
    id_opcion_padre: number | null;
    orden: number;    
    componente?: string; 
    items?: Array<ItemMenu>;
    command?: () => void;

    constructor(
        id: number,
        nombre: string,
        ruta: string | null,
        icono: string,
        id_opcion_padre: number | null,
        orden: number,
        componente?: string,
        items?: Array<ItemMenu>,
        command?: () => void
    ) {
        this.id = id;
        this.nombre = nombre;
        this.ruta = ruta;
        this.icono = icono;
        this.id_opcion_padre = id_opcion_padre;
        this.orden = orden;
        this.componente = componente;
        this.items = items;
        this.command = command;
    }
}
```

### 5.4.1 Clase `Usuario`

La clase Usuario modela toda la información relacionada con el usuario autenticado, incluyendo datos personales, rol, permisos específicos y el menú dinámico. Esto permite que el estado global del usuario sea coherente, validado y estructurado.

**Archivo: frontend/src/Usuario.tsx**
```ts
import ItemMenu from "./itemMenu";

export default class Usuario {
    id_usuario: number | null;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    
    id_rol: number; 
    rol: string; 
    
    conectado: boolean;
    activo: boolean;

    permisos: string[]; 
    menuItems: ItemMenu[];
    
    constructor(
        nombre: string,
        apellido: string,
        email: string,
        id_rol: number,
        rol: string,
        conectado: boolean = false,
        activo: boolean = true,
        id_usuario: number | null = null,
        permisos: string[] = [],
        menuItems: ItemMenu[] = []
    ) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.id_rol = id_rol;
        this.rol = rol;
        this.conectado = conectado;
        this.activo = activo;
        this.password_hash = ''; 
        this.permisos = permisos;
        this.menuItems = menuItems;
    }
}
```
---

## 6. Seguridad y Autenticación

El sistema DICRI implementa una arquitectura de seguridad centrada en la protección de la información, el control de acceso y la integridad de las comunicaciones entre servicios. La seguridad se aplica desde el frontend hasta la base de datos, siguiendo principios como **defensa en profundidad**, **mínimo privilegio** y **aislamiento mediante contenedores**.

### 6.1 Autenticación mediante JWT
El backend utiliza **JSON Web Tokens (JWT)** como mecanismo principal de autenticación.  
Su funcionamiento dentro de la arquitectura es:

1. El usuario inicia sesión desde el **Frontend React**.
2. El backend valida las credenciales contra SQL Server.
3. Si son válidas, se genera un token JWT firmado.
4. El frontend almacena el token de forma segura (memoria volátil, nunca en localStorage si se quiere máxima seguridad).
5. Cada petición posterior incluye el token en la cabecera `Authorization: Bearer <token>`.

El JWT permite:
- Identificar al usuario autenticado.
- Incluir claims como roles y permisos.
- Establecer tiempos de expiración para limitar sesiones comprometidas.
- Evitar el manejo de sesiones persistentes en el servidor.

### 6.2 Middleware de Autorización
Cada solicitud al backend pasa por una cadena de **middlewares** que:

- Verifican la validez del JWT.
- Comprueban expiración o firmas manipuladas.
- Extraen el rol del usuario (admin, operador, lector, etc.).
- Evalúan permisos asociados a cada endpoint.
- Registran auditoría básica (IP, timestamp, usuario).

Esto garantiza que únicamente usuarios autorizados puedan acceder a recursos sensibles como:
- Gestión de usuarios  
- Manipulación de evidencia  
- Cambios de estado en expedientes  
- Acceso a información histórica  

### 6.3. Aislamiento Mediante Docker
La seguridad también se refuerza en el nivel de infraestructura:

- **Frontend**, **Backend** y **SQL Server** se ejecutan en contenedores separados.
- Todos están dentro de una **Docker Network interna**, inaccesible desde el exterior.
- Solo el frontend expone el puerto **80** al público.
- Ni el backend ni la base de datos exponen puertos fuera de la red interna.
- SQL Server solo acepta conexiones del backend.

Esto minimiza la superficie de ataque y bloquea accesos directos no autorizados.

### 6.4. Seguridad en la Comunicación Interna
Aunque la comunicación ocurre dentro de una red interna, se aplican principios clave:

- El backend valida todos los datos provenientes del frontend.
- Las consultas SQL utilizan parámetros para evitar **inyección SQL**.
- El frontend solo consume endpoints permitidos; no se conecta a servicios internos.
- El uso de tokens evita exposición de credenciales en cada llamada.

### 6.5. Manejo Seguro de Errores y Respuestas
Para evitar filtración de información sensible:

- El backend no devuelve mensajes que revelen estructura interna, tablas o lógica de negocio.
- Los errores críticos se registran internamente pero se responde al cliente con mensajes genéricos.
- El sistema filtra datos antes de enviarlos al frontend para evitar fugas involuntarias.

### 6.6 Protección de la Base de Datos
SQL Server está protegido por:
- Acceso restringido únicamente al contenedor del backend.
- Usuarios con privilegios mínimos.
- Auditoría y logs de acciones realizadas por triggers

### 6.7. Seguridad en el Frontend
Aunque el frontend no maneja lógica sensible, se aplican medidas de protección:

- Validación de formularios antes de enviar datos al backend.
- Uso correcto de headers en las peticiones.
- No exponer credenciales ni configuraciones sensibles en el código.
- Renderizado basado en roles: solo se muestran opciones permitidas para el usuario logueado.

En conjunto, la arquitectura aplica mecanismos de autenticación, autorización, aislamiento de servicios, manejo seguro de datos y controles de acceso que garantizan integridad, disponibilidad y confidencialidad dentro del sistema DICRI.

---

## 7. Configuración y Despliegue

La configuración y despliegue del sistema DICRI se realiza mediante una arquitectura basada en contenedores utilizando **Docker Compose**, lo que permite un entorno reproducible, desacoplado y fácil de administrar. Todos los componentes del sistema —Frontend, Backend y Base de Datos— se orquestan dentro de una misma red interna para garantizar seguridad, estabilidad y escalabilidad.

### 7.1 Orquestación con Docker Compose
El sistema define sus servicios principales en un archivo `docker-compose.yml`, incluyendo:

- **Frontend (React)**  
  Construido como un contenedor que expone el puerto **80**, siendo el único punto accesible desde el exterior.

- **Backend (Laravel o Node según implementación previa)**  
  Ejecutado en un contenedor aislado, accesible solo desde la red interna de Docker y escuchando en el puerto **5000**.

- **Base de Datos (SQL Server)**  
  Contenedor que expone internamente el puerto **1433**, sin exponerlo al exterior del host.

Cada servicio está configurado para comunicarse mediante una **Docker Network** personalizada, lo que aísla completamente las capas internas del sistema y evita accesos directos no autorizados.

### 7.2 Red Interna y Aislamiento
Docker Compose crea y administra automáticamente una red interna donde viven todos los servicios.

- El frontend consume al backend usando su alias interno (por ejemplo, `http://backend:5000`).
- El backend se conecta a SQL Server usando su hostname interno (por ejemplo, `sqlserver`).
- Ningún contenedor interno expone puertos hacia el host, excepto el frontend.

Esto garantiza:
- Aislamiento total de la base de datos.
- Eliminación de amenazas externas directas.
- Control total del tráfico entre servicios.

### 7.3. Configuración de Variables de Entorno
Estas son consumidas y distribuidas en la definicion del docker compose

- El **Backend** define:
  - Cadena de conexión a SQL Server.
  - Secret key para JWT.
  - Configuración de puertos.
  - Parámetros de debug y entorno (dev, prod).

- El **Frontend** define:
  - URL de la API del backend: `REACT_APP_API_URL`
  - Otros valores específicos del entorno.

- El sistema no expone variables sensibles en el código fuente.

### 7.4. Gestión de Dependencias y Build
#### Frontend:
- Construcción automatizada usando `Dockerfile`.
- Empaquetado optimizado utilizando herramientas como `npm run build`.
- Despliegue dentro de un contenedor tipo NGINX o un servidor ligero similar.

#### Backend:
- Instalación automática de dependencias (`composer install` o `npm install`).
- Ejecución de migraciones en SQL Server si corresponde.
- Servidor dentro del contenedor preparado para producción.


### 7.5. Despliegue en Entornos
El sistema puede ser levantado con:

```sh
docker-compose up -d --build # para el despliegue sin logs
docker-compose up --build # para el despliegue con logs

```
Con este comando se logra:

- Construcción o reconstrucción automática de imágenes.  
- Levantamiento de los tres contenedores.  
- Creación automática de la red interna y los volúmenes necesarios.  
- Acceso al sistema desde el navegador vía `http://localhost` o desde el dominio configurado.

## 7.6 Persistencia de Datos

Se usan volúmenes de Docker para:

- Mantener los datos de SQL Server.  
- Realizar respaldos fácilmente.  
- Asegurar que los datos sobrevivan reinicios.

## 7.7 Escalabilidad

El sistema permite:

- Replicar el contenedor del Frontend.  
- Escalar el Backend horizontalmente.  
- Migrar SQL Server a infraestructura dedicada si es necesario.

## 7.8 Flujo de Despliegue (resumen técnico)

1. Definir variables en `.env`.  
2. Construir imágenes del Frontend, Backend y SQL Server.  
3. Crear red interna automáticamente.  
4. Iniciar servicios en el orden correcto.  
5. Exponer solo el Frontend.  
6. Permitir comunicación interna segura.

---

## 8. Pruebas con Postman

Esta sección está destinada a la prueba de las API del sistema utilizando **Postman**. Aquí podrás encontrar un conjunto de solicitudes configuradas para probar los diferentes endpoints del backend de manera eficiente.  
El enlace a la colección de Postman incluye:

- Pruebas de autenticación (login, JWT).  
- Validación de rutas protegidas.  
- Verificación de operaciones CRUD sobre expedientes e indicios.  
- Manejo de respuestas y errores del servidor.

Para empezar, simplemente importa la colección de Postman proporcionada en el siguiente enlace:

[Acceder a la colección de Postman](https://www.postman.com/cryosat-physicist-73328283-4649171/develop/documentation/wwpucll/dicri-sistema-api)

### Archivos de Postman disponibles:
- [Colección de Postman en formato JSON](DICRI_Development.postman_environment.json)  
- [Ambiente de Postman en formato JSON](DICRI_Development.postman_environment.json)
