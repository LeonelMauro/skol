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

type Reservation = {
  id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no_show';
  barber: { name: string };
  service: { name: string; price: number };
  location: { name: string; address: string };
};

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning' },
  confirmed: { label: 'Confirmada', color: 'success' },
  canceled: { label: 'Cancelada', color: 'error' },
  no_show: { label: 'No asististe', color: 'default' },
  completed:{ label: 'Atendido',    color: 'success' },

} as const;

export default function MyReservations() {
  const { user } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const otherReservations = reservations.filter(r => r.status !== 'pending');


  useEffect(() => {
    api
      .get('/bookings/my', {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then(res => setReservations(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (reservationId: number) => {
  try {
    const res = await api.post(
      `/bookings/${reservationId}/canceled`,
      {},
      {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      }
    );

    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId ? res.data : r
      )
    );
  } catch (error) {
    console.error('Error cancelando la reserva', error);
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
      pt: 3,
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

      <Stack spacing={2}>
        {/* PENDIENTES */}
        {pendingReservations.length > 0 && (
          <Typography
            variant="overline"
            align="center"
            sx={{
              color: '#DBD515',
              mt: 2,
              mb: 1,
              letterSpacing: 1,
            }}
          >
            Reservas pendientes
          </Typography>
        )}

        {pendingReservations.map((r) => {
          const status = statusConfig[r.status];
          const isCancelable = r.status === 'pending';


          return (
            <Card
              key={r.id}
              sx={{
                backgroundColor: '#111',
                border: { xs: '1px solid #222', sm: '1px solid #333' },
                borderRadius: 2,
                width: {
                xs: '92%',
                sm: 480,
              },
                mx: 'auto',
                opacity: isCancelable ? 1 : 0.75,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'center', sm: 'center' }}
                  spacing={0.5}
                >
                  <Typography
                    sx={{
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: { xs: 14, sm: 16 },
                    textAlign: { xs: 'center', sm: 'left' },
                  }}
                  >
                    {r.date} · {r.time}
                  </Typography>

                  <Chip label={status.label} color={status.color} size="small" />
                </Stack>

                <Stack
                  spacing={0.5}
                  sx={{ mt: 1 }}
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                >
                  <Typography sx={{ color: '#ccc', fontSize: 13 }}>
                    ✂️ {r.service.name} · ${r.service.price}
                  </Typography>

                  <Typography sx={{ color: '#ccc', fontSize: 13 }}>
                    💈 Barbero: {r.barber.name}
                  </Typography>

                  <Typography sx={{ color: '#888', fontSize: 12 }}>
                    📍 {r.location.name} – {r.location.address}
                  </Typography>
                </Stack>

                {isCancelable && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{
                    mt: 2,
                    px: 3,
                    alignSelf: { xs: 'center', sm: 'flex-start' },
                  }}
                  onClick={() => handleCancel(r.id)}
                >
                  Cancelar reserva
                </Button>
              )}
              </CardContent>
            </Card>
          );
        })}

        {/* HISTORIAL */}
        {otherReservations.length > 0 && (
          <Typography
            variant="overline"
            align="center"
            sx={{
              color: '#888',
              mt: 4,
              mb: 1,
              letterSpacing: 1,
            }}
          >
            Historial
          </Typography>
        )}

        {otherReservations.map((r) => {
      const status = statusConfig[r.status];

      return (
        <Card
          key={r.id}
          sx={{
            backgroundColor: '#111',
            border: { xs: '1px solid #222', sm: '1px solid #333' },
            borderRadius: 2,
            width: {
            xs: '92%',
            sm: 480,
          },
            mx: 'auto',
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={{ color: '#fff', fontSize: 14 }}>
                {r.date} · {r.time}
              </Typography>

              <Chip label={status.label} color={status.color} size="small" />
            </Stack>

            <Typography sx={{ color: '#ccc', mt: 1, fontSize: 13 }}>
              ✂️ {r.service.name} · ${r.service.price}
            </Typography>
          </CardContent>
        </Card>
      );
    })}

      </Stack>
    </Box>
  </Box>
);

}
