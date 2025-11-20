import React, { useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import usuarioContext from '../context/usuarioContext';

import { 
    TextField, 
    Button, 
    Typography, 
    Container, 
    Box, 
    Paper, 
    IconButton, 
    InputAdornment 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
    const navigate = useNavigate();
    const usuario = useContext(usuarioContext);
    
    // Estado local para mostrar/ocultar contraseña (MUI Password handling)
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: any) => {
        event.preventDefault();
    };

    const valoresPorDefecto = {
        correoElectronico: '',
        password: '',
    };

    useEffect(() => {
        if(usuario.state.conectado){
            navigate('/inicio');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario.state]);

    const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues: valoresPorDefecto });

    const onSubmit = async (data: any) => {
        // Lógica de conexión
        await usuario.dispatch({ type: 'conectarse', correoElectronico: data.correoElectronico, password: data.password });
        reset();
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <Typography component="h1" variant="h5" gutterBottom>
                    Inicio de Sesión
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>

                    {/* Campo de Correo Electrónico */}
                    <Controller
                        name="correoElectronico"
                        control={control}
                        rules={{ 
                            required: 'El correo electrónico es obligatorio.', 
                            pattern: { 
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, 
                                message: 'Ingrese un correo válido. Ejemplo: correo@email.com' 
                            } 
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                id="correoElectronico"
                                label="Correo Electrónico"
                                name="correoElectronico"
                                autoComplete="email"
                                error={!!errors.correoElectronico}
                                helperText={errors.correoElectronico?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color={!!errors.correoElectronico ? 'error' : 'action'} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />

                    {/* Campo de Contraseña */}
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: 'La contraseña es obligatoria.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color={!!errors.password ? 'error' : 'action'} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />

                    {/* Botón de Submit */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Ingresar
                    </Button>

                    {/* Botón de Registro */}
                    <Button 
                        fullWidth 
                        variant="text" 
                        onClick={() => navigate('/registro')}
                        sx={{ color: (theme) => theme.palette.grey[600] }}
                    >
                        ¿No tienes cuenta? ¡Regístrate!
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;