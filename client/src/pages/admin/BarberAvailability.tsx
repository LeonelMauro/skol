import { useEffect, useState ,} from 'react';
import api from '../../services/api';
import type {
  BarberAvailability,
  CreateBarberAvailabilityPayload,
  UpdateBarberSchedulePayload,
} from '../../types/barberAvailability';
import DeleteIcon from '@mui/icons-material/Delete';


import type { Barber} from "../../types/user";

import {
  
  Box, Typography,
  Snackbar,
  Alert,
  Button,
  DialogContent,
  Dialog,
  DialogTitle,
  InputAdornment,
  TextField,
  IconButton
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {useAuth} from '../../context/AuthContext';

import EditIcon from '@mui/icons-material/Edit';
import BarberDialogAvail from './BarberDialogAvailad';
import BarberDialogEditAvail from './BarberDialogEditAvail';
import Register from '../Register';
import { useTheme, useMediaQuery } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Avatar } from '@mui/material';

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

  const [commissions, setCommissions] = useState<Record<number, number>>({});
  const fetchCommissions = async () => {
  try {
    const res = await api.get('/commission');

    const map: Record<number, number> = {};

    res.data.forEach((c: any) => {
      map[c.barber.id] = c.percentage;
    });

    setCommissions(map);
  } catch (error) {
    console.error('Error cargando comisiones', error);
  }
};
  
  const fechtAvailabilities = async () => {
    try {
      const res = await api.get('/barber-availability',{headers:authHeader})
      setAvailabi(res.data)
    } catch (error) {
      console.error('No se encontraron los servicios',error)
    }finally{}
  };

  useEffect(() => {
  fechtBarbers();
  fechtAvailabilities();
  fetchCommissions();
}, []);
  //Mostrar barberos disponibles barbero
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [search, setSearch] = useState('');
  
  
 
  
  const fechtBarbers = async () =>{
    try {
      const res =await api.get(`/user/barbers`, {headers: authHeader});
      setBarbers(res.data);
      
    } catch (error) {
      console.error('No se encontraron los barbers',error)
    }
  }
 
  const filteredBarbers = barbers.filter(b =>
  b.name.toLowerCase().includes(search.toLowerCase()) ||
  b.email.toLowerCase().includes(search.toLowerCase())
);
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

  const [selectedBarberView, setSelectedBarberView] = useState<{
  barber: Barber;
  availabilities: BarberAvailability[];
} | null>(null);

  const getBarberAvailability = (barberId: number) =>
    availabi.filter(a => a.barber.id === barberId);

  const groupByDay = (availabilities: BarberAvailability[]) => {
    const grouped: Record<string, BarberAvailability[]> = {};

    availabilities.forEach(a => {
      if (!grouped[a.day_of_week]) {
        grouped[a.day_of_week] = [];
      }
      grouped[a.day_of_week].push(a);
    });

    return grouped;
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
    await fetchCommissions();
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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Botón crear */}
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenCreateBarber(true)}
          sx={{
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { backgroundColor: '#c4bd13' },
          }}
        >
          Crear barbero
        </Button>

        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar por nombre o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 280 },
            backgroundColor: '#1a1a1a',
            borderRadius: 1,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#888' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(auto-fit, minmax(140px, 1fr))',
      sm: 'repeat(auto-fit, minmax(180px, 1fr))',
    },
    gap: 3,
    justifyItems: 'center',
  }}
