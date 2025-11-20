export class ItemMenu {
    id: number;
    nombre: string;
    ruta: string | null;
    icono: string;
    id_opcion_padre: number | null;
    orden: number;    
    componente?: string; 
    items?: Array<ItemMenu>;
    command?: () => void;

    constructor(
        id: number,
        nombre: string,
        ruta: string | null,
        icono: string,
        id_opcion_padre: number | null,
        orden: number,
        componente?: string,
        items?: Array<ItemMenu>,
        command?: () => void
    ) {
        this.id = id;
        this.nombre = nombre;
        this.ruta = ruta;
        this.icono = icono;
        this.id_opcion_padre = id_opcion_padre;
        this.orden = orden;
        this.componente = componente;
        this.items = items;
        this.command = command;
    }
}

export default ItemMenu;