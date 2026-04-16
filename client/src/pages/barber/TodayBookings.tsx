import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import HistoryIcon from '@mui/icons-material/History';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { TodayBooking } from '../../types/booking';
import { DialogActions } from '@mui/material';

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
  const canHaveActions = (status: TodayBooking['status']) =>
  status !== 'completed' && status !== 'canceled';

  const historyReservations = sortedReservations.filter(
    r =>
      r.status === 'completed' ||
      r.status === 'canceled' ||
      r.status === 'no_show'
  );

  const [selectedReservation, setSelectedReservation] = useState<TodayBooking | null>(null);
  
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [showHistory, setShowHistory] = useState(false);  

  const [paymentDialog, setPaymentDialog] = useState<{
  open: boolean;
  reservationId: number | null;
}>({
  open: false,
  reservationId: null,
});

const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mercado_pago' | null>(null);
  


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
  const handleViewDetail = (reservation: TodayBooking) => {
  setSelectedReservation(reservation);
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
  const hasTurnStarted = (date: string, time: string) => {
  const now = new Date();

  const turnDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);

  turnDate.setHours(hours, minutes, 0, 0);

  return now >= turnDate;
};


const today = new Date().toISOString().split('T')[0];

const todayHistory: TodayBooking[] = historyReservations.filter(
  r => r.date === today
);

const metrics = {
  total: todayHistory.length,
  completed: todayHistory.filter(r => r.status === 'completed').length,
  noShow: todayHistory.filter(r => r.status === 'no_show').length,
  canceled: todayHistory.filter(r => r.status === 'canceled').length,
};

const dailyRevenue = todayHistory
  .filter(r => r.status === 'completed')
  .reduce((total, r) => total + r.service.price, 0);
