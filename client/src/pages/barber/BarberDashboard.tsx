import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ContentCutIcon from '@mui/icons-material/ContentCut';


export default function DashboardBarber() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      label: 'Agenda',
      icon: <EventNoteIcon />,
      path: '/agenda',
    },
    {
      label: 'Turnos de hoy',
      icon: <TodayIcon />,
      path: '/turnos',
    },
    {
      label: 'Mi perfil',
      icon: <PersonIcon />,
      path: '/perfil',
    },
    {
    label: 'Historial',
    icon: <HistoryIcon />,
    path: '/metricas',
  },
  {
    label: 'Servicios',
    icon: <ContentCutIcon />,
    path: '/servicios',
  },
  ];
  const avatarUrl =
  user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}?t=${Date.now()}`
    : undefined;
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={user?.name}
          sx={{
            width: { xs: 90, sm: 110, md: 120 },
            height: { xs: 90, sm: 110, md: 120 },
            border: '3px solid #DBD515',
          }}
        />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 1,
        }}
      >
        Panel de Barbería
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 5 }}>
        Bienvenido {user?.name}
      </Typography>

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
            key={action.label}
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
                <Box
                  sx={{
                    color: '#DBD515',
                    mb: 1.5,
                    fontSize: { xs: 32, sm: 38, md: 42 },
                  }}
                >
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
