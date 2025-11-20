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
    Collapse,
    CircularProgress
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import BallotIcon from '@mui/icons-material/Ballot';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import Usuario from '../clases/usuario';
import { ActionType } from '../types/actions';

interface ItemMenuData {
    id: number;
    nombre: string;
    ruta: string | null;
    icono: string;
    incluyeEnMenu: boolean;
    items?: ItemMenuData[];
}

interface ItemMenuState {
    nombre: string;
    icono?: string;
    items?: ItemMenuState[];
    command?: () => void;
}

interface MenuItemMUIProps {
    item: ItemMenuState;
    navigate: (path: string) => void;
    setVisibleMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UsuarioContextValue {
    state: Usuario;
    dispatch: React.Dispatch<ActionType>;
}

const TypedUsuarioContext = usuarioContext as React.Context<UsuarioContextValue>;

const iconMap: { [key: string]: React.ComponentType } = {
    HomeIcon,
    FolderIcon,
    AssessmentIcon,
    SettingsIcon,
    HistoryIcon,
    AddIcon,
    ListIcon,
    RateReviewIcon,
    ViewListIcon,
    CheckCircleIcon,
    DescriptionIcon,
    BarChartIcon,
    BallotIcon,
    PeopleIcon,
    SecurityIcon,
    CategoryIcon
};

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

    const IconComponent = item.icono && iconMap[item.icono] ? iconMap[item.icono] : HomeIcon;

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

const Menu: React.FC = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);
    const [items, setItems] = useState<ItemMenuState[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const usuario = useContext(TypedUsuarioContext);

    const obtenerMenus = (menu: ItemMenuData[]): ItemMenuState[] => {
        return menu.map((item) => {
            let itemMenu: ItemMenuState = { 
                nombre: item.nombre,
                icono: item.icono
            };

            if (item.items && item.items.length > 0) {
                itemMenu.items = obtenerMenus(item.items);
            }
            
            if (item.incluyeEnMenu && item.ruta) {
                itemMenu.command = () => {
                    navigate(item.ruta!);
                    setOpenDrawer(false);
                }
            }
            
            return itemMenu;
        });
    };

    const cargarMenuDesdeAPI = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/menu`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el menú');
            }

            const data = await response.json();
            usuario.dispatch({ type: "establecerMenu", payload: data.menu });
            setItems(obtenerMenus(data.menu));
        } catch (error) {
            console.error('Error cargando menú:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarMenuDesdeAPI();
    }, []);

    const handleLogout = async () => {
        await usuario.dispatch({ type: "desconectarse" });
        localStorage.removeItem('token');
        navigate("/ingreso");
    };

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && 
            ((event as React.KeyboardEvent).key === 'Tab' || 
             (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setOpenDrawer(open);
    };

    const drawerList = (
        <Box sx={{ width: 250 }} role="presentation">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
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
            )}
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
                        Sistema DICRI
                    </Typography>

                    {usuario.state && (
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {usuario.state.nombre} ({usuario.state.rol})
                        </Typography>
                    )}

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

export default Menu;