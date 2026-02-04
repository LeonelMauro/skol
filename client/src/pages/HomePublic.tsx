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
          El mejor desempeño
        </Typography>
      </Box>


        {/* GRID ORDENADO */}
        <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 4 },
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
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      backgroundColor: '#111',
                      border: '1px solid #333',
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
                      flexGrow: 1,
                    }}
                  >

                    {/* ÍCONO */}
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


          {/* GRID ORDENADO */}
          <Box
          sx={{
            maxWidth: 1050,
            mx: 'auto',
            px: { xs: 2, md: 4 },
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(auto-fit, 170px)',
              sm: 'repeat(auto-fit, 200px)',
              md: 'repeat(auto-fit, 225px)',
            },
            justifyContent: 'center',   // centra la grilla
            gap: { xs: 1.75, sm: 3 },
          }}
        >


            {locales.map((local) => (
              <Card
              sx={{
                borderRadius: 2,
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                cursor: 'pointer',

                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(219,213,21,0.15)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.55)',
                },
              }}
            >

              
                <CardActionArea href="/login" sx={{ height: '100%' }}>
                  {/* IMAGEN */}
                  <Box
                  sx={{
                    height: 110, // antes 100
                    backgroundImage: `url(${local.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />




                  {/* CONTENIDO */}
                  <CardContent
                  sx={{
                    textAlign: 'center',
                    py: { xs: 1.25, sm: 1.75 }, // antes 1 / 1.5
                    px: { xs: 1.25, sm: 1.75 },
                  }}
                >

           
                  {/* NOMBRE */}
                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: '#DBD515',
                      fontSize: { xs: 12, sm: 18 },
                      lineHeight: 1.2,
                      mb: 0.25,
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
                    gap: 0.4,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#bbb',
                      fontSize: { xs: 10.5, sm: 14 },
                      lineHeight: 1.25,
                    }}
                  >
                    {local.address}
                  </Typography>

                  <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local.address)}`,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                  sx={{
                    color: 'rgba(219,213,21,0.5)',
                    p: 0.25,
                    '&:hover': {
                      color: 'rgba(219,213,21,0.85)',
                    },
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 20 }} />
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