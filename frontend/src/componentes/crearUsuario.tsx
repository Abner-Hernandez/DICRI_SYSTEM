import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import usuarioContext, { UsuarioContextValue } from '../context/usuarioContext'; 
import Usuario from '../clases/usuario';
import usePermisos from '../hooks/usePermisos';

import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Paper,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    InputAdornment,
    Divider,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    CircularProgress,
} from '@mui/material';

import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// El tipo RolNombre no es necesario aquí si se usa 'string' en la clase Usuario

interface RolCatalogo {
    id: number;
    nombre: string; // Tipo flexible para nombres de roles cargados de la BD
}

// Función mock para simular la obtención de roles del backend
const obtenerRolesBackend = (): Promise<RolCatalogo[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Estos son datos simulados que deberían provenir de una llamada real a tu API
            resolve([
                { id: 1, nombre: 'Administrador' },
                { id: 2, nombre: 'Coordinador' },
                { id: 3, nombre: 'Técnico' },
            ]);
        }, 500); 
    });
};

interface RegistroFormData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmarPassword: string;
    aceptaPoliticas: boolean;
    rolSeleccionado: string; // Tipo flexible para el formulario
}

const PERMISO_REQUERIDO = 'usuario_crear';

const CrearUsuario: React.FC = () => {
    const navigate = useNavigate();
    const usuario = useContext(usuarioContext) as UsuarioContextValue;
    const { tienePermiso } = usePermisos();
    const [mostrarMensaje, setMostrarMensaje] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [roles, setRoles] = useState<RolCatalogo[]>([]);
    const [cargandoRoles, setCargandoRoles] = useState(true);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const valoresPorDefecto: RegistroFormData = {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmarPassword: '',
        aceptaPoliticas: false,
        rolSeleccionado: '',
    };

    const { control, formState: { errors }, handleSubmit, reset, watch } = useForm<RegistroFormData>({ defaultValues: valoresPorDefecto });
    
    const passwordValue = watch("password");

    const verificarAcceso = useCallback(() => {
        const usuarioConectado = usuario.state.conectado;
        const accesoPermitido = tienePermiso(PERMISO_REQUERIDO);

        if (!usuarioConectado) {
            navigate('/ingreso');
            return false;
        }

        if (!accesoPermitido) {
            navigate('/acceso-denegado');
            return false;
        }
        return true;
    }, [usuario.state.conectado, tienePermiso, navigate]);

    useEffect(() => {
        if (!verificarAcceso()) return;

        const cargarRoles = async () => {
            try {
                const data = await obtenerRolesBackend();
                setRoles(data);
            } catch (error) {
                setRoles([]);
            } finally {
                setCargandoRoles(false);
            }
        };

        cargarRoles();
    }, [verificarAcceso]);

    const onSubmit = async (data: RegistroFormData) => {
        if(data.password !== data.confirmarPassword) {
            return;
        }

        if (!tienePermiso(PERMISO_REQUERIDO)) {
            alert('Acción no permitida.');
            return;
        }

        const rolInfo = roles.find(r => r.nombre === data.rolSeleccionado);
        if (!rolInfo) return;

        await usuario.dispatch({
            type: 'crear_usuario',
            nombre: data.nombre, 
            apellido: data.apellido,
            email: data.email,
            password: data.password,
            id_rol: rolInfo.id,
            // Aquí enviamos el nombre del rol como string.
            rol_nombre: rolInfo.nombre, 
        });
        
        let usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") as string) || [];
        
        usuarios.push(new Usuario(
            data.nombre, 
            data.apellido, 
            data.email, 
            rolInfo.id, 
            rolInfo.nombre, 
            false, 
            true
        )); 
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        
        setMostrarMensaje(true);
        reset();
    };

    const passwordRules = [
        { label: 'Al menos una minúscula', regex: /(?=.*[a-z])/, valid: /(?=.*[a-z])/.test(passwordValue) },
        { label: 'Al menos una mayúscula', regex: /(?=.*[A-Z])/, valid: /(?=.*[A-Z])/.test(passwordValue) },
        { label: 'Al menos un número', regex: /(?=.*\d)/, valid: /(?=.*\d)/.test(passwordValue) },
        { label: 'Mínimo 8 caracteres', regex: /.{8,}/, valid: /.{8,}/.test(passwordValue) },
    ];

    const PasswordRulesList = (
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2">Reglas de Contraseña</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
                {passwordRules.map((rule, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckIcon color={rule.valid ? "success" : "disabled"} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                            primary={rule.label} 
                            sx={{ color: rule.valid ? 'text.primary' : 'text.secondary' }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const dialogFooterMUI = (
        <DialogActions sx={{ justifyContent: 'center' }}>
            <Button onClick={() => setMostrarMensaje(false)} variant="contained" autoFocus>
                OK
            </Button>
        </DialogActions>
    );

    if (cargandoRoles) {
        return (
            <Container component="main" maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Cargando catálogos de roles...</Typography>
            </Container>
        );
    }
    
    if (roles.length === 0) {
        return (
            <Container component="main" maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography color="error" variant="h6">No se encontraron roles disponibles. Contacte al administrador.</Typography>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            
            <Dialog 
                open={mostrarMensaje} 
                onClose={() => setMostrarMensaje(false)} 
                aria-labelledby="registro-exitoso"
                maxWidth="xs"
                fullWidth
            >
                <DialogContent sx={{ textAlign: 'center', pt: 6, px: 3 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: '5rem', color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" component="h2" gutterBottom>
                        Usuario Creado Exitosamente!
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        La cuenta para **{usuario.state.nombre}** ha sido creada.
                    </Typography>
                </DialogContent>
                {dialogFooterMUI}
            </Dialog>


            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Creación de Nuevo Usuario
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
                    
                    <Controller
                        name="nombre"
                        control={control}
                        rules={{ required: 'El nombre es obligatorio.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Nombre"
                                autoFocus
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><PersonIcon color={!!errors.nombre ? 'error' : 'action'} /></InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="apellido"
                        control={control}
                        rules={{ required: 'El apellido es obligatorio.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Apellido"
                                error={!!errors.apellido}
                                helperText={errors.apellido?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><AccountCircleIcon color={!!errors.apellido ? 'error' : 'action'} /></InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    
                    <Controller
                        name="email"
                        control={control}
                        rules={{ 
                            required: 'El email es obligatorio.', 
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'Ingrese un email válido. Ejemplo: correo@email.com' }
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Email"
                                autoComplete="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><EmailIcon color={!!errors.email ? 'error' : 'action'} /></InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="rolSeleccionado"
                        control={control}
                        rules={{ required: 'El rol es obligatorio.' }}
                        render={({ field }) => (
                            <FormControl fullWidth margin="normal" error={!!errors.rolSeleccionado}>
                                <InputLabel id="rol-label">Rol del Usuario*</InputLabel>
                                <Select
                                    labelId="rol-label"
                                    id="rolSeleccionado"
                                    label="Rol del Usuario*"
                                    {...field}
                                    value={field.value || ''}
                                >
                                    {roles.map((rol) => (
                                        <MenuItem key={rol.id} value={rol.nombre}>
                                            {rol.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.rolSeleccionado && <Typography color="error" variant="caption">{errors.rolSeleccionado.message}</Typography>}
                            </FormControl>
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        rules={{ 
                            required: 'La contraseña es obligatoria.',
                            validate: (value) => 
                                passwordRules.every(rule => rule.regex.test(value)) || "La contraseña no cumple con todas las reglas."
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                error={!!errors.password}
                                helperText={errors.password?.message || " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><LockIcon color={!!errors.password ? 'error' : 'action'} /></InputAdornment>
                                    ),
                                    endAdornment: (
                                        <IconButton onClick={handleClickShowPassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        )}
                    />
                    {PasswordRulesList}

                    <Controller
                        name="confirmarPassword"
                        control={control}
                        rules={{ 
                            required: 'La confirmación es obligatoria.',
                            validate: (value) => value === passwordValue || 'Las contraseñas no coinciden.'
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Confirmar Contraseña"
                                type={showConfirmPassword ? 'text' : 'password'}
                                error={!!errors.confirmarPassword}
                                helperText={errors.confirmarPassword?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><LockIcon color={!!errors.confirmarPassword ? 'error' : 'action'} /></InputAdornment>
                                    ),
                                    endAdornment: (
                                        <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="aceptaPoliticas"
                        control={control}
                        rules={{ required: 'Debe aceptar los términos y condiciones.' }}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...field}
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color={errors.aceptaPoliticas ? "error" : "primary"}
                                    />
                                }
                                label={
                                    <Typography color={errors.aceptaPoliticas ? 'error' : 'textSecondary'}>
                                        Estoy de acuerdo con los términos y condiciones*
                                    </Typography>
                                }
                                sx={{ mt: 1, mb: 2 }}
                            />
                        )}
                    />
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1, mb: 1 }}
                        disabled={cargandoRoles || roles.length === 0}
                    >
                        Crear Usuario
                    </Button>
                </Box>
                
                <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => navigate('/inicio')}
                    sx={{ mt: 1, color: (theme) => theme.palette.grey[600] }}
                >
                    Regresar al Inicio
                </Button>
            </Paper>
        </Container>
    );
}

export default CrearUsuario;