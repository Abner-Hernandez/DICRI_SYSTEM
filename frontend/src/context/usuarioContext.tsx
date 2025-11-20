import React from "react";
import Usuario from "../clases/usuario";
import { ActionType } from "../types/actions";

type rol = string;

export const initialState: Usuario = new Usuario(
    '',           // nombre
    '',           // apellido
    '',           // email
    0,            // id_rol
    'Sin Rol' as rol, // rol_nombre
    false,        // conectado
    true,         // activo
    null,         // id_usuario
    []            // permisos
);

export type AsyncDispatch = (action: ActionType) => Promise<void> | void;

export interface UsuarioContextValue {
    state: Usuario;
    dispatch: AsyncDispatch;
}

const UsuarioContext = React.createContext<UsuarioContextValue>({
    state: initialState,
    dispatch: async () => {}
});

export { UsuarioContext as default };