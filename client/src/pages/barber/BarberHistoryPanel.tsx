import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from '@mui/material';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { TodayBooking } from '../../types/booking';
import Metric from './Metric';



export default function BarberHistoryPanel() {
  const { user } = useAuth();

  const [history, setHistory] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user?.access_token) return;

  setLoading(true);

  api
    .get('/bookings/barber/history', {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    })
    .then(res => setHistory(res.data))
    .finally(() => setLoading(false));
}, [user?.access_token]);


  const today = new Date().toISOString().split('T')[0];
  const todayHistory = history.filter(r => r.date === today);

  const metrics = {
  total: history.length,
  completed: history.filter(r => r.status === 'completed').length,
  canceled: history.filter(r => r.status === 'canceled').length,
};

const totalRevenue = history
  .filter(r => r.status === 'completed')
  .reduce((acc, r) => acc + r.service.price, 0);


  const dailyRevenue = todayHistory
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + r.service.price, 0);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0F0F0F', p: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          textAlign: 'center',
          mb: 3,
        }}
      >
        Panel de Barbería
      </Typography>

      {/* Métricas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(5, 1fr)' },
          gap: 2,
          maxWidth: 900,
          mx: 'auto',
          mb: 4,
        }}
      >
        <Metric label="Total" value={metrics.total} />
        <Metric label="Atendidos" value={metrics.completed} color="success.main" />
        <Metric label="Cancelados" value={metrics.canceled} color="error.main" />
        <Metric label="💰 Hoy" value={`$${dailyRevenue}`} />

      </Box>

      {/* Historial */}
      <Stack spacing={2} alignItems="center">
        {todayHistory.map(r => (
          <Card
            key={r.id}
            sx={{
              width: { xs: '100%', sm: 520 },
              backgroundColor: '#111',
              border: '1px solid #222',
            }}
          >
            <CardContent>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                {r.time} · {r.client.name}
              </Typography>

              <Typography sx={{ color: '#aaa', fontSize: 13 }}>
                ✂️ {r.service.name} · ${r.service.price}
              </Typography>

              <Typography sx={{ color: '#777', fontSize: 12 }}>
                Estado: {r.status}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
