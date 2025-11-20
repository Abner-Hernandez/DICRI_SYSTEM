import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../componentes/login';
import CrearUsuario from '../componentes/crearUsuario';
import ExpedientesLista from '../componentes/expedientesLista';
import NuevoExpediente from '../componentes/nuevoExpediente';
import DetalleExpediente from '../componentes/detalleExpediente';
import EditarExpediente from '../componentes/editarExpediente';
import NuevoIndicio from '../componentes/nuevoIndicio';
import DetalleIndicio from '../componentes/detalleIndicio';
import EditarIndicio from '../componentes/editarIndicio';
import UsuarioContext from '../context/usuarioContext';
import Menu from '../navbar/menu';
import IdleTimerWrapper from '../componentes/IdleTimerWrapper';
import ItemMenu from "../clases/itemMenu";

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
                        element={<Navigate to={state.conectado ? "/inicio" : "/ingreso"} />} 
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