import {
  AppBar,
  Toolbar,
  Button,
  ButtonBase,
  Box,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

import icono from '../../img/icono.png';

export default function Header() {
   const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={4}
      sx={{
        backgroundColor: '#000',
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        {/* IZQUIERDA – LOGO */}
        <Box sx={{ flex: 1 }}>
          <ButtonBase component={RouterLink} to="/">
            <Box
              component="img"
              src={icono}
              alt="SKOL"
              sx={{ height: 44 }}
            />
          </ButtonBase>
        </Box>

        {/* CENTRO – MENÚ */}
        <Box
          sx={{
            
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {['Servicios', 'Nosotros', 'Tienda', 'Reservas'].map((item) => (
            <Button
              key={item}
              sx={{
                fontFamily: 'Keania One',
                color: '#fff',
                fontWeight: 500,
                letterSpacing: 1,
                '&:hover': {
                  color: '#DBD515',
                },
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* DERECHA – ICONOS */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          {/* REDES */}
          <IconButton
            href="https://facebook.com"
            target="_blank"
            sx={{ color: '#DBD515' }}
          >
            <FacebookIcon />
          </IconButton>

          <IconButton
            href="https://instagram.com"
            target="_blank"
            sx={{ color: '#DBD515' }}
          >
            <InstagramIcon />
          </IconButton>

          {/* USER */}
          {!user ? (
            <IconButton
              component={RouterLink}
              to="/login"
              sx={{ color: '#DBD515' }}
            >
              <PersonOutlineIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={logout}
              sx={{ color: '#DBD515' }}
            >
              <PersonOutlineIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
