import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Autocomplete from '@mui/material/Autocomplete';

export default function SelectClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [clients, setClients] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [guestName, setGuestName] = useState('Cliente anónimo');
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const state = location.state as
    | { service: { id: number; name: string } }
    | undefined;

  if (!state) {
    navigate('/servicios', { replace: true });
    return null;
  }

  const searchClients = async (query: string) => {
    if (!query || query.length < 2) return;

    try {
      setSearching(true);
      const res = await api.get('/user/search', { params: { q: query } });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const { service } = state;

  const handleConfirm = async () => {
    if (!user?.location?.id) {
      console.error('El barbero no tiene local asignado');
      return;
    }

    try {
      setSubmitting(true);

      const now = new Date();

      await api.post('/bookings/barber/direct', {
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

      navigate('/barber');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const whiteTextField = {
    input: { color: '#fff', fontSize: { xs: 14, sm: 16 } },
    label: { color: '#ccc', fontSize: { xs: 14, sm: 16 } },
    '& label.Mui-focused': { color: '#DBD515' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#fff' },
      '&:hover fieldset': { borderColor: '#DBD515' },
      '&.Mui-focused fieldset': { borderColor: '#DBD515' },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: { xs: 8, sm: 10, md: 12 },
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 2, // espacio entre elementos
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
            mb: 1,
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
          }}
        >
          Cliente
        </Typography>

        <Typography sx={{ color: '#ccc', mb: 2, fontSize: { xs: 14, sm: 16 } }}>
          Servicio: <b>{service.name}</b>
        </Typography>

        <Divider sx={{ mb: 2, borderColor: '#444' }} />

        <Autocomplete
          options={clients}
          getOptionLabel={(option) =>
            option.email ? `${option.name} (${option.email})` : option.name
          }
          loading={searching}
          onInputChange={(_, value) => searchClients(value)}
          onChange={(_, value) => {
            setSelectedClient(value);
            if (value) {
              setClientEmail(value.email);
              setGuestName(value.name);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar cliente existente"
              sx={whiteTextField}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searching ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Typography sx={{ color: '#aaa', fontSize: { xs: 12, sm: 14 } }}>o</Typography>

        <TextField
          fullWidth
          label="Nombre del cliente"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          sx={whiteTextField}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 'bold',
            fontSize: { xs: 14, sm: 16 },
            py: { xs: 1.5, sm: 2 },
          }}
          disabled={submitting}
          onClick={handleConfirm}
        >
          {submitting ? <CircularProgress size={22} /> : 'Confirmar servicio'}
        </Button>
      </Box>
    </Box>
  );
}
