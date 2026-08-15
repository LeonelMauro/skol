import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card } from '@mui/material';
import nosotros from '../img/nosotros.jpg';

const virtudes = [
  {
    titulo: 'Experiencia',
    descripcion: 'Barberos con años de trayectoria y técnicas modernas.',
  },
  {
    titulo: 'Calidad',
    descripcion: 'Productos premium para el cuidado del cabello y barba.',
  },
  {
    titulo: 'Estilo',
    descripcion: 'Asesoramiento personalizado para potenciar tu imagen.',
  },
];

export default function SobreSkol() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 👇 animación al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      id="nosotros"
      sx={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
        py: 10,
      }}
    >
      {/* Fondo */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)),
            url(${nosotros})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        }}
      />

      {/* Contenido */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1200,
          mx: 'auto',
          px: 3,
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {/* TEXTO */}
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
          Sobre SKOL
        </Typography>

        <Typography
          sx={{
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.8,
            color: '#E0E0E0',
          }}
        >
          En SKOL combinamos la tradición de la barbería clásica con técnicas modernas.
        </Typography>

        {/* CARDS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {virtudes.map((item, index) => {
            const isVisible = visibleCards.includes(index);

            return (
              <Card
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-index={index}
                sx={{
                  height: {
                    xs: 'auto',   // 🔥 mobile crece solo
                    sm: 220,
                    md: 240,
                  },
                  py: { xs: 3, md: 0 }, // padding vertical en mobile
                  backgroundColor: '#111',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 2,
                  textAlign: 'center',

                  // 👇 animación
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? 'translateY(0)'
                    : 'translateY(40px)',

                  transition: 'all 0.7s ease',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    border: '1px solid #DBD515',
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: '#DBD515',
                      mb: 1,
                      fontSize: 20,
                    }}
                  >
                    {item.titulo}
                  </Typography>

                  <Typography sx={{ color: '#bbb', fontSize: 14 }}>
                    {item.descripcion}
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}