import React from "react";
import Usuario from "../clases/usuario";
import { ActionType } from "../types/actions";

type RolNombre = string;

export const initialState: Usuario = new Usuario(
    '',           // nombre
    '',           // apellido
    '',           // email
    0,            // id_rol
    'Sin Rol' as RolNombre, // rol_nombre
    false,        // conectado
    true,         // activo
    null,         // id_usuario
    []            // permisos
);

export interface UsuarioContextValue {
    state: Usuario;
    dispatch: React.Dispatch<ActionType>; 
}

const UsuarioContext = React.createContext<UsuarioContextValue>({
    state: initialState,
    dispatch: () => {} 
});

export { UsuarioContext as default };