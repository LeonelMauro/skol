import { Box, Typography, Button, Card, CardActionArea, CardContent } from '@mui/material';
import hero1 from '../img/hero1.jpg';
import hero2 from '../img/hero2.jpg';
import nosotros from '../img/nosotros.jpg';


import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Location } from '../types/location';
import type { Service } from '../types/services';
import { serviceIcons } from '../utils/serviceIcons';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import IconButton from '@mui/material/IconButton';


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
            xs: '65vh',   // mobile
            sm: '75vh',   // tablets
            md: '90vh',   // desktop
          },

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
              sx={(theme) => ({
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
                textShadow: '0 2px 8px rgba(0,0,0,0.7)', // mobile default

                [theme.breakpoints.up('md')]: {
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
                },
              })}
            >
              SKOL
            </Typography>
            <Typography
              sx={(theme) => ({
                fontFamily: 'Keania One',
                fontSize: {
                  xs: '1.1rem',
                  sm: '1.6rem',
                  md: '2.2rem',
                },
                color: '#DBD515',
                letterSpacing: {
                  xs: '2px',
                  md: '4px',
                },
                textTransform: 'uppercase',
                mt: { xs: 0.5, md: -1 },
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',

                [theme.breakpoints.up('md')]: {
                  textShadow: 'none',
                },
              })}
            >
              SALÓN DE CABALLEROS
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
                '&:hover': {
                  backgroundColor: '#c4bd13',
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
        {/* TÍTULO */}
        <Typography
          variant="h2"
          textAlign="center"
          sx={{
            fontFamily: 'Kaushan Script',
            fontWeight: 700,          // 👈 negrita
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
          gridTemplateColumns: {
            xs: 'repeat(auto-fit, minmax(150px, 1fr))',
          sm: 'repeat(auto-fit, minmax(220px, 1fr))',
          md: 'repeat(auto-fit, minmax(260px, 1fr))',
          },
          gap: { xs: 1.5, sm: 3 },
         
        }}
      >
        {services.map((servicio) => {
              const IconComponent =
                serviceIcons[servicio.icon as keyof typeof serviceIcons];
        
              return (
                <Card
                  key={servicio.id}
                  sx={{
                    maxWidth: { xs: 260, sm: 300 },
                    borderRadius: 2,
                    backgroundColor: '#111',
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
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
                        fontSize: { xs: '1rem', sm: '1.15rem' },
                        letterSpacing: 1,
                      }}
                    >
                      {servicio.name}
                    </Typography>
        
                    <Typography variant="body2" sx={{
                        color: '#ccc',
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      }}>
                      {servicio.description}
                    </Typography>
                    
                  </CardContent>
                  
                
        
                </Card>
              );
            })}
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
            maxWidth: 360,
            px: { xs: 3, md: 10 },
            color: '#fff',
            justifySelf: 'center',
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
            variant="h2"
            textAlign="center"
            sx={{
            fontFamily: 'Kaushan Script, cursive',
            fontWeight: 700,          // 👈 negrita
            color: '#DBD515',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 4,
              px: { xs: 2, md: 8 },
              justifyItems: 'center',
              textAlign: 'center'
            }}
          >
            {locales.map((local) => (
              <Card
                key={local.id}
                sx={{
                  width: '100%',
                  maxWidth: { xs: 260, sm: 300, md: 320 },
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
                    height: { xs: 150, sm: 180 },
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
                    textAlign: 'center',
                  }}
                >
                  {/* NOMBRE */}
                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: '#DBD515',
                      letterSpacing: 1,
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    {local.name}
                  </Typography>

                  {/* DIRECCIÓN + ICONO */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      mt: 0.75,
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#ccc',
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        lineHeight: 2.4,
                      }}
                    >
                      {local.address}
                    </Typography>

                    <IconButton
                      size="small"
                      component="a"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local.address)}`}
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
                  </Box>
                </CardContent>

                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>


    </>
  );
}