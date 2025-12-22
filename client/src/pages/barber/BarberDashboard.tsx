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

import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';

export default function DashboardBarber() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      label: 'Agenda',
      icon: <EventNoteIcon sx={{ fontSize: 42 }} />,
      path: '/agenda',
    },
    {
      label: 'Turnos de hoy',
      icon: <TodayIcon sx={{ fontSize: 42 }} />,
      path: '/turnos',
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
        pt: { xs: 10, md: 12 }, // espacio AppBar fixed
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
        Panel de Barbería
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 5 }}>
        Bienvenido {user?.email}
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
