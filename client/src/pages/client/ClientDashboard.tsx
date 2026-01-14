import {
  Box,
  Typography,
  Grid,
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
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        px: { xs: 2, md: 6 },
        pt: { xs: 10, md: 12 }, // espacio para AppBar fixed
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
         Hola {user?.email.split('@')[0]}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 5 }}>
        ¿Qué te gustaría hacer hoy?
      </Typography>

      {/* ACCIONES */}
      <Grid container spacing={3}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.label}>
            <Card
              sx={{
                backgroundColor: '#000',
                borderRadius: 3,
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 10px 30px rgba(219,213,21,0.25)',
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(action.path)}
                sx={{ py: 5 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: '#DBD515', mb: 2 }}>
                    {action.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: '#fff',
                      letterSpacing: 1,
                    }}
                  >
                    {action.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
