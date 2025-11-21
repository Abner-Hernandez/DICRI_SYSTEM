import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';

interface Indicio {
  id_indicio: number;
  numero_indicio: string;
  nombre_objeto: string;
  descripcion: string;
  tipo_evidencia: string;
  ubicacion_hallazgo: string;
  fecha_registro: string;
  fecha_registro_formatted?: string;
  tecnico_registro?: string;
  observaciones: string;
  color?: string;
  tamanio?: string;
  peso?: number;
  unidad_peso?: string;
}

interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  estado: string;
}

const DetalleIndicio: React.FC = () => {
  const { id, indicioId } = useParams<{ id: string; indicioId: string }>();
  const navigate = useNavigate();
  const [indicio, setIndicio] = useState<Indicio | null>(null);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (indicioId && id) {
      cargarDatos();
    }
  }, [indicioId, id]);

  const cargarDatos = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      // Cargar indicio
      const indicioResponse = await fetch(`${baseUrl}/api/indicios/${indicioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!indicioResponse.ok) {
        throw new Error('Error al cargar el indicio');
      }

      const indicioData = await indicioResponse.json();
      setIndicio(indicioData.indicio);

      // Cargar expediente
      const expedienteResponse = await fetch(`${baseUrl}/api/expedientes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!expedienteResponse.ok) {
        throw new Error('Error al cargar el expediente');
      }

      const expedienteData = await expedienteResponse.json();
      setExpediente(expedienteData.expediente);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/expedientes/${id}`)}
            variant="outlined"
          >
            Volver al Expediente
          </Button>
        </Box>
      </Box>
    );
  }

  if (!indicio) {
    return (
      <Box p={4}>
        <Alert severity="warning">Indicio no encontrado</Alert>
        <Box mt={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/expedientes/${id}`)}
            variant="outlined"
          >
            Volver al Expediente
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/expedientes/${id}`)}
          variant="outlined"
        >
          Volver al Expediente
        </Button>
        <Typography variant="h4" component="h1">
          {indicio.numero_indicio}
        </Typography>
      </Stack>

      {/* Información del Indicio */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>
            Detalle del Indicio
          </Typography>
          {expediente?.estado === 'En Registro' && (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => navigate(`/expedientes/${id}/indicios/${indicioId}/editar`)}
            >
              Editar Indicio
            </Button>
          )}
        </Stack>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          {/* Primera fila: Número de Indicio y Nombre del Objeto */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Número de Indicio
              </Typography>
              <Typography variant="body1" gutterBottom>
                {indicio.numero_indicio}
              </Typography>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Nombre del Objeto
              </Typography>
              <Typography variant="body1" gutterBottom>
                {indicio.nombre_objeto || 'No disponible'}
              </Typography>
            </Box>
          </Box>

          {/* Descripción */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Descripción
            </Typography>
            <Typography variant="body1" gutterBottom>
              {indicio.descripcion}
            </Typography>
          </Box>

          {/* Tipo de Evidencia */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Tipo de Evidencia
            </Typography>
            <Typography variant="body1" gutterBottom>
              {indicio.tipo_evidencia}
            </Typography>
          </Box>

          {/* Segunda fila: Color y Tamaño */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {indicio.color && (
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Color
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {indicio.color}
                </Typography>
              </Box>
            )}

            {indicio.tamanio && (
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Tamaño
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {indicio.tamanio}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Tercera fila: Peso y Unidad de Peso */}
          {indicio.peso && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Peso
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {indicio.peso} {indicio.unidad_peso || 'gramos'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Ubicación del Hallazgo */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Ubicación del Hallazgo
            </Typography>
            <Typography variant="body1" gutterBottom>
              {indicio.ubicacion_hallazgo}
            </Typography>
          </Box>

          {/* Fecha y Técnico de Registro */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Fecha de Registro
              </Typography>
              <Typography variant="body1" gutterBottom>
                {indicio.fecha_registro_formatted || new Date(indicio.fecha_registro).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Técnico de Registro
              </Typography>
              <Typography variant="body1" gutterBottom>
                {indicio.tecnico_registro || 'No disponible'}
              </Typography>
            </Box>
          </Box>

          {/* Observaciones */}
          {indicio.observaciones && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Observaciones
              </Typography>
              <Typography variant="body1" gutterBottom>
                {indicio.observaciones}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Información adicional */}
      <Box mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Los indicios solo pueden ser editados cuando el expediente está en estado "En Registro". 
            El número de indicio, la fecha de registro y el técnico de registro no se pueden modificar una vez creados.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default DetalleIndicio;