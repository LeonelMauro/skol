import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';

export default function DashboardClient() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      label: 'Reservar turno',
      icon: <EventAvailableIcon sx={{ fontSize: 42 }} />,
      path: '/reservas',
    },
    {
      label: 'Mis reservas',
      icon: <HistoryIcon sx={{ fontSize: 42 }} />,
      path: '/mis-reservas',
    },
    {
      label: 'Mi perfil',
      icon: <PersonIcon sx={{ fontSize: 42 }} />,
      path: '/perfil',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        px: { xs: 2, md: 6 },
        pt: { xs: 10, md: 12 },
        textAlign: 'center',
      }}
    >
      {/* BIENVENIDA */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 1,
        }}
      >
        Hola {user?.name}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 5 }}>
        ¿Qué te gustaría hacer hoy?
      </Typography>

      {/* ACCIONES */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(auto-fit, minmax(160px, 1fr))',
            sm: 'repeat(auto-fit, minmax(200px, 1fr))',
            md: 'repeat(auto-fit, minmax(220px, 1fr))',
          },
          gap: { xs: 2, sm: 3 },
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        {actions.map((action) => (
          <Card
            sx={{
              backgroundColor: '#000',
              borderRadius: 2.5,
              height: { xs: 140, sm: 170, md: 190 },
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(219,213,21,0.25)',
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate(action.path)}
              sx={{ height: '100%' }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ color: '#DBD515', mb: 1.5,  fontSize: { xs: 32, sm: 38, md: 42 } }}>
                  {action.icon}
                </Box>

                <Typography
                  sx={{
                fontFamily: 'Keania One',
                color: '#fff',
                letterSpacing: 1,
                fontSize: { xs: 13, sm: 14, md: 15 },
              }}
                >
                  {action.label}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>


    </Box>
  );
}
