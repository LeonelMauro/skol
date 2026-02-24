import { useEffect, useState } from 'react';
import api from '../../services/api';
import type {
  BarberAvailability,
  BarberTableInfo,
  CreateBarberAvailabilityPayload,
  UpdateBarberSchedulePayload,
} from '../../types/barberAvailability';


import type { Barber, } from "../../types/user";

import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip,
  Box, Typography,
  Snackbar,
  Alert,
  Button,
  DialogContent,
  Dialog,
  DialogTitle
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {useAuth} from '../../context/AuthContext';

import EditIcon from '@mui/icons-material/Edit';
import BarberDialogAvail from './BarberDialogAvailad';
import BarberDialogEditAvail from './BarberDialogEditAvail';
import Register from '../Register';
import { useTheme, useMediaQuery } from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  //CREAR BARBER

  const [openCreateBarber, setOpenCreateBarber] = useState(false);

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
    // 1️⃣ ELIMINAR
    if (payload.removedIds?.length) {
      await Promise.all(
        payload.removedIds.map(id =>
          api.delete(`/barber-availability/${id}`, {
            headers: authHeader,
          })
        )
      );
    }

    // 2️⃣ ACTUALIZAR EXISTENTES
    await Promise.all(
      payload.availabilities.flatMap(day =>
        day.timeRanges
          .filter(range => range.id)
          .map(range =>
            api.patch(
              `/barber-availability/${range.id}`,
              {
                start_time: range.start_time,
                end_time: range.end_time,
                is_active: day.is_active,
              },
              { headers: authHeader }
            )
          )
      )
    );

    // 3️⃣ CREAR NUEVOS
    await Promise.all(
      payload.availabilities.flatMap(day =>
        day.timeRanges
          .filter(range => !range.id)
          .map(range =>
            api.post(
              `/barber-availability`,
              {
                barberId: payload.barberId,
                day_of_week: day.day_of_week,
                start_time: range.start_time,
                end_time: range.end_time,
                is_active: day.is_active,
              },
              { headers: authHeader }
            )
          )
      )
    );

    showSnackbar('Disponibilidad actualizada con éxito', 'success');

    setOpenEditDialog(false);
    setSelectedBarber(null);
    fechtAvailabilities();
  } catch (error) {
    console.error(error);
    showSnackbar('Error al actualizar disponibilidad', 'error');
  }
};


  const handleUpdateBarberLocation = async (
  barberId: number,
  locationId: number
) => {
  try {
    await api.patch(
      `/user/${barberId}/location`,
      { locationId },
      { headers: authHeader }
    );

    showSnackbar('Local actualizado correctamente', 'success');
    fechtAvailabilities();
  } catch {
    showSnackbar('Error al actualizar local', 'error');
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
      backgroundColor: '#0F0F0F',
      pt: { xs: 10, md: 12 },
    }}
    >
      <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, md: 4 },
            textAlign: 'center',
          }}
        >
      <Typography 
      variant="h4"
      sx={{
        fontFamily: 'Keania One',
        color: '#DBD515',
        mb: 1,
      }}
    >
        Disponibilidad de barberos
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenCreateBarber(true)}
          sx={{
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: 300,
            '&:hover': { backgroundColor: '#c4bd13' },
          }}
        >
          Crear barbero
        </Button>
      </Box>

    
      {isMobile ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {barbersWithoutAvailability.map((barber) => (
          
          
          <Paper
            key={`no-avail-${barber.id}`}
            sx={{
              p: { xs: 1.2, sm: 2 },
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography sx={{ color: '#DBD515', fontWeight: 600 }}>
                {barber.name}
              </Typography>

              <Chip
                label="Sin disponibilidad"
                color="warning"
                size="small"
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#888' }}>
              Inactivo
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <IconButton
                sx={{
                  color: '#DBD515',
                  border: '1px solid rgba(219,213,21,0.3)',
                  borderRadius: 2,
                }}
                onClick={() => {
                  setSelectedBarberId(barber.id);
                  setOpenCreate(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {Object.values(availabilityByBarber).map(({ barber, availabilities }) => (
          <Paper
            key={barber.id}
            sx={{
              p: 2,
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 2,
            }}
          >
            {/* Nombre + Estado */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography sx={{ color: '#DBD515', fontWeight: 600 }}>
                {barber.name}
              </Typography>

              <Chip
              label={
                availabilities.some(a => a.is_active)
                  ? "Disponible"
                  : "Inactivo"
              }
              color={
                availabilities.some(a => a.is_active)
                  ? "success"
                  : "default"
              }
              size="small"
            />
            </Box>

            {/* Horarios */}
            <Box sx={{ mb: 1 }}>
              {DAY_ORDER.map(day => {
              const dayAvailabilities = availabilities
                .filter(a => a.day_of_week === day)
                .sort((a, b) =>
                  a.start_time.localeCompare(b.start_time)
                );

              if (!dayAvailabilities.length) return null;

              return (
                <Box key={day} sx={{ mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#DBD515', fontWeight: 600 }}
                  >
                    {DAY_LABELS[day]}
                  </Typography>

                  {dayAvailabilities.map(a => (
                    <Typography
                      key={a.id}
                      variant="caption"
                      sx={{ display: 'block', color: '#bbb', ml: 1 }}
                    >
                      • {a.start_time} – {a.end_time}
                    </Typography>
                  ))}
                </Box>
              );
            })}

            </Box>

            {/* Local */}
            <Typography variant="caption" sx={{ color: '#888' }}>
              {barber.location?.name ?? 'Sin local'}
            </Typography>

            {/* Botón */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
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
                sx={{ color: '#DBD515' }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    ) : (
      // 👇 ACÁ DEJÁS TU TABLE ACTUAL


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
            {barbersWithoutAvailability.map((barber) => (
              <TableRow key={`no-avail-${barber.id}`}>
                <TableCell>{barber.name}</TableCell>

                <TableCell colSpan={3}>
                  <Chip
                    label="Sin disponibilidad"
                    color="warning"
                    size="small"
                  />
                </TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <Chip label="Inactivo" size="small" />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    sx={{
                      color: '#DBD515',
                      border: '1px solid rgba(219,213,21,0.3)',
                      borderRadius: 2,
                    }}
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
            {Object.values(availabilityByBarber).map(({ barber, availabilities }) => (
              <TableRow key={barber.id}>
                <TableCell>{barber.name}</TableCell>

                {/* DÍAS AGRUPADOS */}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {Array.from(
                      new Set(availabilities.map(a => a.day_of_week))
                    )
                      .sort((a, b) =>
                        DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
                      )
                      .map(day => {
                        const isActive = availabilities.some(
                          a => a.day_of_week === day && a.is_active
                        );

                        return (
                          <Chip
                            key={day}
                            label={DAY_LABELS[day]}
                            size="small"
                            color={isActive ? "success" : "default"}
                            variant={isActive ? "filled" : "outlined"}
                          />
                        );
                      })}
                  </Box>
                </TableCell>



                {/* HORARIO (asumimos mismo rango) */}
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {DAY_ORDER
                      .filter(day =>
                        availabilities.some(a => a.day_of_week === day)
                      )
                      .map(day => {
                        const ranges = availabilities
                        .filter(a => a.day_of_week === day)
                        .sort((a, b) =>
                          a.start_time.localeCompare(b.start_time)
                        )
                        .map(a => `${a.start_time}–${a.end_time}`)
                        .join(" y ");

                        return (
                          <Typography key={day} variant="caption">
                            {DAY_LABELS[day]}: {ranges}
                          </Typography>
                        );
                      })}
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
    )}
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
            onSaveSchedule={handleSaveSchedule}
            onSaveLocation={handleUpdateBarberLocation}
          />
        )}


          <Dialog
          open={openCreateBarber}
          onClose={() => setOpenCreateBarber(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle
            sx={{
              fontSize: { xs: 18, sm: 22 },
              pb: 1
            }}
          >
            Crear barbero
          </DialogTitle>

          <DialogContent
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 2 }
            }}
          >
            <Register
              mode="admin-barber"
              onSuccess={() => {
                fechtBarbers();
                fechtAvailabilities();
                showSnackbar('Barbero creado correctamente', 'success');
                setOpenCreateBarber(false);
              }}
            />
          </DialogContent>
        </Dialog>

        </Box>
    </Box>

    
  );
}

