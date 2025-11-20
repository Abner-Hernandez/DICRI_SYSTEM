import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../componentes/login';
import CrearUsuario from '../componentes/crearUsuario';
import UsuarioContext from '../context/usuarioContext';
import Menu from '../navbar/menu';
import IdleTimerWrapper from '../componentes/IdleTimerWrapper';

const AppRouter = () => {
    const { state } = useContext(UsuarioContext);

    return (
        <BrowserRouter>
            <IdleTimerWrapper> 
                {state.conectado && <Menu />}
                
                <Routes>
                    <Route path="/ingreso" element={<Login />} />
                    <Route path="/crear-usuario" element={<CrearUsuario />} />
                    <Route path="/inicio" element={<h1>Página de Inicio</h1>} />
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