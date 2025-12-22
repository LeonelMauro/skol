import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import PeopleIcon from '@mui/icons-material/People';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import StoreIcon from '@mui/icons-material/Store';
import BuildIcon from '@mui/icons-material/Build';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const actions = [
    {
      label: 'Usuarios',
      icon: <PeopleIcon sx={{ fontSize: 44 }} />,
      path: '/admin/users',
    },
    {
      label: 'Barbers',
      icon: <ContentCutIcon sx={{ fontSize: 44 }} />,
      path: '/admin/barbers',
    },
    {
      label: 'Servicios',
      icon: <BuildIcon sx={{ fontSize: 44 }} />,
      path: '/admin/services',
    },
    {
      label: 'Locales',
      icon: <StoreIcon sx={{ fontSize: 44 }} />,
      path: '/admin/locales',
    },
    {
      label: 'Reservas',
      icon: <EventAvailableIcon sx={{ fontSize: 44 }} />,
      path: '/admin/reservas',
    },
    {
      label: 'Reportes',
      icon: <BarChartIcon sx={{ fontSize: 44 }} />,
      path: '/admin/reportes',
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
        pt: { xs: 10, md: 12 }, // AppBar fixed
      }}
    >
      {/* TÍTULO */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 1,
        }}
      >
        Panel de Administración
        Hola {user?.email}
      </Typography>

      <Typography sx={{ color: '#ccc', mb: 5 }}>
        Gestión general del sistema
      </Typography>

      {/* GRID */}
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
