import ItemMenu from "./itemMenu";

export default class Usuario {
    id_usuario: number | null;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    
    id_rol: number; 
    rol: string; 
    
    conectado: boolean;
    activo: boolean;

    permisos: string[]; 
    menuItems: ItemMenu[];
    
    constructor(
        nombre: string,
        apellido: string,
        email: string,
        id_rol: number,
        rol: string,
        conectado: boolean = false,
        activo: boolean = true,
        id_usuario: number | null = null,
        permisos: string[] = [],
        menuItems: ItemMenu[] = []
    ) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.id_rol = id_rol;
        this.rol = rol;
        this.conectado = conectado;
        this.activo = activo;
        this.password_hash = ''; 
        this.permisos = permisos;
        this.menuItems = menuItems;
    }
}