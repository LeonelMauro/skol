import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { serviceIcons } from '../../utils/serviceIcons';
import type { Service } from '../../types/services';

export default function SelectService() {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const { state } = useLocation();

  const barberId = state?.barberId;

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    api
      .get('/services')
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (!selectedServiceId) return;

    navigate(`/reservas/fecha`, {
      state: {
        barberId,
        serviceId: selectedServiceId,
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
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 1,
        }}
      >
        Elegir servicio
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 3 }}>
        Seleccioná el servicio que querés reservar
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {services.map(servicio => {
              const IconComponent = serviceIcons[servicio.icon];
              const selected = selectedServiceId === servicio.id;

              return (
                <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                  <Card
                    onClick={() => setSelectedServiceId(servicio.id)}
                    sx={{
                      width: '100%',
                      borderRadius: 2.5,
                      backgroundColor: '#111',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                      border: selected
                        ? '2px solid #DBD515'
                        : '1px solid #333',
                      transition: '0.35s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 18px 45px rgba(219,213,21,0.35)',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      {/* ÍCONO */}
                      {IconComponent && (
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            mx: 'auto',
                          }}
                        >
                          <IconComponent width={32} height={32} />
                        </Box>
                      )}

                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Keania One',
                          color: '#DBD515',
                          mb: 1,
                        }}
                      >
                        {servicio.name}
                      </Typography>

                      <Typography sx={{ color: '#ccc', fontSize: 14 }}>
                        {servicio.description}
                      </Typography>

                      <Typography sx={{ color: '#ccc', mt: 1 }}>
                        ⏱ {servicio.duration_minutes} min · ${servicio.price}
                      </Typography>
                    </CardContent>
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
              disabled={!selectedServiceId}
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
