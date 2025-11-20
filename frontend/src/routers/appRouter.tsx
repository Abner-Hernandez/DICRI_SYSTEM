import { useReducer, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../componentes/login';
import CrearUsuario from '../componentes/crearUsuario';
import UsuarioContext, { initialState, UsuarioContextValue } from '../context/usuarioContext';
import MenuAtel from '../Navbar/menuAtel';

import { usuarioReducer } from '../reducers/usuarioReducer'; 

import { useIdleTimer } from 'react-idle-timer'

const AppRouter = () => {
    const [state, dispatch] = useReducer(usuarioReducer, initialState);

    const onIdle = () => {
        if(state.conectado){
            dispatch({type: "desconectarse"})
        }
    }

    const { getRemainingTime } = useIdleTimer({
        onIdle,
        timeout: 1000 * 60 * 2,
        throttle: 500,
    });
    
    const contextValue: UsuarioContextValue = { state, dispatch };

    return (
        <BrowserRouter>
            {/* Proveemos el contexto a toda la aplicación */}
            <UsuarioContext.Provider value={contextValue}>
                {/* Mostramos el menú si el usuario está conectado */}
                {state.conectado && <MenuAtel />}
                
                <Routes>
                    {/* El login (Ingreso) debe ser accesible para CUALQUIER USUARIO (conectado o desconectado) */}
                    <Route path="/ingreso" element={<Login />} />
                    
                    {/* Ejemplo de componente con restricción de permiso (CrearUsuario) */}
                    <Route path="/crear-usuario" element={<CrearUsuario />} />
                    
                    {/* Otras rutas de la aplicación */}
                    <Route path="/inicio" element={<h1>Página de Inicio (Acceso Libre para Conectados)</h1>} />
                    <Route path="/acceso-denegado" element={<h1>Acceso Denegado: No tienes los permisos necesarios.</h1>} />

                    {/* Ruta por defecto: redirigir a /inicio si está conectado, a /ingreso si no */}
                    <Route 
                        path="*" 
                        element={<Navigate to={state.conectado ? "/inicio" : "/ingreso"} />} 
                    />
                </Routes>
            </UsuarioContext.Provider>
        </BrowserRouter>
    )
}

export default AppRouter;