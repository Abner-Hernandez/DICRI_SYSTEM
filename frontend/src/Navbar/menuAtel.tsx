import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import usuarioContext from '../context/usuarioContext';

import {
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button as MuiButton,
    Collapse
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Usuario from '../clases/usuario';
import { ActionType } from '../types/actions';


// --- Interfaces (Deberías moverlas a un archivo de tipos común, e.g., types/menu.ts) ---

interface ItemMenuData {
    nombre: string;
    incluyeEnMenu: boolean;
    items?: ItemMenuData[];
}

interface ItemMenuState {
    nombre: string;
    items?: ItemMenuState[];
    command?: () => void;
}

interface MenuItemMUIProps {
    item: ItemMenuState;
    navigate: (path: string) => void;
    setVisibleMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UsuarioState {
    conectado: boolean;
}

interface UsuarioContextValue {
    state: Usuario;
    dispatch: React.Dispatch<ActionType>;
}

const TypedUsuarioContext = usuarioContext as React.Context<UsuarioContextValue>;

// --- Componente Recursivo ---

const MenuItemMUI: React.FC<MenuItemMUIProps> = ({ item, navigate, setVisibleMenu }) => {
    const [open, setOpen] = useState(false);
    const hasSubitems = item.items && item.items.length > 0;

    const handleClick = () => {
        if (hasSubitems) {
            setOpen(!open);
        } else if (item.command) {
            item.command();
            setVisibleMenu(false);
        }
    };

    const IconComponent = item.nombre === 'Inicio' ? HomeIcon : HomeIcon;

    return (
        <>
            <ListItem disablePadding>
                <ListItemButton
                    onClick={handleClick}
                    sx={{ pl: hasSubitems ? 2 : 2 }}
                >
                    <ListItemIcon>
                        <IconComponent />
                    </ListItemIcon>
                    <ListItemText primary={item.nombre} />
                    {hasSubitems && (open ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
            </ListItem>

            {hasSubitems && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                        {item.items!.map((subItem, index) => (
                            <MenuItemMUI
                                key={index}
                                item={subItem}
                                navigate={navigate}
                                setVisibleMenu={setVisibleMenu}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

// --- Componente Principal ---

const MenuAtel: React.FC = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);
    const [items, setItems] = useState<ItemMenuState[]>([]);
    const usuario = useContext(TypedUsuarioContext);

    const obtenerMenus = (menu: ItemMenuData[]): ItemMenuState[] => {
        return menu.length > 0 ? menu.map((item) => {
            let itemMenu: ItemMenuState = { nombre: item.nombre };

            if (item.items && item.items.length > 0) {
                itemMenu.items = obtenerMenus(item.items);
            }
            if (item.incluyeEnMenu) {
                itemMenu.command = () => {
                    navigate("/" + item.nombre.replace(/ /g, '').toLowerCase());
                    setOpenDrawer(false);
                }
            }
            return itemMenu;
        }) : [];
    }

    useEffect(() => {
        const menus: ItemMenuData[] = [
            {
                nombre: "Inicio",
                incluyeEnMenu: true
            },
            {
                nombre: "Configuración",
                incluyeEnMenu: false,
                items: [
                    { nombre: "Usuarios", incluyeEnMenu: true },
                    { nombre: "Roles", incluyeEnMenu: true }
                ]
            },
        ];
        setItems(obtenerMenus(menus));
    }, []);

    const handleLogout = async () => {
        await usuario.dispatch({ type: "desconectarse" });
        navigate("/ingreso");
    };

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setOpenDrawer(open);
    };

    const drawerList = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
        >
            <List>
                {items.map((item, index) => (
                    <MenuItemMUI
                        key={index}
                        item={item}
                        navigate={navigate}
                        setVisibleMenu={setOpenDrawer}
                    />
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Mi Aplicación
                    </Typography>

                    <MuiButton color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Salir
                    </MuiButton>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor={'left'}
                open={openDrawer}
                onClose={toggleDrawer(false)}
            >
                {drawerList}
            </Drawer>
        </Box>
    );
}

export default MenuAtel;