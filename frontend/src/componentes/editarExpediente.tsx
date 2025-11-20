import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
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
}

const EditarExpediente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [expediente, setExpediente] = useState({
    numero_expediente: '',
    descripcion_general: '',
    fecha_incidente: '',
    lugar_incidente: ''
  });

  useEffect(() => {
    if (id) {
      cargarExpediente();
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
      const exp: Expediente = data.expediente;
      
      // Verificar que el expediente esté en estado "En Registro"
      if (exp.estado !== 'En Registro') {
        setError('Solo se pueden editar expedientes en estado "En Registro"');
        return;
      }

      setExpediente({
        numero_expediente: exp.numero_expediente,
        descripcion_general: exp.descripcion_general,
        fecha_incidente: exp.fecha_incidente ? exp.fecha_incidente.split('T')[0] : '',
        lugar_incidente: exp.lugar_incidente
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setExpediente(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Validaciones básicas
      if (!expediente.numero_expediente.trim()) {
        throw new Error('El número de expediente es obligatorio');
      }
      if (!expediente.descripcion_general.trim()) {
        throw new Error('La descripción general es obligatoria');
      }
      if (!expediente.lugar_incidente.trim()) {
        throw new Error('El lugar del incidente es obligatorio');
      }
      if (!expediente.fecha_incidente) {
        throw new Error('La fecha del incidente es obligatoria');
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expediente)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el expediente');
      }

      setSuccess('Expediente actualizado exitosamente');
      
      // Redireccionar después de un breve delay
      setTimeout(() => {
        navigate(`/expedientes/${id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !expediente.numero_expediente) {
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
          Editar Expediente
        </Typography>
      </Stack>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Formulario */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Primera fila: Número de Expediente y Fecha del Incidente */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Número de Expediente"
                  value={expediente.numero_expediente}
                  onChange={(e) => handleChange('numero_expediente', e.target.value)}
                  required
                  placeholder="Ej: DICRI-2024-001"
                  helperText="Identificador único del expediente"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Fecha del Incidente"
                  type="date"
                  value={expediente.fecha_incidente}
                  onChange={(e) => handleChange('fecha_incidente', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  helperText="Fecha en que ocurrió el incidente"
                />
              </Box>
            </Box>

            {/* Descripción General */}
            <TextField
              fullWidth
              label="Descripción General"
              value={expediente.descripcion_general}
              onChange={(e) => handleChange('descripcion_general', e.target.value)}
              multiline
              rows={4}
              required
              placeholder="Describe brevemente el caso o incidente..."
              helperText="Descripción detallada del incidente o caso"
            />

            {/* Lugar del Incidente */}
            <TextField
              fullWidth
              label="Lugar del Incidente"
              value={expediente.lugar_incidente}
              onChange={(e) => handleChange('lugar_incidente', e.target.value)}
              multiline
              rows={2}
              required
              placeholder="Dirección o ubicación donde ocurrió el incidente..."
              helperText="Ubicación exacta donde ocurrió el incidente"
            />

            {/* Botones */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(`/expedientes/${id}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* Información adicional */}
      <Box mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Solo se pueden editar expedientes que estén en estado "En Registro". 
            Una vez enviado a revisión, el expediente no podrá ser modificado.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default EditarExpediente;