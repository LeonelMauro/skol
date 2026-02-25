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
import {
  Snackbar, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  

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

  const handleSubmitBooking = async () => {
  if (!user?.location?.id) return;

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

    setSnackbarOpen(true);

    setTimeout(() => {
      navigate('/barber');
    }, 1500);

  } catch (err) {
    console.error(err);
  } finally {
    setSubmitting(false);
    setConfirmOpen(false);
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
  const displayClientName =
  selectedClient?.name ||
  guestName?.trim() ||
  "Cliente anónimo";

  const now = new Date();
  const formattedTime = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: { xs: 6, sm: 10, md: 12 },
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
          gap: { xs: 1.5, sm: 2 }, // espacio entre elementos
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
          }}
        >
          {service.name}
        </Typography>

        <Typography sx={{ color: '#aaa', fontSize: 14 }}>
          Confirmar cliente del turno
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
        <Box
          sx={{
            mt: { xs: 2.5, sm: 4 },
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: '#555',
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/servicios')}>
              Volver
          </Button>
      
          <Button
            fullWidth
            variant="contained"
            sx={{
            backgroundColor: '#DBD515',
            color: '#000',
            fontWeight: 'bold',
            }}
            disabled={submitting}
            onClick={() => setConfirmOpen(true)}
            >
              Continuar
            </Button>
        </Box>
      </Box>
      {/* Confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirmar turno
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Confirmar <strong>{service.name}</strong> para{" "}
            <strong>{displayClientName}</strong> a las{" "}
            <strong>{formattedTime}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmitBooking}
            variant="contained"
            sx={{
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
      open={snackbarOpen}
      autoHideDuration={1500}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="success" sx={{ width: '100%' }}>
        Turno confirmado correctamente
      </Alert>
    </Snackbar>      
    </Box>
  ); 
}
