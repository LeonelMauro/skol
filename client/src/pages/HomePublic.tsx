import { Box, Typography, Button, Card, CardActionArea, CardContent } from '@mui/material';
import hero1 from '../img/hero1.jpg';
import hero2 from '../img/hero2.jpg';
import nosotros from '../img/nosotros.jpg';


import { useEffect, useState } from 'react';
import api from '../services/api';

const heroImages = [hero1, hero2];

export interface Service {
  id: number;
  name: string;
  description: string;
  price?: number;
}
export interface Location {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
}

export default function HomePublic() {
  const [services, setServices] = useState<Service[]>([]);

  const [locales, setLocales] = useState<Location[]>([]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get<Service[]>('/services');
        setServices(data);
      } catch (error) {
        console.error('Error al cargar servicios', error);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const fetchLocales = async () => {
    try {
      const { data } = await api.get<Location[]>('/location');
      setLocales(data);
    } catch (error) {
      console.error('Error al cargar locales', error);
    }
  };

  fetchLocales();
}, []);


  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          height: '90vh',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          overflow: 'hidden',
        }}
      >
        {/* BACKGROUND IMAGES */}
        {heroImages.map((img, index) => (
          <Box
            key={img}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)),
                url(${img})
              `,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 1.2s ease-in-out',
              opacity: index === current ? 1 : 0,
              zIndex: 1,
            }}
          />
        ))}

        {/* CONTENT */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Keania One"',
                fontSize: { xs: '4.5rem', md: '6.5rem' },
                color: '#DBD515',
                letterSpacing: '6px',
                textTransform: 'uppercase',
                textShadow: `
                  -2px -2px 0 rgba(0,0,0,0.2),
                   2px -2px 0 rgba(0,0,0,0.2),
                  -2px  2px 0 rgba(0,0,0,0.2),
                   2px  2px 0 rgba(0,0,0,0.2),

                  -4px -4px 0 rgba(0,0,0,0.2),
                   4px -4px 0 rgba(0,0,0,0.2),
                  -4px  4px 0 rgba(0,0,0,0.2),
                   4px  4px 0 rgba(0,0,0,0.2),

                  -6px -6px 0 rgba(0,0,0,1),
                   6px -6px 0 rgba(0,0,0,1),
                  -6px  6px 0 rgba(0,0,0,1),
                   6px  6px 0 rgba(0,0,0,1)
                `,
              }}
            >
              SKOL
            </Typography>

            <Typography
              sx={{
                fontFamily: 'Keania One',
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                color: '#DBD515',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                mt: -1,
              }}
            >
              SALÓN DE CABALLEROS
            </Typography>

            <Button
              variant="contained"
              sx={{
                mt: 5,
                px: 5,
                backgroundColor: '#DBD515',
                color: '#000',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#c4bd13' },
              }}
              href="/login"
            >
              Reservar turno
            </Button>
          </Box>
        </Box>
      </Box>

      {/* SERVICIOS */}
      <Box
      id="servicios"
        sx={{
          py: 10,
          backgroundColor: '#0F0F0F',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
        }}
      >
        {/* TÍTULO */}
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
            letterSpacing: 2,
            mb: 6,
          }}
        >
          Servicios
        </Typography>

        {/* GRID ORDENADO */}
        <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
          px: { xs: 2, md: 10 },
        }}
      >
        {services.map((service) => (
          <Card
            key={service.id}
            sx={{
              backgroundColor: '#1A1A1A',
              borderRadius: 2.5,
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 30px rgba(219,213,21,0.35)',
              },
            }}
          >
            <CardActionArea
              onClick={() => window.location.href = '/login'}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Keania One',
                    color: '#DBD515',
                    letterSpacing: 1,
                    mb: 1,
                  }}
                >
                  {service.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#ccc' }}
                >
                  {service.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

        </Box>

      {/* SOBRE SKOL */}
      <Box
      id="nosotros"
        sx={{
          position: 'relative',
          height: '80vh',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
              url(${nosotros})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 700,
            px: { xs: 3, md: 10 },
            color: '#fff',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: 'Keania One',
              letterSpacing: 2,
              color: '#DBD515',
              textTransform: 'uppercase',
            }}
          >
            Sobre SKOL
          </Typography>

          <Typography sx={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#E0E0E0' }}>
            En SKOL combinamos la tradición de la barbería clásica con técnicas modernas.
          </Typography>
        </Box>
      </Box>

      {/* LOCALES */}
      <Box
       id="locales"
          sx={{
            py: 10,
            backgroundColor: '#0F0F0F',
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
          }}
        >
          {/* TÍTULO */}
          <Typography
            variant="h4"
            textAlign="center"
            sx={{
              color: '#DBD515',
              fontFamily: 'Keania One',
              letterSpacing: 2,
              mb: 6,
            }}
          >
            Nuestros Locales
          </Typography>

          {/* GRID ORDENADO */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
              px: { xs: 2, md: 8 },
              justifyItems: 'center',
            }}
          >
            {locales.map((local) => (
              <Card
                key={local.id}
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  backgroundColor: '#111',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                  transition: '0.35s ease',
                  cursor: 'pointer',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 45px rgba(219,213,21,0.35)',
                  },
                }}
              >
                <CardActionArea
                  
                  sx={{ position: 'relative' }}
                  href="/login"
                >
                  {/* IMAGEN */}
                  <Box
                    sx={{
                      height: 180,
                      backgroundImage: `url(${local.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* OVERLAY DORADO HOVER */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(rgba(219,213,21,0.25), rgba(0,0,0,0.7))',
                      opacity: 0,
                      transition: '0.35s',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  />

                  {/* CONTENIDO */}
                  <CardContent
                    sx={{
                      position: 'relative',
                      backgroundColor: '#0F0F0F',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: 'Keania One',
                        color: '#DBD515',
                        letterSpacing: 1,
                      }}
                    >
                      {local.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ccc',
                        mt: 0.5,
                      }}
                    >
                      {local.address}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>


    </>
  );
}




