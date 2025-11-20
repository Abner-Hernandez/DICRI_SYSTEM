import React, { useReducer } from 'react';
import UsuarioContext, { UsuarioContextValue, initialState } from '../context/usuarioContext';
import { usuarioReducer } from '../reducers/usuarioReducer';
import { ActionType } from "../types/actions";
import Usuario from "../clases/usuario";

const LOGIN_API_ENDPOINT = "http://localhost:5000";

function UsuarioProvider({ children }: { children: React.ReactNode }) {
    console.log("=== UsuarioProvider SE ESTÁ EJECUTANDO ===");
    
    const [state, defaultDispatch] = useReducer(usuarioReducer, initialState);
    
    const dispatch = async (action: ActionType) => {
        if (action.type === 'conectarse') {
            try {
                const response = await fetch(LOGIN_API_ENDPOINT + "/api/auth/login", { 
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