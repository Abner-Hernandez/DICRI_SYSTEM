import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NuevoExpediente: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    numero_expediente: '',
    descripcion_general: '',
    fecha_incidente: '',
    lugar_incidente: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear expediente');
      }

      const data = await response.json();
      alert('Expediente creado exitosamente');
      navigate(`/expedientes/${data.id_expediente}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Nuevo Expediente DICRI
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box flex={1} minWidth="250px">
                  <TextField
                    fullWidth
                    label="Número de Expediente"
                    name="numero_expediente"
                    value={formData.numero_expediente}
                    onChange={handleChange}
                    required
                    placeholder="Ej: DICRI-2024-001"
                  />
                </Box>
                
                <Box flex={1} minWidth="250px">
                  <TextField
                    fullWidth
                    label="Fecha del Incidente"
                    name="fecha_incidente"
                    type="date"
                    value={formData.fecha_incidente}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Descripción General"
                name="descripcion_general"
                value={formData.descripcion_general}
                onChange={handleChange}
                required
                multiline
                rows={4}
                placeholder="Describe brevemente el caso o incidente..."
              />

              <TextField
                fullWidth
                label="Lugar del Incidente"
                name="lugar_incidente"
                value={formData.lugar_incidente}
                onChange={handleChange}
                required
                multiline
                rows={2}
                placeholder="Dirección o ubicación donde ocurrió el incidente..."
              />

              {error && (
                <Alert severity="error">{error}</Alert>
              )}

              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Creando...' : 'Crear Expediente'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/expedientes')}
                  size="large"
                >
                  Cancelar
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Box mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Una vez creado el expediente, podrás registrar los indicios 
            encontrados en la escena del crimen. Recuerda que el expediente debe tener al menos 
            un indicio antes de poder enviarlo a revisión.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default NuevoExpediente;