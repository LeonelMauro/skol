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
} as const;

export default function MyReservations() {
  const { user } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ color: '#fff', mb: 3 }}>
        Mis reservas
      </Typography>

      <Stack spacing={2}>
        {reservations.map(r => {
          const status = statusConfig[r.status];

          return (
            <Card key={r.id} sx={{ backgroundColor: '#111', border: '1px solid #333' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {r.date} · {r.time}
                  </Typography>

                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                  />
                </Stack>

                <Typography sx={{ color: '#ccc', mt: 1 }}>
                  ✂️ {r.service.name} · ${r.service.price}
                </Typography>

                <Typography sx={{ color: '#ccc' }}>
                  💈 Barbero: {r.barber.name}
                </Typography>

                <Typography sx={{ color: '#777', fontSize: 14 }}>
                  📍 {r.location.name} – {r.location.address}
                </Typography>

                {r.status === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    Cancelar reserva
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
