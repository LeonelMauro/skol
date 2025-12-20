import { Box, Typography, Button } from '@mui/material';
import hero1 from '../img/hero1.jpg';
import hero2 from '../img/hero2.jpg'
import nosotros from '../img/nosotros.jpg'
import { useEffect, useState } from 'react';

const heroImages = [
hero1,
hero2,
];
export default function HomePublic() {

    
 
    
      {/* HERO */}
      const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
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
            {/* SKOL */}
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

            {/* SUBTITLE */}
            <Typography
              sx={{
                fontFamily: 'Keania One',
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                color: '#DBD515',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                mt: -1,
                textShadow: `
                  -1.5px -1.5px 0 rgba(0,0,0,0.2),
                   1.5px -1.5px 0 rgba(0,0,0,0.2),

                  -3px -3px 0 rgba(0,0,0,1),
                   3px -3px 0 rgba(0,0,0,1),
                  -3px  3px 0 rgba(0,0,0,1),
                   3px  3px 0 rgba(0,0,0,1)
                `,
              }}
            >
              SALÓN DE CABALLEROS
            </Typography>

            {/* CTA */}
            <Button
              variant="contained"
              sx={{
                mt: 5,
                px: 5,
                backgroundColor: '#DBD515',
                color: '#000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#c4bd13',
                },
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
      sx={{
        py: 8,
        backgroundColor: '#0F0F0F',
    position: 'relative',
    height: '90vh',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    overflow: 'hidden',
  }}>
    <Typography
        variant="h4"
        textAlign="center"
        sx={{ fontFamily: 'Keania One',color: '#fff', mb: 6 }}
    >
        Servicios
    </Typography>

    <Box
        sx={{
          
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 4,
        px: { xs: 2, md: 10 },
        }}
    >
        <ServiceCard
        title="Corte de cabello"
        description="Clásico o moderno, a tu estilo"
        />
        <ServiceCard
        title="Barba"
        description="Perfilado y afeitado profesional"
        />
        <ServiceCard
        title="Tratamientos"
        description="Cuidado capilar y facial"
        />
    </Box>
    </Box>
    {/* SOBRE SKOL */}
<Box
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
  {/* BACKGROUND IMAGE */}
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

  {/* CONTENT */}
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

    <Typography
      sx={{
        lineHeight: 1.8,
        fontSize: '1.05rem',
        color: '#E0E0E0',
      }}
    >
      En SKOL combinamos la tradición de la barbería clásica con técnicas
      modernas. Nuestro objetivo es que cada cliente viva una experiencia
      única, cómoda y profesional.
    </Typography>
  </Box>
</Box>


        </>
    );
    }

function ServiceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        backgroundColor: '#1A1A1A',
        p: 4,
        borderRadius: 2,
        textAlign: 'center',
        color: '#fff',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        },
      }}
    >
      <Typography variant="h6" sx={{fontFamily: 'Keania One', color: '#C9A24D', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
    </Box>
  );
}


