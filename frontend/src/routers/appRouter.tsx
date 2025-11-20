import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../componentes/login';
import CrearUsuario from '../componentes/crearUsuario';
import ExpedientesLista from '../componentes/expedientesLista';
import NuevoExpediente from '../componentes/nuevoExpediente';
import DetalleExpediente from '../componentes/detalleExpediente';
import UsuarioContext from '../context/usuarioContext';
import Menu from '../navbar/menu';
import IdleTimerWrapper from '../componentes/IdleTimerWrapper';
import ItemMenu from "../clases/itemMenu";

const ComponentMap = {
    'ExpedientesLista': ExpedientesLista,
    'CrearUsuario': CrearUsuario,
    'NuevoExpediente': NuevoExpediente,
    'DetalleExpediente': DetalleExpediente,
    'Login': Login,
    // Agrega aquí otros componentes dinámicos
};

// --- Tipos Agregados ---

type ComponentType = React.ComponentType<any>;

interface ProtectedRouteProps {
    element: ComponentType;
    isConnected: boolean;
    path: string;
    userRole: string; // Recibe el nombre del rol (ej: 'Administrador')
}

// --- Componente de Ruta Protegida ---
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    element: Component, 
    isConnected, 
    userRole 
}) => {
    if (!isConnected) {
        return <Navigate to="/ingreso" replace />;
    }
    // Pasa el userRole al componente de la página
    return <Component userRole={userRole} />; 
};

// --- Componente Principal del Router ---
const AppRouter = () => {
    const { state } = useContext(UsuarioContext);

    const generateRoutes = (menu: ItemMenu[]): JSX.Element[] => {
        let routes: JSX.Element[] = [];

        menu.forEach((item) => {
            // Verifica que el ítem tenga ruta y un componente definido por la BD
            if (item.ruta && item.componente) {
                const Component = ComponentMap[item.componente as keyof typeof ComponentMap];
                
                if (Component) {
                    routes.push(
                        <Route 
                            key={item.id} // Asume que ItemMenu tiene 'id' para la key
                            path={item.ruta} 
                            element={
                                <ProtectedRoute 
                                    element={Component} 
                                    isConnected={state.conectado}
                                    path={item.ruta}
                                    // CORRECCIÓN: Usar state.rol_nombre para la propiedad userRole
                                    userRole={state.rol || 'Técnico'} 
                                />
                            } 
                        />
                    );
                } 
            }

            // Llamada recursiva para sub-ítems
            if (item.items && item.items.length > 0) {
                routes = routes.concat(generateRoutes(item.items));
            }
        });

        return routes;
    };

    // La propiedad 'menuItems' del estado del usuario debe contener un array de ItemMenu
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
                </Routes>
            </IdleTimerWrapper>
        </BrowserRouter>
    )
}

export default AppRouter;