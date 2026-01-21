import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Location } from '../../types/location';

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
        Reservar turno
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 4 }}>
        ¿Dónde querés atenderte?
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {locations.map(loc => {
              const selected = selectedLocationId === loc.id;

              return (
                <Grid item xs={12} sm={6} md={4} key={loc.id}>
                  <Card
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
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        height="160"
                        image={loc.imageUrl}
                        alt={loc.name}
                      />

                      <CardContent>
                        <Typography
                          sx={{
                            fontFamily: 'Keania One',
                            color: '#DBD515',
                            mb: 0.5,
                          }}
                        >
                          {loc.name}
                        </Typography>

                        <Typography sx={{ color: '#ccc', fontSize: 14 }}>
                          {loc.address}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 'bold',
            }}
            disabled={!selectedLocationId}
            onClick={handleNext}
          >
            Continuar
          </Button>
        </>
      )}
    </Box>
  );
}
