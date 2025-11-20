import Usuario from "../clases/usuario";
import { ActionType, UsuarioReducer } from "../types/actions";

const guardarSesion = (usuario: Usuario) => {
    sessionStorage.setItem("nombre", usuario.nombre);
    sessionStorage.setItem("email", usuario.email); 
    sessionStorage.setItem("conectado", usuario.conectado.toString());
    sessionStorage.setItem("rol_nombre", usuario.rol_nombre);
}

const limpiarSesion = () => {
    sessionStorage.removeItem("nombre");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("conectado");
    sessionStorage.removeItem("rol_nombre");
}

export const usuarioReducer: UsuarioReducer = (state: Usuario, action: ActionType): Usuario => {
    switch (action.type) {
        
        case 'iniciar_sesion_exitoso': {
            const nuevoEstado = {
                ...action.payload,
                conectado: true,
                activo: true,
            };
            guardarSesion(nuevoEstado);
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
        case 'crear_usuario':
        case 'conectarse':
        default:
            return state;
    }
};