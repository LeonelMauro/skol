import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Autocomplete from '@mui/material/Autocomplete';

export default function SelectClient() {
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [guestName, setGuestName] = useState('Cliente anónimo');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const state = location.state as
    | { service: { id: number; name: string } }
    | undefined;

  if (!state) {
    navigate('/servicios', { replace: true });
    return null;
  }

  const { service } = state;

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

  const displayClientName =
    selectedClient?.name ||
    guestName?.trim() ||
    'Cliente anónimo';

  const now = new Date();
  const formattedTime = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const whiteTextField = {
    input: { color: '#fff' },
    label: { color: '#ccc' },
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
        pt: 10,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
          }}
        >
          {service.name}
        </Typography>

        <Typography sx={{ color: '#aaa' }}>
          Confirmar cliente del turno
        </Typography>

        <Divider sx={{ borderColor: '#444' }} />

        <Autocomplete
          options={clients}
          getOptionLabel={(option) =>
            option.email
              ? `${option.name} (${option.email})`
              : option.name
          }
          loading={searching}
          onInputChange={(_, value) => searchClients(value)}
          onChange={(_, value) => {
            setSelectedClient(value);
            if (value) {
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
                    {searching ? (
                      <CircularProgress size={18} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Typography sx={{ color: '#aaa' }}>o</Typography>

        <TextField
          fullWidth
          label="Nombre del cliente"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          sx={whiteTextField}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: '#555',
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/servicios')}
          >
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
        <DialogTitle>Confirmar turno</DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Confirmar <strong>{service.name}</strong> para{' '}
            <strong>{displayClientName}</strong> a las{' '}
            <strong>{formattedTime}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>

          <Button
            onClick={() => {
              setConfirmOpen(false);

              navigate('/add-service/payment', {
                state: {
                  service,
                  clientEmail: selectedClient?.email || undefined,
                  guestName:
                    selectedClient?.email
                      ? undefined
                      : guestName,
                },
              });
            }}
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
    </Box>
  );
}