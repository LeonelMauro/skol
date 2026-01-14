import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AvailableSlotsResponse {
  availableSlots: string[];
}

export default function SelectDateTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { barberId, serviceId } = location.state as {
    barberId: number;
    serviceId: number;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${user?.access_token}`,
  };

  useEffect(() => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setSelectedTime(null);

      api.get<AvailableSlotsResponse>(
        `/bookings/barbers/${barberId}/available-slots`,
        {
            params: {
            serviceId,
            date: selectedDate,
            },
            headers: authHeader,
        }
        )

      .then(res => setSlots(res.data.availableSlots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        px: { xs: 2, md: 6 },
        pt: { xs: 10, md: 12 },
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
      <TextField
        type="date"
        fullWidth
        value={selectedDate || ''}
        onChange={e => setSelectedDate(e.target.value)}
        inputProps={{
          min: new Date().toISOString().split('T')[0],
        }}
        sx={{
          input: { color: '#fff' },
          label: { color: '#ccc' },
          mb: 4,
        }}
      />

      {/* HORARIOS */}
      {loadingSlots && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 ,borderColor: '#DBD515',}}>
          <CircularProgress />
        </Box>
      )}

      {!loadingSlots && selectedDate && slots.length === 0 && (
        <Typography sx={{ color: '#ccc', textAlign: 'center', mt: 3 }}>
          No hay horarios disponibles para este día
        </Typography>
      )}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {slots.map(time => (
          <Grid item xs={4} sm={3} md={2} key={time}>
            <Button
            fullWidth
            variant={selectedTime === time ? 'contained' : 'outlined'}
            onClick={() => setSelectedTime(time)}
            sx={{
                borderRadius: 2,
                color: selectedTime === time ? '#000' : '#DBD515',
                backgroundColor:
                selectedTime === time ? '#DBD515' : 'transparent',
                fontWeight: 'bold',
            }}
            >
            {time}
            </Button>
          </Grid>
        ))}
      </Grid>

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
                barberId,
                serviceId,
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
