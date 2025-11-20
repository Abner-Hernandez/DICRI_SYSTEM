import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import UsuarioContext from '../context/usuarioContext';

const IdleTimerWrapper = ({ children }) => {
    const { state, dispatch } = useContext(UsuarioContext);
    const navigate = useNavigate();

    const onIdle = () => {
        if (state.conectado) {
            console.log('Usuario inactivo. Cerrando sesión...');
            dispatch({ type: "desconectarse" });
            navigate("/ingreso", { replace: true });
            alert("Sesión cerrada por inactividad.");
        }
    };

    useIdleTimer({
        onIdle,
        timeout: 1000 * 60 * 2, // 2 minutos
        throttle: 500,
    });
    
    return <>{children}</>;
};

export default IdleTimerWrapper;