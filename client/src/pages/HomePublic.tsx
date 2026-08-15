import { Box, Typography, Button, } from '@mui/material';
import hero1 from '../img/hero1.jpg';
import hero2 from '../img/hero2.jpg';


import { useEffect,  useState } from 'react';
import api from '../services/api';
import type { Location } from '../types/location';
import type { Service } from '../types/services';
import { serviceIcons } from '../utils/serviceIcons';
import HomeLocations from './HomeLocations';
import SobreSkol from './HomeSkol';
import ServicesGrid from './HomeServicesGrid';


const heroImages = [hero1, hero2];



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
    height: {
      xs: '65vh',
      sm: '75vh',
      md: '90vh',
    },
    width: '100%',
    overflow: 'hidden',
    mt: '-60px', // 🔥 clave
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
                linear-gradient(
                  rgba(0,0,0,0.55),
                  rgba(0,0,0,0.65)
                ),
                url(${img})
              `,

              backgroundSize: 'cover',
              backgroundPosition: {
                xs: 'center top',
                md: 'center',
              },

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
                fontSize: {
                  xs: '3.2rem',
                  sm: '4.5rem',
                  md: '6.5rem',
                },
                color: '#DBD515',
                letterSpacing: {
                  xs: '2px',
                  sm: '4px',
                  md: '6px',
                },
                textTransform: 'uppercase',
                lineHeight: 1,
               textShadow: `
                  -2px -2px 0 rgba(0,0,0,0.2),
                  2px -2px 0 rgba(0,0,0,0.2),
                  -2px  2px 0 rgba(0,0,0,0.2),
                  2px  2px 0 rgba(0,0,0,0.2),
                  -6px -6px 0 rgba(0,0,0,1),
                  6px -6px 0 rgba(0,0,0,1),
                  -6px  6px 0 rgba(0,0,0,1),
                  6px  6px 0 rgba(0,0,0,1)
                `,
                              }}
                            >
              SKOL
            </Typography>
            <Button
              variant="contained"
              href="/login"
              sx={{
                mt: { xs: 3, md: 5 },
                px: { xs: 3, md: 5 },
                py: { xs: 1, md: 1.4 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                backgroundColor: '#DBD515',
                color: '#000',
                fontWeight: 700,
                borderRadius: 2,

                animation: 'pulse 1.6s infinite',

                '@keyframes pulse': {
                  '0%': {
                    backgroundColor: '#8a860fff', // apagado (más oscuro)
                    boxShadow: '0 0 0 0 rgba(59, 58, 6, 0)',
                  },
                  '50%': {
                    backgroundColor: '#DBD515', // encendido
                    boxShadow: '0 0 12px 4px rgba(219,213,21,0.6)',
                  },
                  '100%': {
                    backgroundColor: '#8a860fff', // vuelve a apagado
                    boxShadow: '0 0 0 0 rgba(59, 58, 6, 0)',
                  },
                },

                '&:hover': {
                  backgroundColor: '#c4bd13',
                  animation: 'none',
                },
              }}
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
       
        
          <ServicesGrid services={services} serviceIcons={serviceIcons} />
        </Box>
        
      {/* SOBRE SKOL */}
      <SobreSkol />
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
  <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
    <Typography
      variant="h3"
          sx={{
            mb: 2,
            fontFamily: 'Keania One',
             fontSize: {
              xs: '2rem',
              md: '3rem',
            },
            letterSpacing: 2,
            color: '#DBD515',
            
          }}
    >
      Nuestros locales
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
      Elegí el local más cercano para reservar tu turno
    </Typography>
  </Box>

  {/* 👇 COMPONENTE */}
  <HomeLocations locales={locales} />
</Box>    


    </>
  );
}