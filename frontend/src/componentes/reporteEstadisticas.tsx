import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { Chart } from 'react-google-charts';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  DonutLarge as DonutChartIcon
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
  fecha_aprobacion?: string;
  fecha_rechazo?: string;
  coordinador?: string;
}

type ChartType = 'BarChart' | 'PieChart' | 'LineChart' | 'ColumnChart' | 'AreaChart';

const ReporteEstadisticas: React.FC = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [chartTypeEstados, setChartTypeEstados] = useState<ChartType>('PieChart');
  const [chartTypeTecnicos, setChartTypeTecnicos] = useState<ChartType>('ColumnChart');
  const [chartTypeTemporal, setChartTypeTemporal] = useState<ChartType>('LineChart');
  const [chartTypeIndicios, setChartTypeIndicios] = useState<ChartType>('BarChart');

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
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/expedientes/reportes`, {
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

  const dataEstados = useMemo(() => {
    const conteo: { [key: string]: number } = {};
    
    expedientes.forEach(exp => {
      conteo[exp.estado] = (conteo[exp.estado] || 0) + 1;
    });

    return [
      ['Estado', 'Cantidad'],
      ...Object.entries(conteo).map(([estado, cantidad]) => [estado, cantidad])
    ];
  }, [expedientes]);

  const dataTecnicos = useMemo(() => {
    const conteo: { [key: string]: number } = {};
    
    expedientes.forEach(exp => {
      conteo[exp.tecnico_registro] = (conteo[exp.tecnico_registro] || 0) + 1;
    });

    const sorted = Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return [
      ['Técnico', 'Expedientes'],
      ...sorted
    ];
  }, [expedientes]);

  const dataTemporal = useMemo(() => {
    const conteoMensual: { [key: string]: number } = {};
    
    expedientes.forEach(exp => {
      const fecha = new Date(exp.fecha_registro);
      const mes = fecha.toLocaleDateString('es-GT', { year: 'numeric', month: 'short' });
      conteoMensual[mes] = (conteoMensual[mes] || 0) + 1;
    });

    const sorted = Object.entries(conteoMensual)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      });

    return [
      ['Mes', 'Expedientes Registrados'],
      ...sorted
    ];
  }, [expedientes]);

  const dataIndicios = useMemo(() => {
    const rangos = [
      { label: '0 indicios', min: 0, max: 0 },
      { label: '1-3 indicios', min: 1, max: 3 },
      { label: '4-6 indicios', min: 4, max: 6 },
      { label: '7-10 indicios', min: 7, max: 10 },
      { label: '10+ indicios', min: 11, max: Infinity }
    ];

    const conteo = rangos.map(rango => {
      const cantidad = expedientes.filter(exp => {
        const total = exp.total_indicios || 0;
        return total >= rango.min && total <= rango.max;
      }).length;
      return [rango.label, cantidad];
    });

    return [
      ['Rango', 'Expedientes'],
      ...conteo
    ];
  }, [expedientes]);

  const estadisticas = useMemo(() => {
    return {
      total: expedientes.length,
      enRegistro: expedientes.filter(e => e.estado === 'En Registro').length,
      enRevision: expedientes.filter(e => e.estado === 'En Revisión').length,
      aprobados: expedientes.filter(e => e.estado === 'Aprobado').length,
      rechazados: expedientes.filter(e => e.estado === 'Rechazado').length,
      totalIndicios: expedientes.reduce((sum, exp) => sum + (exp.total_indicios || 0), 0),
      promedioIndicios: expedientes.length > 0 
        ? (expedientes.reduce((sum, exp) => sum + (exp.total_indicios || 0), 0) / expedientes.length).toFixed(2)
        : 0
    };
  }, [expedientes]);

  const chartOptions = {
    estados: {
      title: 'Distribución por Estado',
      is3D: chartTypeEstados === 'PieChart',
      pieHole: chartTypeEstados === 'PieChart' ? 0 : 0.4,
      colors: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350'],
      legend: { position: 'bottom' },
      chartArea: { width: '90%', height: '70%' }
    },
    tecnicos: {
      title: 'Expedientes por Técnico (Top 10)',
      hAxis: { title: 'Técnico' },
      vAxis: { title: 'Cantidad de Expedientes', minValue: 0 },
      colors: ['#1976D2'],
      legend: { position: 'none' },
      chartArea: { width: '85%', height: '70%' }
    },
    temporal: {
      title: 'Expedientes Registrados por Mes',
      hAxis: { title: 'Mes' },
      vAxis: { title: 'Cantidad', minValue: 0 },
      colors: ['#9C27B0'],
      curveType: chartTypeTemporal === 'LineChart' ? 'function' : undefined,
      legend: { position: 'bottom' },
      chartArea: { width: '85%', height: '70%' }
    },
    indicios: {
      title: 'Distribución de Indicios por Expediente',
      hAxis: { title: 'Rango de Indicios' },
      vAxis: { title: 'Cantidad de Expedientes', minValue: 0 },
      colors: ['#00897B'],
      legend: { position: 'none' },
      chartArea: { width: '85%', height: '70%' }
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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Estadísticas y Gráficos
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expedientes
              </Typography>
              <Typography variant="h4">
                {estadisticas.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En Registro
              </Typography>
              <Typography variant="h4" color="warning.main">
                {estadisticas.enRegistro}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Aprobados
              </Typography>
              <Typography variant="h4" color="success.main">
                {estadisticas.aprobados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Indicios
              </Typography>
              <Typography variant="h4" color="info.main">
                {estadisticas.totalIndicios}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Promedio: {estadisticas.promedioIndicios} por expediente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Distribución por Estado
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Gráfico</InputLabel>
                <Select
                  value={chartTypeEstados}
                  label="Tipo de Gráfico"
                  onChange={(e) => setChartTypeEstados(e.target.value as ChartType)}
                >
                  <MenuItem value="PieChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PieChartIcon fontSize="small" />
                      Pastel
                    </Box>
                  </MenuItem>
                  <MenuItem value="BarChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" />
                      Barras
                    </Box>
                  </MenuItem>
                  <MenuItem value="ColumnChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                      Columnas
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Chart
              chartType={chartTypeEstados}
              data={dataEstados}
              options={chartOptions.estados}
              width="100%"
              height="400px"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Expedientes por Técnico
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Gráfico</InputLabel>
                <Select
                  value={chartTypeTecnicos}
                  label="Tipo de Gráfico"
                  onChange={(e) => setChartTypeTecnicos(e.target.value as ChartType)}
                >
                  <MenuItem value="BarChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" />
                      Barras
                    </Box>
                  </MenuItem>
                  <MenuItem value="ColumnChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                      Columnas
                    </Box>
                  </MenuItem>
                  <MenuItem value="PieChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PieChartIcon fontSize="small" />
                      Pastel
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Chart
              chartType={chartTypeTecnicos}
              data={dataTecnicos}
              options={chartOptions.tecnicos}
              width="100%"
              height="400px"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Tendencia Temporal
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Gráfico</InputLabel>
                <Select
                  value={chartTypeTemporal}
                  label="Tipo de Gráfico"
                  onChange={(e) => setChartTypeTemporal(e.target.value as ChartType)}
                >
                  <MenuItem value="LineChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LineChartIcon fontSize="small" />
                      Línea
                    </Box>
                  </MenuItem>
                  <MenuItem value="AreaChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LineChartIcon fontSize="small" />
                      Área
                    </Box>
                  </MenuItem>
                  <MenuItem value="ColumnChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                      Columnas
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Chart
              chartType={chartTypeTemporal}
              data={dataTemporal}
              options={chartOptions.temporal}
              width="100%"
              height="400px"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Distribución de Indicios
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Gráfico</InputLabel>
                <Select
                  value={chartTypeIndicios}
                  label="Tipo de Gráfico"
                  onChange={(e) => setChartTypeIndicios(e.target.value as ChartType)}
                >
                  <MenuItem value="ColumnChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                      Columnas
                    </Box>
                  </MenuItem>
                  <MenuItem value="BarChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon fontSize="small" />
                      Barras
                    </Box>
                  </MenuItem>
                  <MenuItem value="PieChart">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PieChartIcon fontSize="small" />
                      Pastel
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Chart
              chartType={chartTypeIndicios}
              data={dataIndicios}
              options={chartOptions.indicios}
              width="100%"
              height="400px"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReporteEstadisticas;