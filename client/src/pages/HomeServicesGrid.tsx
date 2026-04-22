import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

interface Service {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

interface Props {
  services: Service[];
  serviceIcons: Record<string, any>;
}

export default function ServicesGrid({ services, serviceIcons }: Props) {
  if (!services || services.length === 0) {
    return null; // o un loader si querés
  }
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 👇 MISMO observer que locales
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));

          if (entry.isIntersecting) {
            setVisibleCards((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [services]);

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 } }}>
        <Typography
          sx={{
            fontFamily: 'Playfair Display, serif',
            fontSize: { xs: 28, sm: 32, md: 36 },
            color: '#DBD515',
          }}
        >
          Servicios
        </Typography>

        <Typography sx={{ color: '#aaa' }}>
          El mejor desempeño
        </Typography>
      </Box>

      {/* GRID */}
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
          gap: 3,
        }}
      >
        {services.map((servicio, index) => {
          const IconComponent =
            serviceIcons[servicio.icon as keyof typeof serviceIcons];

          const isVisible = visibleCards.includes(index);
          const fromLeft = index % 2 === 0;

          return (
            <Card
              key={servicio.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              sx={{
                borderRadius: 3,
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.06)',

                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateX(0)'
                  : fromLeft
                  ? 'translateX(-80px)'
                  : 'translateX(80px)',

                transition: 'all 0.8s ease',

                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {IconComponent && (
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      mx: 'auto',
                    }}
                  >
                    <IconComponent width={24} height={24} />
                  </Box>
                )}

                <Typography
                  sx={{
                    fontFamily: 'Keania One',
                    color: '#DBD515',
                  }}
                >
                  {servicio.name}
                </Typography>

                <Typography sx={{ color: '#ccc', fontSize: 13 }}>
                  {servicio.description}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}