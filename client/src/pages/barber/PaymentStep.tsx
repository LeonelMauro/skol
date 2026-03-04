import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

type PaymentMethod = 'cash' | 'mercado_pago';

export default function PaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const state = location.state as
    | {
        service: { id: number; name: string };
        clientEmail?: string;
        guestName?: string;
      }
    | undefined;

  if (!state) {
    navigate('/servicios', { replace: true });
    return null;
  }

  const { service, clientEmail, guestName } = state;

  const handleConfirm = async () => {
    if (!selectedMethod || !user?.location?.id) return;

    try {
      setLoading(true);

      const now = new Date();

      // 1️⃣ Crear reserva
      const bookingRes = await api.post('/bookings/barber/direct', {
        barberId: user.id,
        locationId: user.location.id,
        serviceId: service.id,
        clientEmail: clientEmail || undefined,
        guestName: clientEmail ? undefined : guestName,
        date: now.toLocaleDateString('en-CA'),
        time: now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      });

      const reservationId = bookingRes.data.id;

      // 2️⃣ Crear payment
      await api.post('/payment', {
        reservationId,
        method: selectedMethod,
      });

      // Mostrar snackbar de éxito
      setSnackbar({
        open: true,
        message: `Pago realizado correctamente — ${service.name} (${
          selectedMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'
        })`,
        severity: 'success',
      });

      // Redirigir después de 2.5 segundos
      setTimeout(() => {
        navigate('/barber');
      }, 2500);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/barber');
      }, 2000);
      } catch (err) {
        setSnackbar({
        open: true,
        message: 'Error al procesar el pago',
        severity: 'error',
      });
      } finally {
        setLoading(false);
      }
      };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: 10,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: 'Keania One', color: '#DBD515', mb: 1 }}
        >
          Método de pago
        </Typography>

        <Typography sx={{ color: '#aaa', mb: 3 }}>
          {service.name}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {['cash', 'mercado_pago'].map((method) => {
          const selected = selectedMethod === method;

          return (
            <Card
              key={method}
              onClick={() =>
                setSelectedMethod(method as PaymentMethod)
              }
              sx={{
                mb: 2,
                cursor: 'pointer',
                backgroundColor: '#111',
                border: selected
                  ? '2px solid #DBD515'
                  : '1px solid #333',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    color: selected ? '#DBD515' : '#fff',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                  }}
                >
                  {method === 'cash'
                    ? 'Efectivo'
                    : 'Mercado Pago'}
                </Typography>
              </CardContent>
            </Card>
          );
        })}

        <Button
          fullWidth
          variant="contained"
          disabled={!selectedMethod || loading}
          onClick={handleConfirm}
          sx={{
            mt: 3,
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 'bold',
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirmar pago'}
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}