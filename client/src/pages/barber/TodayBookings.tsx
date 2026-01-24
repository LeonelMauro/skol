import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type TodayBooking = {
  id: number;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no_show' | 'completed';
  client: { name: string };
  service: { name: string; price: number };
  location: { name: string };
};


const statusConfig = {
  pending:   { label: 'Pendiente',   color: 'warning' },
  confirmed:{ label: 'Confirmada',  color: 'success' },
  completed:{ label: 'Atendido',    color: 'success' },
  canceled: { label: 'Cancelada',   color: 'error' },
  no_show:  { label: 'No asistió',  color: 'default' },
} as const; 

export default function ReservationsBarber() {
  const { user } = useAuth();

  const [reservations, setReservations] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const sortedReservations = [...reservations].sort(
    (a, b) => a.time.localeCompare(b.time)
  );

  const activeReservations = sortedReservations.filter(
    r => r.status === 'pending' || r.status === 'confirmed'
  );

  const historyReservations = sortedReservations.filter(
    r =>
      r.status === 'completed' ||
      r.status === 'canceled' ||
      r.status === 'no_show'
  );


  

  
  const [processingId, setProcessingId] = useState<number | null>(null);




  useEffect(() => {
    api
      .get('/bookings/barber/today', {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then(res => setReservations(res.data))
      .finally(() => setLoading(false));
      
  }, []);

  const handleCancel = async (id: number) => {
  try {
    setProcessingId(id);

    const res = await api.post(
      `/bookings/${id}/canceled`,
      {},
      { headers: { Authorization: `Bearer ${user?.access_token}` } }
    );

    setReservations(prev =>
      prev.map(r => (r.id === id ? res.data : r))
    );
  } catch (error) {
    console.error('Error cancelando la reserva', error);
  } finally {
    setProcessingId(null);
  }
};


    const handleConfirm = async (id: number) => {
      try {
        setProcessingId(id);

        const res = await api.post(
          `/bookings/${id}/confirm`,
          {},
          { headers: { Authorization: `Bearer ${user?.access_token}` } }
        );

        setReservations(prev =>
          prev.map(r => (r.id === id ? res.data : r))
        );
      } catch (error) {
        console.error('Error confirmando la reserva', error);
      } finally {
        setProcessingId(null);
      }
    };

   const handleComplete = async (id: number) => {
      try {
        setProcessingId(id);

        const res = await api.post(
          `/bookings/${id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${user?.access_token}` } }
        );

        setReservations(prev =>
          prev.map(r => (r.id === id ? res.data : r))
        );
      } catch (error) {
        console.error('Error completando la reserva', error);
      } finally {
        setProcessingId(null);
      }
    };


    const handleNoShow = async (id: number) => {
  try {
    setProcessingId(id);

    const res = await api.post(
      `/bookings/${id}/no-show`,
      {},
      { headers: { Authorization: `Bearer ${user?.access_token}` } }
    );

    setReservations(prev =>
      prev.map(r => (r.id === id ? res.data : r))
    );
  } catch (error) {
    console.error('Error marcando no-show', error);
  } finally {
    setProcessingId(null);
  }
};



  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reservations.length) {
    return (
      <Typography sx={{ color: '#aaa', textAlign: 'center', mt: 4 }}>
        Todavía no tenés reservas realizadas.
      </Typography>
    );
  }

  return (
  <Box
    sx={{
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: '#0F0F0F',
      pt: { xs: 2, md: 4 },
    }}
  >
    <Box
      sx={{
        width: {
          xs: '92%',
          sm: 480,
        },
        mx: 'auto',
        px: { xs: 1.5, sm: 0 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: '#DBD515',
          mb: { xs: 2, sm: 3 },
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        Mis reservas
      </Typography>

      {activeReservations.map((r) => (
        <Card key={r.id} sx={{ 
          backgroundColor: '#111',
                      border: { xs: '1px solid #222', sm: '1px solid #333' },
                      borderRadius: 2,
                      width: {
                      xs: '92%',
                      sm: 480,
                    },
                      mx: 'auto',
                    
        }}>
          <CardContent>
            <Typography sx={{ color: '#fff', fontSize: 14 }}>
              {r.time} · {r.client.name}
            </Typography>

            <Typography sx={{ color: '#ccc', fontSize: 13, mt: 0.5 }}>
              ✂️ {r.service.name} · ${r.service.price}
            </Typography>

            <Typography sx={{ color: '#888', fontSize: 12, mt: 0.5 }}>
              📍 {r.location.name}
            </Typography>

            
            {r.status === 'pending' && (
              <Stack direction="row" spacing={1} mt={2}>
                <Button size="small"
                disabled={processingId === r.id}
                onClick={() => handleConfirm(r.id)}>
                  Confirmar
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={processingId === r.id}
                  onClick={() => handleCancel(r.id)}
                >
                  Cancelar
                </Button>
              </Stack>
            )}

            {r.status === 'confirmed' && (
              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  size="small"
                  color="success"
                  onClick={() => handleComplete(r.id)}
                >
                  Atendido
                </Button>
                <Button
                  size="small"
                  color="warning"
                  onClick={() => handleNoShow(r.id)}
                >
                  No asistió
                </Button>
              </Stack>
            )}

          </CardContent>
        </Card>
      ))}


       
    </Box>
  </Box>
);

}
