import { useContext, useCallback } from 'react';
import usuarioContext, { UsuarioContextValue } from '../context/usuarioContext';

const usePermisos = () => {
    const { state: usuarioState } = useContext(usuarioContext) as UsuarioContextValue;

    /**
     * Verifica si el usuario actual tiene un permiso específico.
     * @param permisoRequerido - El nombre del permiso que se desea verificar (ej: 'usuario_crear').
     * @returns boolean - true si el usuario tiene el permiso, false en caso contrario.
     */
    const tienePermiso = useCallback((permisoRequerido: string): boolean => {
        if (!usuarioState.conectado) {
            return false;
        }

        if (!usuarioState.permisos || usuarioState.permisos.length === 0) {
            return false;
        }

        return usuarioState.permisos.includes(permisoRequerido);
    }, [usuarioState.conectado, usuarioState.permisos]);

    return { 
        tienePermiso, 
        permisos: usuarioState.permisos,
        rol: usuarioState.rol_nombre
    };
};

export default usePermisos;