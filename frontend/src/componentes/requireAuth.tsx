import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import usuarioContext from "../context/usuarioContext";

const Autenticado = () => {
    const usuario = useContext(usuarioContext);
    return usuario.state.conectado;
}

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    return !Autenticado() ? <Navigate to="/ingreso" state={{ from: location }} replace /> : children;
}

export default RequireAuth;