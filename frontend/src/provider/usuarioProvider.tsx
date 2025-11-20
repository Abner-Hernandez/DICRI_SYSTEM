import React, { useReducer } from 'react';
import UsuarioContext, { UsuarioContextValue, initialState } from '../context/usuarioContext';
import { usuarioReducer } from '../reducers/usuarioReducer';
import { ActionType } from "../types/actions";
import Usuario from "../clases/usuario";

// Función para recuperar usuario desde sessionStorage
const getUsuarioFromStorage = (): Usuario => {
    const conectado = sessionStorage.getItem('conectado') === 'true';
    if (conectado) {
        return new Usuario(
            sessionStorage.getItem('nombre') || '',
            sessionStorage.getItem('apellido') || '',
            sessionStorage.getItem('email') || '',
            0, // id_rol no se guarda en sessionStorage
            sessionStorage.getItem('rol_nombre') || '',
            true,
            true,
            null, // id_usuario no se guarda en sessionStorage
            []
        );
    }
    return initialState;
};

function UsuarioProvider({ children }: { children: React.ReactNode }) {
    console.log("=== UsuarioProvider SE ESTÁ EJECUTANDO ===");
    
    const [state, defaultDispatch] = useReducer(usuarioReducer, getUsuarioFromStorage());
    
    const dispatch = async (action: ActionType) => {
        if (action.type === 'conectarse') {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email: action.correoElectronico,
                        password: action.password
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('Error de autenticación');
                }
                
                const data = await response.json();
                
                defaultDispatch({ 
                    type: 'iniciar_sesion_exitoso', 
                    payload: {
                        usuario: data.usuario,
                        token: data.token
                    }
                });
                
            } catch (error) {
                console.error("Fallo la conexión:", error);
            }
        } else {
            defaultDispatch(action);
        }
    };

    const contextValue: UsuarioContextValue = {
        state,
        dispatch,
    };

    console.log("Provider renderizando con value:", contextValue);

    return (
        <UsuarioContext.Provider value={contextValue}>
            {children}
        </UsuarioContext.Provider>
    );
}

export default UsuarioProvider;