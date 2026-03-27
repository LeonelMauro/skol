import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Barber } from '../../types/user';
import type { Location } from '../../types/location';
import { useAuth } from '../../context/AuthContext';

type SelectedBarber =
  | { mode: 'any' }
  | { mode: 'specific'; barber: Barber };

export default function SelectBarber() {
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const { user } = useAuth();

  const state = locationRouter.state as
    | { location: Location }
    | undefined;

  useEffect(() => {
    if (!state?.location) {
      navigate('/reservas', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { location } = state;

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] =
    useState<SelectedBarber | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  setLoading(true);

  api
    .get(`/location/${location.id}/barbers`, {
      headers: {
        Authorization: `Bearer ${user?.access_token}`,
      },
    })
    .then(res => setBarbers(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
}, [location.id, user?.access_token]);


  const handleNext = () => {
    if (!selectedBarber) return;

    navigate(`/reservas/${location.id}/servicio`, {
  state: {
    location,
    barber: selectedBarber,
  },
});

  };
 

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        px: { xs: 2, md: 6 },
        pt: { xs: 10, md: 12 },
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h4"
       sx={{
            fontFamily: 'Keania One',
            fontSize: { xs: 28, sm: 32, md: 36 },
            color: '#DBD515',
            letterSpacing: 1.5,
            mb: 1,
          }}
      >
        Elegir barbero
      </Typography>

      <Typography sx={{
            color: '#aaa',
            fontSize: { xs: 14, sm: 15 },
            maxWidth: 420,
            mx: 'auto',
            lineHeight: 1.6,
          }}
      >
        Seleccioná quién querés que te atienda
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <> <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(260px, 1fr))',
            },
            gap: { xs: 2, sm: 3 },
            justifyItems: 'center',
          }}
        >

            {/* BARBEROS */}
            {barbers.map(barber => {

              const selected =
                selectedBarber?.mode === 'specific' &&
                selectedBarber.barber.id === barber.id;

              const avatarUrl = barber.avatar
                ? `${import.meta.env.VITE_API_URL}${barber.avatar}`
                : undefined;

              return (
                <Box
                  key={barber.id}
                  onClick={() =>
                    setSelectedBarber({
                      mode: 'specific',
                      barber,
                    })
                  }
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    transition: '0.3s',
                    border: selected
                      ? '2px solid #DBD515'
                      : '1px solid #333',

                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                    },
                  }}
                >
                  <Avatar
                    src={avatarUrl}
                    alt={barber.name}
                    sx={{
                      width: 90,
                      height: 90,
                      mx: 'auto',
                      mb: 1.5,
                      border: selected
                        ? '3px solid #DBD515'
                        : '2px solid #444',
                    }}
                  />

                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: selected ? '#DBD515' : '#fff',
                      letterSpacing: 1,
                    }}
                  >
                    {barber.name}
                  </Typography>
                </Box>
              );
})}
          </Box>

         <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                color: '#fff',
                borderColor: '#555',
                fontWeight: 'bold',
              }}
              onClick={() => navigate('/reservas')}
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
              disabled={!selectedBarber}
              onClick={handleNext}
            >
              Continuar
            </Button>
          </Box>
          
        </>
      )}
    </Box>
  );
}