const handleConfirmPayment = async () => {
  if (!paymentDialog.reservationId || !paymentMethod) return;

  try {
    setProcessingId(paymentDialog.reservationId);

    // 🔥 SOLO ESTO
    await api.post(
      '/payment',
      {
        reservationId: paymentDialog.reservationId,
        method: paymentMethod,
      },
      {
        headers: { Authorization: `Bearer ${user?.access_token}` },
      }
    );

    // ❌ BORRAR esto
    // await api.post(`/bookings/${id}/complete`)

    // 🔥 actualizar manualmente estado en UI
    setReservations(prev =>
      prev.map(r =>
        r.id === paymentDialog.reservationId
          ? { ...r, status: 'completed' }
          : r
      )
    );

    setPaymentDialog({ open: false, reservationId: null });
    setPaymentMethod(null);

  } catch (error: any) {
    console.error('Error confirmando pago', error.response?.data);
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F0F0F',
        px: 2,
      }}
      
    >
      <Stack spacing={1} alignItems="center">
        <Typography
          sx={{
            color: '#DBD515',
            fontSize: { xs: 16, sm: 18 },
            fontWeight: 600,
          }}
        >
          No tenés turnos para hoy
        </Typography>

        <Typography
          sx={{
            color: '#aaa',
            fontSize: { xs: 13, sm: 14 },
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          Cuando tengas reservas asignadas, aparecerán acá para que puedas
          gestionarlas.
        </Typography>
      </Stack>
    </Box>
  );
}

  const Metric = ({ label, value, color = '#ccc' }: any) => (
  <Box
    sx={{
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: 1.5,
      py: 1,
      textAlign: 'center',
    }}
  >
    <Typography sx={{ fontSize: 11, color: '#777' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 16, fontWeight: 600, color }}>
      {value}
    </Typography>
  </Box>
);


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
       <IconButton
        onClick={() => setShowHistory(true)}
        sx={{ color: '#DBD515' }}
      >
        <HistoryIcon />
      </IconButton>

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
              {r.time} · {r.client?.name ?? 'Cliente anónimo'}
            </Typography>

            <Typography sx={{ color: '#ccc', fontSize: 13, mt: 0.5 }}>
              ✂️ {r.service.name} · ${r.service.price}
            </Typography>

            <Typography sx={{ color: '#888', fontSize: 12, mt: 0.5 }}>
              📍 {r.location.name}
            </Typography>
            
            {canHaveActions(r.status) && (
            <Stack direction="row" spacing={1} mt={2}>
              <Button
                size="small"
                color="success"
                variant="outlined"
                onClick={() => handleViewDetail(r)}
              >
                Ver detalle
              </Button>

              {r.status === 'pending' && (
                <>
                  <Button
                    size="small"
                    color="success"
                    variant="outlined"
                    disabled={processingId === r.id}
                    onClick={() => handleConfirm(r.id)}
                  >
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
                </>
              )}

              {r.status === 'confirmed' && (() => {
                const turnStarted = hasTurnStarted(r.date, r.time);

                return (
                  <>
                    {!turnStarted && (
                      <Typography variant="caption" color="text.secondary">
                        El turno aún no comenzó
                      </Typography>
                    )}

                    {turnStarted && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          disabled={processingId === r.id}
                          onClick={() =>
                            setPaymentDialog({ open: true, reservationId: r.id })
                          }
                        >
                          Atendido
                        </Button>

                        <Button
                          size="small"
                          color="warning"
                          disabled={processingId === r.id}
                          onClick={() => handleNoShow(r.id)}
                        >
                          No asistió
                        </Button>
                      </>
                    )}
                  </>
                );
              })()}

            </Stack>
            )}


          </CardContent>
        </Card>
      ))}
      <Slide direction="right" in={showHistory} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: '#0F0F0F',
            zIndex: 1300,
            p: 2,
          }}
        >
          {/* Header historial */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              position: 'relative',
              mb: { xs: 2, sm: 3 },
            }}
          >
            <IconButton
              onClick={() => setShowHistory(false)}
              sx={{
                color: '#DBD515',
                position: { xs: 'absolute', sm: 'relative' },
                left: { xs: 0, sm: 'auto' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                color: '#DBD515',
                fontSize: { xs: 18, sm: 22 },
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
            Atras            
            </Typography>
          </Box>



          {/* Métricas */}
          
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  sm: 'repeat(5, 1fr)',
                },
                gap: { xs: 1, sm: 2 },
                mb: { xs: 3, sm: 4 },
                maxWidth: 900,
                mx: 'auto',
              }}
            >
              <Metric label="Total" value={metrics.total} />
              <Metric label="Atendidos" value={metrics.completed} color="success.main" />
              <Metric label="No asistió" value={metrics.noShow} color="warning.main" />
              <Metric label="Cancelados" value={metrics.canceled} color="error.main" />
              <Metric label="💰 Hoy" value={`$${dailyRevenue}`} />
            </Box>

          {/* Historial */}
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            {todayHistory.map(r => (
              <Card
                key={r.id}
                sx={{
                  backgroundColor: '#111',
                  border: '1px solid #222',
                  borderRadius: 2,
                  width: { xs: '100%', sm: 520 },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  {/* Línea principal */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      sx={{
                        color: '#fff',
                        fontSize: { xs: 14, sm: 16 },
                        fontWeight: 600,
                      }}
                    >
                      {r.time}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: { xs: 11, sm: 12 },
                        color: '#fff',
                      }}
                    >
                      {statusConfig[r.status].label}
                    </Typography>
                  </Stack>

                  {/* Cliente */}
                  <Typography sx={{ color: '#ccc', fontSize: { xs: 13, sm: 14 } }}>
                    👤 {r.client?.name ?? 'Cliente anónimo'}
                  </Typography>

                  {/* Servicio */}
                  <Typography sx={{ color: '#888', fontSize: { xs: 12, sm: 13 } }}>
                    ✂️ {r.service.name} · ${r.service.price}
                  </Typography>                  
                  <Typography sx={{ color: '#888', fontSize: 12 }}>
                    📍 {r.location.name} – {r.location.address}
                  </Typography>
                   <Typography sx={{ color: '#888', fontSize: 12 }}>
                    📍 {r.date} 
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Slide>
   
    </Box>
    <Box
      sx={{
        backgroundColor: '#111',
                      border: { xs: '1px solid #222', sm: '1px solid #333' },
                      borderRadius: 2,
                      width: {
                      xs: '92%',
                      sm: 480,
                    },
                      mx: 'auto'
      }}
      
    >
      <Dialog
  open={paymentDialog.open}
  onClose={() => setPaymentDialog({ open: false, reservationId: null })}
>
  <DialogTitle>Confirmar pago</DialogTitle>

  <DialogContent>
    <Stack spacing={2} mt={1}>
      <Button
        variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
        onClick={() => setPaymentMethod('cash')}
      >
        Efectivo
      </Button>

      <Button
        variant={paymentMethod === 'mercado_pago' ? 'contained' : 'outlined'}
        onClick={() => setPaymentMethod('mercado_pago')}
      >
        Mercado Pago
      </Button>
    </Stack>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() =>
        setPaymentDialog({ open: false, reservationId: null })
      }
    >
      Cancelar
    </Button>

    <Button
      disabled={!paymentMethod}
      onClick={handleConfirmPayment}
      variant="contained"
      color="success"
    >
      Confirmar
    </Button>
  </DialogActions>
</Dialog>
    <Dialog
      open={Boolean(selectedReservation)}
      onClose={() => setSelectedReservation(null)}
      fullWidth
      maxWidth="sm"
      
    >
      <DialogTitle  sx={{ textAlign:'center'}}>Detalle del turno</DialogTitle>

      {selectedReservation && (
        <DialogContent sx={{ textAlign:'center'}} dividers>
          <Typography><b>Cliente:</b> {selectedReservation.client.name}</Typography>
          <Typography><b>Hora:</b> {selectedReservation.time}</Typography>
          <Typography><b>Servicio:</b> {selectedReservation.service.name}</Typography>
          <Typography><b>Precio:</b> ${selectedReservation.service.price}</Typography>
          <Typography><b>Local:</b> {selectedReservation.location.name}</Typography>
          <Typography><b>Estado:</b> {selectedReservation.status}</Typography>
        </DialogContent>
      )}
    </Dialog>
    </Box>
  </Box>
);

}
