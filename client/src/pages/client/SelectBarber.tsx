import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Barber } from '../../types/user';
import { useAuth } from '../../context/AuthContext';

export default function SelectBarber() {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | 'any' | null>(null);
  const [loading, setLoading] = useState(false);
   //User authorization
      const {user}= useAuth();
      const authHeader={
        Authorization: `Bearer ${user?.access_token}`
      }

  useEffect(() => {
    setLoading(true);
    api
      .get(`/location/${locationId}/barbers`,{ headers: authHeader })
      .then(res => setBarbers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [locationId]);

  const handleNext = () => {
    if (!selectedBarberId) return;
    navigate(`/reservas/${locationId}/servicio`, {
      state: { barberId: selectedBarberId },
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
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 1,
        }}
      >
        Elegir barbero
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 3 }}>
        ¿Con quién querés atenderte?
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
            <Grid item xs={12}>
              <Card
                onClick={() => setSelectedBarberId('any')}
                sx={{
                  backgroundColor: '#000',
                  borderRadius: 3,
                  border:
                    selectedBarberId === 'any'
                      ? '2px solid #DBD515'
                      : '1px dashed #555',
                  transition: '0.3s',
                }}
              >
                <CardActionArea>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Keania One',
                        color: '#DBD515',
                        mb: 0.5,
                      }}
                    >
                      Cualquiera disponible
                    </Typography>
                    <Typography sx={{ color: '#ccc', fontSize: 14 }}>
                      Asignamos el primer barbero libre
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* BARBEROS */}
            {barbers.map(barber => {
              const selected = selectedBarberId === barber.id;

              return (
                <Grid item xs={12} sm={6} md={4} key={barber.id}>
                  <Card
                    onClick={() => setSelectedBarberId(barber.id)}
                    sx={{
                      backgroundColor: '#000',
                      borderRadius: 3,
                      border: selected
                        ? '2px solid #DBD515'
                        : '1px solid #333',
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardActionArea>
                      <CardContent sx={{ textAlign: 'center' }}>
                        {/* Placeholder foto */}
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: '#222',
                            mx: 'auto',
                            mb: 2,
                          }}
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
                          {barber.specialty || 'Barbero profesional'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* BOTONES */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ color: '#fff', borderColor: '#555' }}
              onClick={() => navigate(-1)}
            >
              Atrás
            </Button>

            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#DBD515',
                color: '#000',
                fontWeight: 'bold',
              }}
              disabled={!selectedBarberId}
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
