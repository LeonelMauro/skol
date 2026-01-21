import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Location } from '../../types/location';
import type { Service } from '../../types/services';
import type { Barber } from '../../types/user';

type SelectedBarber =
  | { mode: 'any' }
  | { mode: 'specific'; barber: Barber };

interface LocationState {
  location: Location;
  barber: SelectedBarber;
  service: Service;
  date: string;
  time: string;
}

export default function ConfirmReservation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

  const { location, barber, service, date, time } = state as LocationState;

  const barberId =
    barber.mode === 'specific' ? barber.barber.id : undefined;
  

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* 🔹 Cargar datos */
  useEffect(() => {
  if (!state) {
    navigate('/reservas', { replace: true });
  }
}, [state, navigate]);

if (!state) return null;

  /* 🔹 Confirmar reserva */
  const handleConfirm = async () => {
  setSubmitting(true);
  setError(null);

  try {
    await api.post(
      '/bookings',
      {
        clientId: user?.id,
        barberId, // puede ser undefined
        serviceId: service.id,
        locationId: location.id,
        date,
        time,
      },
      {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      }
    );

    setSuccess(true);

    setTimeout(() => {
      navigate('/mis-reservas');
    }, 2000);
  } catch (err: any) {
    setError(
      err?.response?.data?.message ||
        'No se pudo confirmar la reserva. Intentá nuevamente.'
    );
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: '#0F0F0F',
            px: { xs: 2, md: 6 },
            pt: { xs: 10, md: 12 },
          }}
        >
    <Box
      sx={{
        backgroundColor: '#111',
        borderRadius: 3,
        p: 3,
        mb: 4,
        border: '1px solid #333',
      }}
    >
      <Typography sx={{ color: '#ccc', mb: 1 }}>
        📅 <strong>Fecha:</strong> {date}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 1 }}>
        ⏰ <strong>Hora:</strong> {time}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 1 }}>
        ✂️ <strong>Barbero:</strong>{' '}
        {barber.mode === 'specific'
          ? barber.barber.name
          : 'Cualquiera disponible'}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 1 }}>
        💈 <strong>Servicio:</strong> {service.name} · ${service.price}
      </Typography>

      <Typography sx={{ color: '#ccc' }}>
        📍 <strong>Local:</strong> {location.name} – {location.address}
      </Typography>




      {/* FEEDBACK */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Reserva creada correctamente. Redirigiendo…
        </Alert>
      )}

      {/* ACCIONES */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
              variant="outlined"
              sx={{ color: '#fff', borderColor: '#555' }}
              onClick={() => navigate(-1)}
        >
          Volver
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={submitting || success}
          sx={{
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 'bold',
          }}
        >
          {submitting ? (
            <CircularProgress size={24} />
          ) : (
            'Confirmar reserva'
          )}
        </Button>
      </Box>
    </Box>
  </Box>
  );
}
