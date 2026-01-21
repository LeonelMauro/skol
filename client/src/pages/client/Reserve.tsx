import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Location } from '../../types/location';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import IconButton from '@mui/material/IconButton';

export default function Reserve() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/location')
      .then(res => setLocations(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
  const selectedLocation = locations.find(
    loc => loc.id === selectedLocationId
  );

  if (!selectedLocation) return;

  navigate('/reservas/barberos', {
    state: {
      location: selectedLocation,
    },
  });
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
      }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography
          sx={{
            fontFamily: 'Keania One',
            fontSize: { xs: 28, sm: 32, md: 36 },
            color: '#DBD515',
            letterSpacing: 1.5,
            mb: 1,
          }}
        >
          Reservar turno
        </Typography>

        <Typography
          sx={{
            color: '#aaa',
            fontSize: { xs: 14, sm: 15 },
            maxWidth: 420,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          ¿Dónde querés atenderte?
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <>
          {/* GRID DE LOCALES */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fit, minmax(260px, 1fr))',
                textAlign: 'center'
              },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {locations.map((loc) => {
              const selected = selectedLocationId === loc.id;

              return (
                <Card
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: '#000',
                    borderRadius: 3,
                    border: selected
                      ? '2px solid #DBD515'
                      : '1px solid #333',
                    transition: '0.3s',

                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: selected
                        ? '0 0 20px rgba(219,213,21,0.4)'
                        : '0 10px 25px rgba(0,0,0,0.6)',
                    },
                  }}
                >
                  <CardActionArea >
                    <CardMedia
                    component="img"
                    image={loc.imageUrl}
                    alt={loc.name}
                    sx={{
                      height: { xs: 130, sm: 140 },
                      objectFit: 'cover',
                    }}
                  />


                    <CardContent  sx={{ py: 1.5 }}>
                      <Typography
                        sx={{
                      fontFamily: 'Keania One',
                      color: '#DBD515',
                      letterSpacing: 1,
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      lineHeight: 1.3,
                    }}
                      >
                        {loc.name}
                      </Typography>

                      <Typography sx={{
                        color: '#ccc',
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        lineHeight: 2.4,
                      }}>
                        {loc.address}
                      </Typography>
                      <IconButton
                      size="small"
                      component="a"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        color: '#DBD515',
                        p: 0.5,
                        transform: 'translateY(-1px)',
                        '&:hover': {
                          color: '#fff',
                        },
                      }}
                    >
                      <LocationOnIcon fontSize="small" />
                    </IconButton>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>

          {/* BOTÓN */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 'bold',
              maxWidth: 300,
              mx: 'auto',
              display: 'block',
            }}
            disabled={!selectedLocationId}
            onClick={handleNext}
          >
            Continuar
          </Button>
        </>
      )}
    </Box>
  </Box>
);}