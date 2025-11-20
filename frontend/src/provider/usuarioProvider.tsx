import React, { useReducer, useCallback } from 'react';
import UsuarioContext, { UsuarioContextValue, initialState } from '../context/usuarioContext';
import { usuarioReducer } from '../reducers/usuarioReducer';
import { ActionType } from "../types/actions";
import Usuario from "../clases/usuario";

const LOGIN_API_ENDPOINT = process.env.REACT_APP_LOGIN_URL;

const UsuarioProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, defaultDispatch] = useReducer(usuarioReducer, initialState);

    const dispatch: React.Dispatch<ActionType> = useCallback(async (action) => {
        
        defaultDispatch(action); 
        if (action.type === 'conectarse') {
            try {
                if (!LOGIN_API_ENDPOINT) {
                    console.error("Error de configuración: La URL de la API de Login no está definida en las variables de entorno.");
                    return; 
                }
                
                const response = await fetch(LOGIN_API_ENDPOINT, { 
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
                    throw new Error('Error de autenticación. Credenciales inválidas o error del servidor.');
                }

                const data = await response.json();
                
                const usuarioData: Usuario = {
                    ...data, 
                    conectado: true,
                    activo: true,
                };

                defaultDispatch({ 
                    type: 'iniciar_sesion_exitoso', 
                    payload: usuarioData 
                });

            } catch (error) {
                console.error("Fallo la conexión o la autenticación:", error);
            }
        }
        
    }, [defaultDispatch]);

    const contextValue: UsuarioContextValue = {
        state,
        dispatch,
    };

    return (
        <UsuarioContext.Provider value={contextValue}>
            {children}
        </UsuarioContext.Provider>
    );
};

export default UsuarioProvider;