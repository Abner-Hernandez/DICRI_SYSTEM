import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../componentes/login';
import CrearUsuario from '../componentes/crearUsuario';
import ExpedientesLista from '../componentes/expedientesLista';
import NuevoExpediente from '../componentes/nuevoExpediente';
import DetalleExpediente from '../componentes/detalleExpediente';
import UsuarioContext from '../context/usuarioContext';
import MenuAtel from '../Navbar/menuAtel';
import IdleTimerWrapper from '../componentes/IdleTimerWrapper';

const AppRouter = () => {
    const { state } = useContext(UsuarioContext);

    return (
        <BrowserRouter>
            <IdleTimerWrapper> 
                {state.conectado && <MenuAtel />}
                
                <Routes>
                    <Route path="/ingreso" element={<Login />} />
                    <Route path="/crear-usuario" element={<CrearUsuario />} />
                    <Route 
                        path="/inicio" 
                        element={
                            state.conectado ? 
                            <ExpedientesLista userRole={state.rol_nombre || 'Técnico'} /> : 
                            <Navigate to="/ingreso" />
                        } 
                    />
                    <Route 
                        path="/expedientes" 
                        element={
                            state.conectado ? 
                            <ExpedientesLista userRole={state.rol_nombre || 'Técnico'} /> : 
                            <Navigate to="/ingreso" />
                        } 
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
                    <Route path="/acceso-denegado" element={<h1>Acceso Denegado</h1>} />
                    <Route 
                        path="*" 
                        element={<Navigate to={state.conectado ? "/inicio" : "/ingreso"} />} 
                    />
                </Routes>
            </IdleTimerWrapper>
        </BrowserRouter>
    )
}

export default AppRouter;