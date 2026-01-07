import { useEffect, useState } from 'react';
import api from '../../services/api';
import type {
  BarberAvailability,
  CreateBarberAvailabilityPayload,
  UpdateBarberAvailabilityPayload,
} from '../../types/barberAvailability';

import type { Barber } from "../../types/user";

import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip,
  Box, Typography,
  Snackbar,
  Alert
} from '@mui/material';
import {useAuth} from '../../context/AuthContext';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BarberAvailability() {
  
  const {user}= useAuth();
  const authHeader = { Authorization : `Bearer ${user?.access_token}`}

  //Snackbar mensaje al cliente

    const [snackbar, setSnackbar]= useState<{
      open:boolean,
      message: string,
      severity:'success'| 'error',
    }>({
      open: false,
      message: '',
      severity: 'success'
    });
    const showSnackbar=(
      message: string,
      severity: 'success'| 'error',
    ) => {
      setSnackbar({open:true,message,severity})
    }

  const [availabi, setAvailabi] = useState<BarberAvailability[]>([]);
  
  const fechtAvailabilities = async () => {
    try {
      const res = await api.get('/barber-availability',{headers:authHeader})
      setAvailabi(res.data)
    } catch (error) {
      console.error('No se encontraron los servicios',error)
    }finally{}
  };

  useEffect(() => {
    fechtAvailabilities();
  }, []);
  
  //LOCAL DE BARBER

  

  //ELIMINAR

  const [editing, setEditing] = useState<BarberAvailability | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/barber-availability/${id}`, { headers: authHeader });
      showSnackbar('Se elimino la abilitacion de barbero con exito', 'success');
      setConfirmDelete(null);
      fechtAvailabilities();
      } catch (error) {
      showSnackbar('No se pudo eliminar la habilitación', 'error'); }
      };

  //ACTUALIZAR

  const [openDialog, setOpenUpdate] = useState(false)
  const [editingAvaili, setEditingAvili] = useState<BarberAvailability | null>(null);
    
  const handleUpdateAvaili = async (data: UpdateBarberAvailabilityPayload) =>{
    if (!editingAvaili) return;
    try {
      await api.patch(`/barber-availability/${editingAvaili.id}`,data,{headers : authHeader});
      showSnackbar('Se actulizo con exito la avilitacion','success');
      setOpenUpdate(false);
      fechtAvailabilities();
    } catch (error) {
      showSnackbar('No se logro actulizar','error')
    }
  }

  return (
    <Box
      sx={{
      minHeight: '100vh',
      backgroundColor: '#c7c5c5ff',
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      px: { xs: 2, md: 6 },
      pt: { xs: 10, md: 12 }, // AppBar fixed
      }}
    >
      <Typography variant="h2"
      textAlign= 'center'
      sx={{
        mb:2,
        color: '#DBD515',
        fontFamily: 'Keania One',
        }}
    >
        Disponibilidad de barberos
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Barbero</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Local</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Dirección</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {availabi.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.barber.name}</TableCell>
                <TableCell>{row.day_of_week}</TableCell>
                <TableCell>
                  {row.start_time} – {row.end_time}
                </TableCell>
                <TableCell>
                  {row.barber.location?.name ?? 'Sin local'}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {row.barber.location?.address ?? 'Sin local'}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip
                    label={row.is_active ? 'Activo' : 'Inactivo'}
                    color={row.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setEditing(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setConfirmDelete(row.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Acá después va el Dialog de crear / editar */}
      {/* Y el Dialog de confirmación */}
  <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
              >
                {snackbar.message}
              </Alert>
  </Snackbar>
    </Box>

    
  );
}

