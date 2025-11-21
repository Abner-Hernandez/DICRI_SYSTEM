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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const NuevoIndicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [indicio, setIndicio] = useState({
    numero_indicio: '',
    nombre_objeto: '',
    descripcion: '',
    tipo_evidencia: '',
    ubicacion_hallazgo: '',
    observaciones: '',
    color: '',
    tamanio: '',
    peso: '0',
    unidad_peso: 'gramos'
  });

  const tiposEvidencia = [
    'Física',
    'Digital',
    'Documental',
    'Testimonial',
    'Pericial',
    'Fotográfica',
    'Audiovisual',
    'Otra'
  ];

  const unidadesPeso = [
    'gramos',
    'kilogramos',
    'miligramos',
    'onzas',
    'libras'
  ];

  useEffect(() => {
    // Generar número de indicio automáticamente
    generarNumeroIndicio();
  }, [id]);

  const generarNumeroIndicio = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}/indicios/siguiente-numero`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIndicio(prev => ({
          ...prev,
          numero_indicio: data.numero_indicio
        }));
      }
    } catch (err) {
      console.error('Error al generar número de indicio:', err);
      // Si falla, usar un número temporal
      setIndicio(prev => ({
        ...prev,
        numero_indicio: `IND-${Date.now()}`
      }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setIndicio(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Validaciones básicas
      if (!indicio.nombre_objeto.trim()) {
        throw new Error('El nombre del objeto es obligatorio');
      }
      if (!indicio.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      if (!indicio.tipo_evidencia.trim()) {
        throw new Error('El tipo de evidencia es obligatorio');
      }
      if (!indicio.ubicacion_hallazgo.trim()) {
        throw new Error('La ubicación del hallazgo es obligatoria');
      }
      if (indicio.peso && parseFloat(indicio.peso) < 0) {
        throw new Error('El peso debe ser mayor o igual a cero');
      }

      // Preparar datos para envío
      const datosIndicio = {
        numero_indicio: indicio.numero_indicio,
        nombre_objeto: indicio.nombre_objeto,
        descripcion: indicio.descripcion,
        tipo_evidencia: indicio.tipo_evidencia,
        ubicacion_hallazgo: indicio.ubicacion_hallazgo,
        observaciones: indicio.observaciones,
        color: indicio.color,
        tamanio: indicio.tamanio,
        peso: indicio.peso ? parseFloat(indicio.peso) : 0,
        unidad_peso: indicio.unidad_peso
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/${id}/indicios`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datosIndicio)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el indicio');
      }

      setSuccess('Indicio creado exitosamente');
      
      // Redireccionar después de un breve delay
      setTimeout(() => {
        navigate(`/expedientes/${id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          Nuevo Indicio
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
            {/* Primera fila: Número de Indicio y Nombre del Objeto */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Número de Indicio"
                  value={indicio.numero_indicio}
                  onChange={(e) => handleChange('numero_indicio', e.target.value)}
                  disabled
                  helperText="Número generado automáticamente"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Nombre del Objeto"
                  value={indicio.nombre_objeto}
                  onChange={(e) => handleChange('nombre_objeto', e.target.value)}
                  required
                  helperText="Nombre descriptivo del objeto encontrado"
                />
              </Box>
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              label="Descripción"
              value={indicio.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              multiline
              rows={4}
              required
              helperText="Descripción detallada del indicio encontrado"
            />

            {/* Tipo de Evidencia */}
            <FormControl fullWidth required>
              <InputLabel>Tipo de Evidencia</InputLabel>
              <Select
                value={indicio.tipo_evidencia}
                label="Tipo de Evidencia"
                onChange={(e) => handleChange('tipo_evidencia', e.target.value)}
              >
                {tiposEvidencia.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Segunda fila: Color y Tamaño */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Color"
                  value={indicio.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  helperText="Color predominante del objeto"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Tamaño"
                  value={indicio.tamanio}
                  onChange={(e) => handleChange('tamanio', e.target.value)}
                  helperText="Dimensiones o tamaño del objeto (ej: 10cm x 5cm)"
                />
              </Box>
            </Box>

            {/* Tercera fila: Peso y Unidad de Peso */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Peso"
                  type="number"
                  value={indicio.peso}
                  onChange={(e) => handleChange('peso', e.target.value)}
                  inputProps={{
                    min: 0,
                    step: 0.01
                  }}
                  helperText="Peso del objeto"
                />
              </Box>

              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Unidad de Peso</InputLabel>
                  <Select
                    value={indicio.unidad_peso}
                    label="Unidad de Peso"
                    onChange={(e) => handleChange('unidad_peso', e.target.value)}
                  >
                    {unidadesPeso.map((unidad) => (
                      <MenuItem key={unidad} value={unidad}>
                        {unidad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Ubicación del Hallazgo */}
            <TextField
              fullWidth
              label="Ubicación del Hallazgo"
              value={indicio.ubicacion_hallazgo}
              onChange={(e) => handleChange('ubicacion_hallazgo', e.target.value)}
              required
              helperText="Ubicación exacta donde se encontró el indicio"
            />



            {/* Observaciones */}
            <TextField
              fullWidth
              label="Observaciones"
              value={indicio.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              multiline
              rows={3}
              helperText="Observaciones adicionales (opcional)"
            />

            {/* Botones */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(`/expedientes/${id}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Indicio'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* Información adicional */}
      <Box mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> El número de indicio se genera automáticamente. 
            Una vez creado, el número de indicio, la fecha de registro y el técnico de registro no se pueden modificar.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default NuevoIndicio;