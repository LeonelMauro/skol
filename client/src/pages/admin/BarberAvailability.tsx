import { useEffect, useState } from 'react';
import api from '../../services/api';
import type {
  BarberAvailability,
  BarberTableInfo,
  CreateBarberAvailabilityPayload,
  UpdateBarberAvailabilityPayload,
  UpdateBarberSchedulePayload,
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
import BarberDialogAvail from './BarberDialogAvailad';
import BarberDialogEditAvail from './BarberDialogEditAvail';

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
  
  //Mostrar barberos disponibles barbero
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const barberIdsWithAvailability = new Set(
  availabi.map(a => a.barber.id)
  );
  const barbersWithoutAvailability = barbers.filter(
    barber => !barberIdsWithAvailability.has(barber.id)
  );

  
  const fechtBarbers = async () =>{
    try {
      const res =await api.get(`/user/barbers`, {headers: authHeader});
      setBarbers(res.data);
      
    } catch (error) {
      console.error('No se encontraron los barbers',error)
    }
  }
  useEffect(() => {
  fechtBarbers();
}, []);

  // CREAR DISPONIBILIDAD
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);


  const handleCreateAvailability = async (data: CreateBarberAvailabilityPayload)=>{
    try {
      await api.post(`/barber-availability`,data,{headers: authHeader});
      showSnackbar("Disponibilidad creada correctamente", "success");
      setOpenCreate(false);
      fechtAvailabilities();

    } catch (error) {
      showSnackbar("No se pudo crear la disponibilidad", "error");
    }
  }
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

  
const [openEditDialog, setOpenEditDialog] = useState(false);
const [selectedBarber, setSelectedBarber] = useState<{
  barberId: number;
  name: string;
  availabilities: BarberAvailability[];
  locationId: number | null;
} | null>(null);


   const handleSaveSchedule = async (
  payload: UpdateBarberSchedulePayload
) => {
  try {
    await Promise.all(
      payload.availabilities.map(a =>
        api.patch(
          `/barber-availability/${a.id}`,
          {
            start_time: a.start_time,
            end_time: a.end_time,
            is_active: a.is_active,
          },
          { headers: authHeader }
        )
      )
    );

    showSnackbar(
      'Disponibilidad actualizada con éxito',
      'success'
    );

    setOpenEditDialog(false);
    setSelectedBarber(null);
    fechtAvailabilities();
  } catch (error) {
    showSnackbar(
      'Error al actualizar disponibilidad',
      'error'
    );
  }
};



  const availabilityByBarber = availabi.reduce((acc, availability) => {
  const barberId = availability.barber.id;

  if (!acc[barberId]) {
    acc[barberId] = {
      barber: {
        id: availability.barber.id,
        name: availability.barber.name,
        location: availability.barber.location ?? null,
      },
      availabilities: [],
    };
  }

  acc[barberId].availabilities.push(availability);
  return acc;
}, {} as Record<number, { barber: BarberTableInfo; availabilities: BarberAvailability[] }>);

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;


  const DAY_LABELS: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

  return (
    <Box
      sx={{
      minHeight: '100vh',
      backgroundColor: '#696161ff',
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
      <TableBody>
  {barbersWithoutAvailability.map((barber) => (
    <TableRow key={barber.id}>
      <TableCell>{barber.name}</TableCell>

      <TableCell colSpan={3}>
        <Chip
          label="Sin disponibilidad"
          color="warning"
          size="small"
        />
      </TableCell>

      <TableCell align="right">
        <IconButton
          color="primary"
          onClick={() => {
            setSelectedBarberId(barber.id);
            setOpenCreate(true);
          }}
        >
          <EditIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

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
            {Object.values(availabilityByBarber).map(({ barber, availabilities }) => (
              <TableRow key={barber.id}>
                <TableCell>{barber.name}</TableCell>

                {/* DÍAS AGRUPADOS */}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {DAY_ORDER
                    .map(day =>
                      availabilities.find(a => a.day_of_week === day)
                    )
                    .filter(Boolean)
                    .map(a => (
                      <Chip
                        key={a!.id}
                        label={DAY_LABELS[a!.day_of_week]}
                        size="small"
                        color={a!.is_active ? "success" : "default"}
                        variant={a!.is_active ? "filled" : "outlined"}
                      />
                    ))}

                  </Box>
                </TableCell>

                {/* HORARIO (asumimos mismo rango) */}
                <TableCell>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {DAY_ORDER
                    .map(day =>
                      availabilities.find(a => a.day_of_week === day)
                    )
                    .filter(Boolean)
                    .map(a => (
                      <Typography key={a!.id} variant="caption">
                        {DAY_LABELS[a!.day_of_week]}: {a!.start_time} – {a!.end_time}
                      </Typography>
                    ))}
                </Box>
              </TableCell>

                <TableCell>
                  {barber.location?.name ?? "Sin local"}
                </TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {barber.location?.address ?? "Sin local"}
                </TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <Chip label="Activo" color="success" size="small" />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelectedBarber({
                        barberId: barber.id,
                        name: barber.name,
                        availabilities,
                        locationId: barber.location?.id ?? null,
                      });
                      setOpenEditDialog(true);
                    }}
                  >
                    <EditIcon />
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
            <BarberDialogAvail
            open={openCreate}
            barberId={selectedBarberId}
            onClose={() => setOpenCreate(false)}
            onSubmit={handleCreateAvailability}
          />
          {selectedBarber && (
  <BarberDialogEditAvail
    open={openEditDialog}
    barberId={selectedBarber.barberId}
    barberName={selectedBarber.name}
    availabilities={selectedBarber.availabilities}
    locationId={selectedBarber.locationId}
    onClose={() => setOpenEditDialog(false)}
    onSave={handleSaveSchedule}
  />
)}



    </Box>

    
  );
}