>
  {filteredBarbers.map((barber)  => {
    const barberAvail = getBarberAvailability(barber.id);
    const hasAvailability = barberAvail.length > 0;
    const commission = commissions[barber.id];

    const avatarUrl = barber.avatar
      ? `${import.meta.env.VITE_API_URL}${barber.avatar}`
      : undefined;

    return (
      <Box
        key={barber.id}
        onClick={() => {
          if (hasAvailability) {
            setSelectedBarberView({
              barber,
              availabilities: barberAvail,
            });
          } else {
            setSelectedBarberId(barber.id);
            setOpenCreate(true);
          }
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          transition: '0.3s',

          '&:hover': {
            transform: 'translateY(-5px)',
          },
        }}
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: { xs: 80, sm: 100, md: 110 },
            height: { xs: 80, sm: 100, md: 110 },
            mb: 1,

            border: hasAvailability
              ? '2px solid #444'
              : '3px solid #ff9800',

            boxShadow: hasAvailability
              ? '0 6px 16px rgba(0,0,0,0.6)'
              : '0 0 15px rgba(255,152,0,0.5)',
          }}
        >
          {!barber.avatar && barber.name.charAt(0)}
        </Avatar>

        <Typography
          sx={{
            fontFamily: 'Keania One',
            color: hasAvailability ? '#ccc' : '#ff9800',
            textAlign: 'center',
          }}
        >
          {barber.name}
        </Typography>
        {commission !== undefined && (
          <Typography
            variant="caption"
            sx={{ color: '#DBD515', fontSize: 12 }}
          >
            Comisión: {commission}%
          </Typography>
        )}

        {!hasAvailability && (
          <Typography variant="caption" sx={{ color: '#ff9800' }}>
            Sin disponibilidad
          </Typography>
        )}
      </Box>
    );
  })}
</Box>
<Dialog
  open={!!selectedBarberView}
  onClose={() => setSelectedBarberView(null)}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      backdropFilter: 'blur(3px)',
      borderRadius: 3,
      backgroundColor: '#111',
      width: { xs: '90%', sm: '100%' }, // 👈 achica en celular
      m: { xs: 1, sm: 2 }, // 👈 margen para poder “tocar afuera”
      maxHeight: '85vh', // 👈 evita que ocupe toda la pantalla
    },
  }}
>
  <DialogTitle
  sx={{
    fontSize: { xs: 18, sm: 22 },
    pb: 1,
    color: '#DBD515',
    textAlign: 'center',
  }}
>
  <Typography
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      fontSize: 'inherit',
      fontWeight: 600,
    }}
  >
    {selectedBarberView?.barber.name}

    {selectedBarberView &&
      commissions[selectedBarberView.barber.id] !== undefined && (
        <Box
          component="span"
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: '#DBD515',
            backgroundColor: 'rgba(219,213,21,0.1)',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          {Math.round(commissions[selectedBarberView.barber.id])}%
        </Box>
      )}
  </Typography>
</DialogTitle>

  <DialogContent
      dividers
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        overflowY: 'auto',
      }}
    >
      
    {selectedBarberView && (() => {
      const grouped = groupByDay(selectedBarberView.availabilities);

      return Object.entries(grouped).map(([day, ranges]) => (
        <Box
          key={day}
          sx={{
            mb: 1.2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#DBD515',
              fontWeight: 600,
              minWidth: 40,
            }}
          >
            {DAY_LABELS[day]}
          </Typography>

          {ranges
            .sort((a, b) =>
              a.start_time.localeCompare(b.start_time)
            )
            .map((r) => (
              <Typography
                key={r.id}
                sx={{
                  ml: 1,
                  fontSize: 13,
                  color: r.is_active ? '#2e7d32' : '#777',
                }}
              >
                {r.start_time} – {r.end_time}
              </Typography>
            ))}
        </Box>
      ));
    })()}

    {/* BOTONES */}
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mt: 3,
        justifyContent: 'flex-end',
      }}
    >
      <IconButton
        onClick={() => {
          setSelectedBarber({
            barberId: selectedBarberView!.barber.id,
            name: selectedBarberView!.barber.name,
            availabilities: selectedBarberView!.availabilities,
            locationId:
              selectedBarberView!.barber.location?.id ?? null,
          });
          setOpenEditDialog(true);
        }}
        sx={{
          color: '#DBD515',
          border: '1px solid rgba(219,213,21,0.3)',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(219,213,21,0.1)',
          },
        }}
      >
        <EditIcon />
      </IconButton>

      <IconButton
        onClick={async () => {
          try {
            await Promise.all(
              selectedBarberView!.availabilities.map(a =>
                api.delete(`/barber-availability/${a.id}`, {
                  headers: authHeader,
                })
              )
            );

            showSnackbar('Disponibilidad eliminada', 'success');
            setSelectedBarberView(null);
            fechtAvailabilities();
          } catch {
            showSnackbar('Error al eliminar', 'error');
          }
        }}
        sx={{
          color: '#f44336',
          border: '1px solid rgba(244,67,54,0.3)',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(244,67,54,0.1)',
          },
        }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  </DialogContent>
</Dialog>
    
     
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

