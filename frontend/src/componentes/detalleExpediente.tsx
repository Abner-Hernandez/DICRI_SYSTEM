import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  descripcion_general: string;
  fecha_registro: string;
  fecha_incidente: string;
  lugar_incidente: string;
  estado: string;
  tecnico_registro: string;
  justificacion_rechazo?: string;
  fecha_aprobacion?: string;
}

interface Indicio {
  id_indicio: number;
  numero_indicio: string;
  descripcion: string;
  tipo_evidencia: string;
  ubicacion_hallazgo: string;
  fecha_recoleccion: string;
  estado_conservacion: string;
  observaciones: string;
}

const DetalleExpediente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [indicios, setIndicios] = useState<Indicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarExpediente();
      cargarIndicios();
    }
  }, [id]);

  const cargarExpediente = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar expediente');
      }

      const data = await response.json();
      setExpediente(data.expediente);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cargarIndicios = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}/indicios`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIndicios(data.indicios || []);
      }
    } catch (err: any) {
      console.error('Error al cargar indicios:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En Registro': return 'warning';
      case 'En Revisión': return 'info';
      case 'Aprobado': return 'success';
      case 'Rechazado': return 'error';
      default: return 'default';
    }
  };

  const enviarARevision = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}/enviar-revision`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar a revisión');
      }

      alert('Expediente enviado a revisión exitosamente');
      cargarExpediente(); // Recargar para actualizar el estado
    } catch (err: any) {
      alert(err.message);
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
      </Box>
    );
  }

  if (!expediente) {
    return (
      <Box p={4}>
        <Alert severity="warning">Expediente no encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header con botón de regreso */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
          variant="outlined"
        >
          Volver a Expedientes
        </Button>
        <Typography variant="h4" component="h1">
          Expediente {expediente.numero_expediente}
        </Typography>
        <Chip 
          label={expediente.estado} 
          color={getEstadoColor(expediente.estado) as any}
        />
      </Stack>

      {/* Información del Expediente */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Información General
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Número de Expediente
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expediente.numero_expediente}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Técnico de Registro
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expediente.tecnico_registro}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Fecha de Registro
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(expediente.fecha_registro).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Estado
            </Typography>
            <Box mb={2}>
              <Chip 
                label={expediente.estado} 
                color={getEstadoColor(expediente.estado) as any}
              />
            </Box>

            <Typography variant="subtitle2" color="textSecondary">
              Fecha del Incidente
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expediente.fecha_incidente ? 
                new Date(expediente.fecha_incidente).toLocaleDateString() : 
                'No especificada'
              }
            </Typography>

            {expediente.fecha_aprobacion && (
              <>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha de Aprobación
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(expediente.fecha_aprobacion).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Descripción General
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expediente.descripcion_general}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Lugar del Incidente
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expediente.lugar_incidente}
            </Typography>

            {expediente.justificacion_rechazo && (
              <>
                <Typography variant="subtitle2" color="error">
                  Justificación de Rechazo
                </Typography>
                <Alert severity="error" sx={{ mt: 1 }}>
                  {expediente.justificacion_rechazo}
                </Alert>
              </>
            )}
          </Box>
        </Box>

        {/* Acciones */}
        <Box mt={3}>
          <Stack direction="row" spacing={2}>
            {expediente.estado === 'En Registro' && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => navigate(`/expedientes/${id}/editar`)}
                >
                  Editar Expediente
                </Button>
                <Button
                  startIcon={<SendIcon />}
                  variant="contained"
                  color="primary"
                  onClick={enviarARevision}
                >
                  Enviar a Revisión
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Lista de Indicios */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Indicios Registrados ({indicios.length})
          </Typography>
          {expediente.estado === 'En Registro' && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => navigate(`/expedientes/${id}/indicios/nuevo`)}
            >
              Agregar Indicio
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {indicios.length === 0 ? (
          <Alert severity="info">
            No hay indicios registrados para este expediente.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Fecha Recolección</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indicios.map((indicio) => (
                  <TableRow key={indicio.id_indicio}>
                    <TableCell>{indicio.numero_indicio}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {indicio.descripcion.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{indicio.tipo_evidencia}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {indicio.ubicacion_hallazgo.substring(0, 30)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(indicio.fecha_recoleccion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{indicio.estado_conservacion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default DetalleExpediente;