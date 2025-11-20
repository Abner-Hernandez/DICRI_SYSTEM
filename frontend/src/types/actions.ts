import Usuario from "../clases/usuario";

type RolNombre = string;

export type ActionType = 
    | { type: 'conectarse'; correoElectronico: string; password: string; }
    | { type: 'desconectarse' }
    | { type: 'actualizar_usuario', payload: Usuario } 
    | { type: 'iniciar_sesion_exitoso', payload: { usuario: Usuario; token: string } }
    | { 
        type: 'crear_usuario', 
        nombre: string, 
        apellido: string,
        email: string,
        password: string,
        id_rol: number,
        rol_nombre: RolNombre
    };

export type UsuarioReducer = (state: Usuario, action: ActionType) => Usuario;