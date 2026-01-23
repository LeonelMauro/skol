import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Location } from '../../types/location';
import type { Service } from '../../types/services';
import type { Barber } from '../../types/user';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

interface AvailableSlotsResponse {
  availableSlots: string[];
}
type SelectedBarber =
  | { mode: 'any' }
  | { mode: 'specific'; barber: Barber };

export default function SelectDateTime() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const [workingDays, setWorkingDays] = useState<number[]>([]);


  const state = routerLocation.state as
    | {
        location: Location;
        barber: SelectedBarber;
        service: Service;
      }
    | undefined;

  // GUARD
  useEffect(() => {
    if (!state) {
      navigate('/reservas', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  // ⬇️ A PARTIR DE ACÁ state ES SEGURO
  const { location, barber, service } = state;

  const barberId =
    barber.mode === 'specific' ? barber.barber.id : undefined;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${user?.access_token}`,
  };
  useEffect(() => {
  if (barber.mode !== 'specific') return;

  api
    .get(`/user/${barber.barber.id}/working-days`)
    .then(res => setWorkingDays(res.data.workingDays))
    .catch(() => setWorkingDays([]));
}, [barber]);


  useEffect(() => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setSelectedTime(null);

    api
      .get<AvailableSlotsResponse>(
        barberId
          ? `/bookings/barbers/${barberId}/available-slots`
          : `/bookings/available-slots`,
        {
          params: {
            date: selectedDate,
            serviceId: service.id,
            locationId: location.id,
          },
          headers: authHeader,
        }
      )
      .then(res => setSlots(res.data.availableSlots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, barberId, service.id, location.id]);

  return (
    // JSX (el que ya tenés está bien)

    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        px: { xs: 2, md: 6 },
        pt: { xs: 10, md: 12 },
        textAlign: 'center'
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
        Fecha y horario
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 3 }}>
        Elegí cuándo querés tu turno
      </Typography>

      <Divider sx={{ mb: 4 ,borderColor: '#DBD515',}} />

      {/* FECHA */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      mt: 2,
    }}
  >
    <StaticDatePicker
      disablePast
      displayStaticWrapperAs="desktop"
      value={selectedDate ? dayjs(selectedDate) : null}
      onChange={(value) =>
        setSelectedDate(value?.format('YYYY-MM-DD') ?? null)
      }
      shouldDisableDate={(date) => {
        if (barber.mode === 'any') return false;
        const day = date.day();
        return !workingDays.includes(day);
      }}
      slotProps={{
        actionBar: {
          actions: [], // ❌ sin OK / Cancelar
        },
        day: {
          sx: {
            width: 34,
            height: 34,
            fontSize: 12,
            '&.MuiPickersDay-root': {
              backgroundColor: '#BDBDBD',
              color: '#000',
            },
            '&.Mui-selected': {
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 'bold',
            },
            '&:hover': {
              backgroundColor: '#AFAFAF',
            },
            '&.Mui-disabled': {
              color: '#777',
            },
          },
        },
        calendarHeader: {
          sx: {
            minHeight: 36,
            '& .MuiPickersCalendarHeader-label': {
              fontSize: 13,
              fontWeight: 'bold',
              color: '#000',
            },
            '& .MuiPickersArrowSwitcher-button': {
              color: '#000',
              p: 0.5,
            },
          },
        },
      }}
      sx={{
        backgroundColor: '#BDBDBD',
        borderRadius: 2,
        p: 1,
        width: 280,          // 👈 más chico
        '& .MuiDayCalendar-weekDayLabel': {
          fontSize: 11,
          color: '#000',
        },
      }}
    />
  </Box>
</LocalizationProvider>






      {/* HORARIOS */}
      {loadingSlots && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#DBD515' }} />
        </Box>
      )}

      {!loadingSlots && selectedDate && slots.length === 0 && (
        <Typography
          sx={{
            color: '#aaa',
            mt: 3,
            fontSize: 14,
          }}
        >
          No hay horarios disponibles para este día
        </Typography>
      )}

      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(5, 1fr)',
          },
          gap: 1.5,
          mt: 2,
        }}
      >
        {slots.map(time => (
          <Button
            key={time}
            onClick={() => setSelectedTime(time)}
            variant={selectedTime === time ? 'contained' : 'outlined'}
            sx={{
              borderRadius: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 'bold',
              color: selectedTime === time ? '#000' : '#DBD515',
              backgroundColor:
                selectedTime === time ? '#DBD515' : 'transparent',
              borderColor: '#DBD515',
              '&:hover': {
                backgroundColor: '#DBD515',
                color: '#000',
              },
            }}
          >
            {time}
          </Button>
        ))}
      </Box>


      {/* ACCIONES */}
      <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
        <Button 
        fullWidth
              variant="outlined"
              sx={{ color: '#fff', borderColor: '#555' }}
              onClick={() => navigate(-1)}
        >
          Atrás
        </Button>

        <Button
          fullWidth
          variant="contained"
          disabled={!selectedDate || !selectedTime}
          sx={{
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 'bold',
          }}
          onClick={() =>
            navigate('/reserve/confirm', {
               state: {
                location,
                barber,
                service,
                date: selectedDate,
                time: selectedTime,
              },
              })
          }
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}