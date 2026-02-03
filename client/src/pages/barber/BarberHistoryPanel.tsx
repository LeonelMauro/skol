import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';


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

const bookingsByDate = Object.values(
  history.reduce((acc: any, r) => {
    acc[r.date] = acc[r.date] || { date: r.date, count: 0 };
    acc[r.date].count += 1;
    return acc;
  }, {})
);
const statusData = [
  { name: 'Atendidos', value: metrics.completed },
  { name: 'Cancelados', value: metrics.canceled },
];

const COLORS = ['#4caf50', '#f44336'];

const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
const [selectedMonth, setSelectedMonth] = useState<number>(
  new Date().getMonth()
);
const groupByDay = (data: TodayBooking[]) => {
  const map: Record<string, number> = {};

  data.forEach(r => {
    const formattedDate = new Date(r.date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });

    map[formattedDate] = (map[formattedDate] || 0) + 1;
  });

  return Object.entries(map).map(([label, count]) => ({
    label,
    count,
  }));
};


const groupByWeekDay = (data: TodayBooking[]) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const map: Record<string, number> = {};
  data.forEach(r => {
    const day = days[new Date(r.date).getDay()];
    map[day] = (map[day] || 0) + 1;
  });
  return days.map(d => ({ label: d, count: map[d] || 0 }));
};

const groupByMonth = (data: TodayBooking[], month: number) => {
  const map: Record<number, number> = {};
  data
    .filter(r => new Date(r.date).getMonth() === month)
    .forEach(r => {
      const day = new Date(r.date).getDate();
      map[day] = (map[day] || 0) + 1;
    });

  return Object.entries(map).map(([d, count]) => ({
    label: `Día ${d}`,
    count,
  }));
};

const chartData =
  period === 'day'
    ? groupByDay(todayHistory)
    : period === 'week'
    ? groupByWeekDay(history)
    : groupByMonth(history, selectedMonth);




const totalRevenue = history
  .filter(r => r.status === 'completed')
  .reduce((acc, r) => acc + r.service.price, 0);


  const dailyRevenue = todayHistory
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + r.service.price, 0);

    const formatCurrency = (value: number) =>
  value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0F0F0F', p: 2 }}>

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
      <Typography
        sx={{
          textAlign: 'center',
          color: '#888',
          fontSize: 14,
          mb: 3,
        }}
      >
        Resumen de actividad y facturación
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(5, 1fr)',
          },
          gap: 2,
          maxWidth: 900,
          mx: 'auto',
          mb: 4,
        }}
      >
        <Metric label="Turnos" value={metrics.total} />
        <Metric label="Atendidos" value={metrics.completed} color="success.main" />
        <Metric label="Cancelados" value={metrics.canceled} color="error.main" />
        <Metric label="💰 Hoy" value={formatCurrency(dailyRevenue)} />
        <Metric label="💰 Total" value={formatCurrency(totalRevenue)} color="info.main" />
      </Box>
      
<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={2}
  justifyContent="center"
  alignItems="center"
  mb={3}
>
  <Stack direction="row" spacing={1}>
    <Button
      variant={period === 'day' ? 'contained' : 'outlined'}
      onClick={() => setPeriod('day')}
    >
      Día
    </Button>
    <Button
      variant={period === 'week' ? 'contained' : 'outlined'}
      onClick={() => setPeriod('week')}
    >
      Semana
    </Button>
    <Button
      variant={period === 'month' ? 'contained' : 'outlined'}
      onClick={() => setPeriod('month')}
    >
      Mes
    </Button>
  </Stack>

  {period === 'month' && (
    <select
      value={selectedMonth}
      onChange={e => setSelectedMonth(Number(e.target.value))}
      style={{
        background: '#111',
        color: '#DBD515',
        border: '1px solid #333',
        padding: '6px 10px',
        borderRadius: 6,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <option key={i} value={i}>
          {new Date(2024, i).toLocaleString('es-AR', { month: 'long' })}
        </option>
      ))}
    </select>
  )}
</Stack>

<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
    gap: 3,
    maxWidth: 1000,
    mx: 'auto',
    mb: 6,
  }}
>
  {/* BARRAS */}
  <Card sx={{ backgroundColor: '#111', p: 2 }}>
  <Typography sx={{ color: '#DBD515', mb: 1, textAlign: 'center' }}>
    Turnos por {period === 'day' ? 'día' : period === 'week' ? 'semana' : 'mes'}
  </Typography>

  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={chartData}>
      <XAxis
        dataKey="label"
        stroke="#888"
        tick={{ fontSize: 12 }}
      />
      <YAxis stroke="#888" />
      <Tooltip />
      <Bar
        dataKey="count"
        fill="#DBD515"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</Card>


  {/* PIE */}
  <Card sx={{ backgroundColor: '#111', p: 2 }}>
    <Typography sx={{ color: '#DBD515', mb: 1 }}>
      Estado de turnos
    </Typography>

    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={statusData}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
          label
        >
          {statusData.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </Card>
</Box>
<Stack
  direction="row"
  spacing={2}
  justifyContent="center"
  mt={2}
>
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 12, height: 12, bgcolor: COLORS[0], borderRadius: '50%' }} />
    <Typography sx={{ color: '#ccc', fontSize: 13 }}>
      Atendidos
    </Typography>
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 12, height: 12, bgcolor: COLORS[1], borderRadius: '50%' }} />
    <Typography sx={{ color: '#ccc', fontSize: 13 }}>
      Cancelados
    </Typography>
  </Stack>
</Stack>



    </Box>
    
  );
}
