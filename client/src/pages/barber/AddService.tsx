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
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { serviceIcons } from '../../utils/serviceIcons';
import type { Service } from '../../types/services';

export default function AddService() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Service[]>('/services')
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    const selectedService = services.find(s => s.id === selectedServiceId);
    if (!selectedService) return;

    // 👉 acá después podés:
    // - ir a carga directa
    // - abrir modal
    // - asociar al barbero
    // - etc
    console.log('Servicio seleccionado:', selectedService);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: { xs: 10, md: 12 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          textAlign: 'center',
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
          Servicios
        </Typography>

        <Typography sx={{ color: '#ccc', mb: 3 }}>
          Seleccioná un servicio
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
            {services.map(servicio => {
              const IconComponent = serviceIcons[servicio.icon];
              const selected = selectedServiceId === servicio.id;

              return (
                <Card
                  key={servicio.id}
                  onClick={() => setSelectedServiceId(servicio.id)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#111',
                    border: selected ? '2px solid #DBD515' : '1px solid #333',
                    cursor: 'pointer',
                    transition: '0.25s',
                    '&:hover': {
                      transform: { sm: 'translateY(-4px)' },
                      boxShadow: '0 12px 28px rgba(219,213,21,0.25)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    {IconComponent && (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          backgroundColor: '#fff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          mx: 'auto',
                        }}
                      >
                        <IconComponent width={22} height={22} />
                      </Box>
                    )}

                    <Typography
                      sx={{
                        fontFamily: 'Keania One',
                        color: '#DBD515',
                        fontSize: 15,
                        mb: 0.5,
                      }}
                    >
                      {servicio.name}
                    </Typography>

                    <Typography sx={{ color: '#ccc', fontSize: 13 }}>
                      {servicio.description}
                    </Typography>

                    <Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>
                      ⏱ {servicio.duration_minutes} min · ${servicio.price}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* BOTONES */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            gap: 2,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
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
      </Box>
    </Box>
  );
}
