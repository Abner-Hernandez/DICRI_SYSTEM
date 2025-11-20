class ItemMenu {
    label: string;
    items?: Array<ItemMenu>;
    command: any
    constructor(label?: string, items?: Array<ItemMenu>, command?: () => void){
        this.label = label || '';
        this.items = items;
        this.command = command;
    }
}

export default ItemMenu;