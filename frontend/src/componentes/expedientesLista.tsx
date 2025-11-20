import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
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
  total_indicios?: number;
}

interface ExpedientesListaProps {
  userRole: string;
}

const ExpedientesLista: React.FC<ExpedientesListaProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarExpedientes();
  }, []);

  const cargarExpedientes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }
      
      // Si es coordinador, cargar expedientes en revisión
      const endpoint = userRole === 'Coordinador' ? 
        '/api/expedientes/revision/pendientes' : 
        '/api/expedientes';
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar expedientes');
      }

      const data = await response.json();
      setExpedientes(data.expedientes);
    } catch (err: any) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const enviarARevision = async (idExpediente: number) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${idExpediente}/enviar-revision`,
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
      cargarExpedientes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const aprobarExpediente = async (idExpediente: number) => {
    const observaciones = prompt('Observaciones (opcional):');
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${idExpediente}/aprobar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ observaciones })
        }
      );

      if (!response.ok) {
        throw new Error('Error al aprobar expediente');
      }

      alert('Expediente aprobado exitosamente');
      cargarExpedientes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const rechazarExpediente = async (idExpediente: number) => {
    const justificacion = prompt('Justificación del rechazo (requerida):');
    
    if (!justificacion || justificacion.trim() === '') {
      alert('La justificación es requerida');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${idExpediente}/rechazar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ justificacion })
        }
      );

      if (!response.ok) {
        throw new Error('Error al rechazar expediente');
      }

      alert('Expediente rechazado exitosamente');
      cargarExpedientes();
    } catch (err: any) {
      alert(err.message);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando expedientes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {userRole === 'Coordinador' ? 'Expedientes en Revisión' : 'Mis Expedientes'}
        </Typography>
        {userRole !== 'Coordinador' && (
          <Fab 
            color="primary" 
            aria-label="add"
            onClick={() => navigate('/expedientes/nuevo')}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>Indicios</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expedientes.map((expediente) => (
              <TableRow key={expediente.id_expediente}>
                <TableCell>{expediente.numero_expediente}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {expediente.descripcion_general.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={expediente.estado} 
                    color={getEstadoColor(expediente.estado) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{expediente.tecnico_registro}</TableCell>
                <TableCell>
                  {new Date(expediente.fecha_registro).toLocaleDateString()}
                </TableCell>
                <TableCell>{expediente.total_indicios || 0}</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => navigate(`/expedientes/${expediente.id_expediente}`)}
                    title="Ver detalles"
                  >
                    <ViewIcon />
                  </IconButton>
                  
                  {/* Acciones según rol y estado */}
                  {userRole !== 'Coordinador' && expediente.estado === 'En Registro' && (
                    <IconButton 
                      onClick={() => enviarARevision(expediente.id_expediente)}
                      title="Enviar a revisión"
                      color="info"
                    >
                      <SendIcon />
                    </IconButton>
                  )}
                  
                  {userRole === 'Coordinador' && expediente.estado === 'En Revisión' && (
                    <>
                      <IconButton 
                        onClick={() => aprobarExpediente(expediente.id_expediente)}
                        title="Aprobar"
                        color="success"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => rechazarExpediente(expediente.id_expediente)}
                        title="Rechazar"
                        color="error"
                      >
                        <RejectIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {expedientes.length === 0 && (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            {userRole === 'Coordinador' ? 
              'No hay expedientes pendientes de revisión' : 
              'No tienes expedientes registrados'
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExpedientesLista;