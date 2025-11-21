import React, { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  Alert
} from '@mui/material';
import {
  Print as PrintIcon,
  FilterList as FilterIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

type Order = 'asc' | 'desc';
type ExpedienteKeys = keyof Expediente | 'total_indicios'; 

function descendingComparator<T>(a: T, b: T, orderBy: keyof T | ExpedienteKeys): number {
  let aValue = a[orderBy as keyof T];
  let bValue = b[orderBy as keyof T];

  if (orderBy === 'fecha_registro' || orderBy === 'fecha_aprobacion' || orderBy === 'fecha_rechazo') {
      aValue = new Date(aValue as any) as any;
      bValue = new Date(bValue as any) as any;
  }
  if (orderBy === 'total_indicios') {
    aValue = (a as any).total_indicios || 0;
    bValue = (b as any).total_indicios || 0;
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(order: Order, orderBy: ExpedienteKeys): (a: Expediente, b: Expediente) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  id: ExpedienteKeys;
  label: string;
  sortable: boolean;
  checked: boolean;
}

const ReportesExpedientes: React.FC = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<ExpedienteKeys>('fecha_registro');

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');

  const [headCells, setHeadCells] = useState<HeadCell[]>([
    { id: 'numero_expediente', label: 'Número Expediente', sortable: false, checked: true },
    { id: 'descripcion_general', label: 'Descripción', sortable: false, checked: true },
    { id: 'estado', label: 'Estado', sortable: true, checked: true },
    { id: 'tecnico_registro', label: 'Técnico Registro', sortable: false, checked: true },
    { id: 'fecha_registro', label: 'Fecha Registro', sortable: true, checked: true },
    { id: 'fecha_incidente', label: 'Fecha Incidente', sortable: true, checked: false },
    { id: 'lugar_incidente', label: 'Lugar Incidente', sortable: false, checked: false },
    { id: 'total_indicios', label: 'Total Indicios', sortable: false, checked: true },
    { id: 'fecha_aprobacion', label: 'Fecha Aprobación', sortable: true, checked: false },
    { id: 'coordinador', label: 'Coordinador', sortable: false, checked: false },
  ]);

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

  const handleCheckboxChange = (id: ExpedienteKeys) => {
    setHeadCells(prev => 
      prev.map(cell => 
        cell.id === id ? { ...cell, checked: !cell.checked } : cell
      )
    );
  };

  const handleRequestSort = (property: ExpedienteKeys) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const expedientesFiltrados = useMemo(() => {
    return expedientes.filter(exp => {
      const fechaReg = new Date(exp.fecha_registro);
      const cumpleFechaInicio = !fechaInicio || fechaReg >= new Date(fechaInicio);
      const cumpleFechaFin = !fechaFin || fechaReg <= new Date(fechaFin);
      const cumpleEstado = estadoFiltro === 'todos' || exp.estado === estadoFiltro;
      
      return cumpleFechaInicio && cumpleFechaFin && cumpleEstado;
    });
  }, [expedientes, fechaInicio, fechaFin, estadoFiltro]);

  const visibleRows = useMemo(
    () => stableSort(expedientesFiltrados, getComparator(order, orderBy)),
    [expedientesFiltrados, order, orderBy]
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En Registro': return 'warning';
      case 'En Revisión': return 'info';
      case 'Aprobado': return 'success';
      case 'Rechazado': return 'error';
      default: return 'default';
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text('Reporte de Expedientes DICRI', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-GT')}`, 14, 28);
    doc.text(`Total de registros: ${visibleRows.length}`, 14, 34);
    
    if (fechaInicio || fechaFin) {
      let filtroTexto = 'Filtros aplicados: ';
      if (fechaInicio) filtroTexto += `Desde: ${fechaInicio} `;
      if (fechaFin) filtroTexto += `Hasta: ${fechaFin}`;
      doc.text(filtroTexto, 14, 40);
    }
    
    if (estadoFiltro !== 'todos') {
      doc.text(`Estado: ${estadoFiltro}`, 14, 46);
    }

    const estadisticas = {
      total: visibleRows.length,
      enRegistro: visibleRows.filter(e => e.estado === 'En Registro').length,
      enRevision: visibleRows.filter(e => e.estado === 'En Revisión').length,
      aprobados: visibleRows.filter(e => e.estado === 'Aprobado').length,
      rechazados: visibleRows.filter(e => e.estado === 'Rechazado').length
    };

    const startY = estadoFiltro !== 'todos' ? 52 : 46;
    doc.setFontSize(12);
    doc.text('Estadísticas:', 14, startY);
    doc.setFontSize(10);
    doc.text(`En Registro: ${estadisticas.enRegistro}`, 20, startY + 6);
    doc.text(`En Revisión: ${estadisticas.enRevision}`, 60, startY + 6);
    doc.text(`Aprobados: ${estadisticas.aprobados}`, 100, startY + 6);
    doc.text(`Rechazados: ${estadisticas.rechazados}`, 140, startY + 6);

    const columnsToInclude = headCells.filter(cell => cell.checked);
    
    const headers = columnsToInclude.map(cell => cell.label);
    
    const data = visibleRows.map(exp => {
      return columnsToInclude.map(cell => {
        switch (cell.id) {
          case 'numero_expediente':
            return exp.numero_expediente;
          case 'descripcion_general':
            return exp.descripcion_general.substring(0, 40) + '...';
          case 'estado':
            return exp.estado;
          case 'tecnico_registro':
            return exp.tecnico_registro;
          case 'fecha_registro':
            return new Date(exp.fecha_registro).toLocaleDateString('es-GT');
          case 'fecha_incidente':
            return exp.fecha_incidente ? new Date(exp.fecha_incidente).toLocaleDateString('es-GT') : 'N/A';
          case 'lugar_incidente':
            return exp.lugar_incidente?.substring(0, 30) || 'N/A';
          case 'total_indicios':
            return (exp.total_indicios || 0).toString();
          case 'fecha_aprobacion':
            return exp.fecha_aprobacion ? new Date(exp.fecha_aprobacion).toLocaleDateString('es-GT') : 'N/A';
          case 'coordinador':
            return exp.coordinador || 'N/A';
          default:
            return '';
        }
      });
    });

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: startY + 12,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10, left: 14, right: 14 }
    });

    doc.save(`reporte-expedientes-${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando datos para reporte...</Typography>
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
          Reportes de Expedientes
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<PrintIcon />}
          onClick={generarPDF}
          disabled={visibleRows.length === 0}
        >
          Generar PDF
        </Button>
      </Box>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <strong>Instrucciones:</strong> Marque los checkbox en los encabezados de las columnas para seleccionar qué campos desea incluir en el reporte PDF. Las columnas sin marcar no aparecerán en el documento generado.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Fecha Inicio"
              type="date"
              fullWidth
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Fecha Fin"
              type="date"
              fullWidth
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="En Registro">En Registro</MenuItem>
                <MenuItem value="En Revisión">En Revisión</MenuItem>
                <MenuItem value="Aprobado">Aprobado</MenuItem>
                <MenuItem value="Rechazado">Rechazado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Box display="flex" alignItems="center" height="100%">
              <Typography variant="body2">
                Total: <strong>{visibleRows.length}</strong> expedientes
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={headCell.checked}
                      onChange={() => handleCheckboxChange(headCell.id)}
                      size="small"
                      title={headCell.checked ? 'Incluir en reporte PDF' : 'No incluir en reporte PDF'}
                    />
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      <Typography variant="body2">{headCell.label}</Typography>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((expediente) => (
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
                  {new Date(expediente.fecha_registro).toLocaleDateString('es-GT')}
                </TableCell>
                <TableCell>
                  {expediente.fecha_incidente ? 
                    new Date(expediente.fecha_incidente).toLocaleDateString('es-GT') : 
                    'N/A'
                  }
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {expediente.lugar_incidente?.substring(0, 30) || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{expediente.total_indicios || 0}</TableCell>
                <TableCell>
                  {expediente.fecha_aprobacion ? 
                    new Date(expediente.fecha_aprobacion).toLocaleDateString('es-GT') : 
                    'N/A'
                  }
                </TableCell>
                <TableCell>{expediente.coordinador || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {visibleRows.length === 0 && (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            No hay expedientes que coincidan con los filtros seleccionados
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportesExpedientes;