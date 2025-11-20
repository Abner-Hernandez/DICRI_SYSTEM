import Usuario from "../clases/usuario";
import { ActionType, UsuarioReducer } from "../types/actions";

const guardarSesion = (usuario: Usuario, token?: string) => {
    sessionStorage.setItem("nombre", usuario.nombre);
    sessionStorage.setItem("email", usuario.email); 
    sessionStorage.setItem("conectado", usuario.conectado.toString());
    sessionStorage.setItem("rol", usuario.rol);
    if (token) {
        sessionStorage.setItem("token", token);
    }
}

const limpiarSesion = () => {
    sessionStorage.removeItem("nombre");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("conectado");
    sessionStorage.removeItem("rol");
    sessionStorage.removeItem("token");
}

export const usuarioReducer: UsuarioReducer = (state: Usuario, action: ActionType): Usuario => {
    switch (action.type) {
        
        case 'iniciar_sesion_exitoso': {
            const nuevoEstado = {
                ...action.payload.usuario,
                conectado: true,
                activo: true,
            };
            guardarSesion(nuevoEstado, action.payload.token);
            return nuevoEstado;
        }

        case 'desconectarse': {
            limpiarSesion();
            return new Usuario('', '', '', 0, '', false, false, null, []);
        }

        case 'actualizar_usuario': {
            const nuevoEstado = { ...state, ...action.payload };
            if (nuevoEstado.conectado) {
                 // Puedes optar por actualizar sessionStorage aquí si cambian datos clave
            }
            return nuevoEstado;
        }
        
        case 'establecerMenu':
            return {
                ...state,
                menuItems: action.payload,
            };
        case 'crear_usuario':
        case 'conectarse':
        default:
            return state;
    }
};