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
  Grid
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
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontFamily: 'Keania One', color: '#DBD515', mb: 1 }}
      >
        Elegir barbero
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 4 }}>
        Seleccioná quién querés que te atienda
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* OPCIÓN CUALQUIERA */}
            <Grid xs={12} sm={6} md={4}>
              <Card
                onClick={() => setSelectedBarber({ mode: 'any' })}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#000',
                  borderRadius: 3,
                  border:
                    selectedBarber?.mode === 'any'
                      ? '2px solid #DBD515'
                      : '1px solid #333',
                }}
              >
                <CardActionArea>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        mx: 'auto',
                        mb: 2,
                        bgcolor: '#DBD515',
                        color: '#000',
                      }}
                    >
                      *
                    </Avatar>
                    <Typography
                      sx={{
                        fontFamily: 'Keania One',
                        color: '#DBD515',
                      }}
                    >
                      Cualquiera disponible
                    </Typography>
                    <Typography sx={{ color: '#ccc', fontSize: 14 }}>
                      Te asignamos el primero libre
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* BARBEROS */}
            {barbers.map(barber => {
              const selected =
                selectedBarber?.mode === 'specific' &&
                selectedBarber.barber.id === barber.id;

              return (
                <Grid xs={12} sm={6} md={4} key={barber.id}>
                  <Card
                    onClick={() =>
                      setSelectedBarber({
                        mode: 'specific',
                        barber,
                      })
                    }
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: '#000',
                      borderRadius: 3,
                      border: selected
                        ? '2px solid #DBD515'
                        : '1px solid #333',
                    }}
                  >
                    <CardActionArea>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={barber.avatarUrl}
                          sx={{ mx: 'auto', mb: 2 }}
                        />
                        <Typography
                          sx={{
                            fontFamily: 'Keania One',
                            color: '#DBD515',
                          }}
                        >
                          {barber.name}
                        </Typography>
                        <Typography sx={{ color: '#ccc', fontSize: 14 }}>
                          {barber.specialty}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

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
