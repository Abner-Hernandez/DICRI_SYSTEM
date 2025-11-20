import ItemMenu from "../clases/itemMenu";
import Usuario from "../clases/usuario";

type rol = string;

export type ActionType = 
    | { type: 'conectarse'; correoElectronico: string; password: string; }
    | { type: 'desconectarse' }
    | { type: 'actualizar_usuario', payload: Usuario } 
    | { type: 'iniciar_sesion_exitoso', payload: { usuario: Usuario; token: string } }
    | { type: 'establecerMenu', payload: ItemMenu[] }
    | { 
        type: 'crear_usuario', 
        nombre: string, 
        apellido: string,
        email: string,
        password: string,
        id_rol: number,
        rol: rol
    };

export type UsuarioReducer = (state: Usuario, action: ActionType) => Usuario;