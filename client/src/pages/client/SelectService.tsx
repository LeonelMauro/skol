import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { serviceIcons } from '../../utils/serviceIcons';
import type { Service } from '../../types/services';
import type { Location } from '../../types/location';
import type { Barber } from '../../types/user';

type SelectedBarber =
  | { mode: 'any' }
  | { mode: 'specific'; barber: Barber };


export default function SelectService() {

  const navigate = useNavigate();
  const locationRouter = useLocation();
  const state = locationRouter.state as
  | { location: Location; barber: SelectedBarber }
  | undefined;


  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!state) {
    navigate('/reservas', { replace: true });
  }
}, [state, navigate]);

if (!state) return null;

const { location, barber } = state;

useEffect(() => {
  setLoading(true);

  api
    .get<Service[]>('/services', {
      params: { locationId: location.id },
    })
    .then(res => setServices(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
}, [location.id]);


  const handleNext = () => {
  const selectedService = services.find(
    s => s.id === selectedServiceId
  );

  if (!selectedService) return;

  navigate('/reservas/fecha', {
    state: {
      location,
      barber,
      service: selectedService,
    },
  });
};


  return (
        <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#0F0F0F',
      pt: 3,
    }}
  >
       <Box
    sx={{
      maxWidth: 1200,
      mx: 'auto',
      px: { xs: 2, md: 4 },
      textAlign: 'center'
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
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(auto-fit, minmax(150px, 1fr))',
        sm: 'repeat(auto-fit, minmax(220px, 1fr))',
        md: 'repeat(auto-fit, minmax(260px, 1fr))',
      },
      gap: { xs: 1.5, sm: 3 },

    }}
  >
    {services.map((servicio) => {
      const IconComponent = serviceIcons[servicio.icon];
      const selected = selectedServiceId === servicio.id;

      return (
        <Card
          key={servicio.id}
          onClick={() => setSelectedServiceId(servicio.id)}
          sx={{
            width: '100%',
            borderRadius: 2,
            backgroundColor: '#111',
            border: selected ? '2px solid #DBD515' : '1px solid #333',
            transition: '0.25s',
            cursor: 'pointer',

            '&:hover': {
              transform: { sm: 'translateY(-4px)' },
              boxShadow: '0 12px 28px rgba(219,213,21,0.25)',
            },
          }}
        >
          <CardContent 
           sx={{
            textAlign: 'center',
            py: { xs: 1.2, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
          >
            {IconComponent && (
              <Box
                sx={{
                  width: { xs: 40, sm: 56 },
                  height: { xs: 40, sm: 56 },
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: { xs: 1, sm: 2 },
                  mx: 'auto',
                }}

              >
                <IconComponent width={22} height={22} />
              </Box>
            )}

            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Keania One',
                color: '#DBD515',
                fontSize: { xs: 13, sm: 15 },
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {servicio.name}
            </Typography>

            <Typography 
            sx={{
              color: '#ccc',
              fontSize: { xs: 11, sm: 13 },
              lineHeight: 1.3,
            }}
            >
              {servicio.description}
            </Typography>

            <Typography sx={{
              color: '#aaa',
              fontSize: { xs: 11, sm: 13 },
              mt: 0.5,
            }}>
              ⏱ {servicio.duration_minutes} min · ${servicio.price}
            </Typography>
          </CardContent>
        </Card>
      );
    })}
  </Box>
)}

     

          {/* BOTONES */}
          <Box sx={{
              mt: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              maxWidth: 600,
              mx: 'auto',
            }}>
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
              disabled={!selectedServiceId || services.length === 0}
              onClick={handleNext}
            >
              Continuar
            </Button>
          </Box>
           </Box>
  </Box>
  )}
