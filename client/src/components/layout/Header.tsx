import {
  AppBar,
  Toolbar,
  Button,
  ButtonBase,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

import icono from '../../img/icono.png';

const publicMenu = [
  { label: 'Servicios', link: '#servicios' },
  { label: 'Nosotros', link: '#nosotros' },
  { label: 'Locales', link: '#locales' },
  { label: 'Tienda', link: '/tienda' },
];

const menuByRole = {
  client: [
    { label: 'Reservar', link: '/reservas' },
    { label: 'Mis reservas', link: '/mis-reservas' },
    { label: 'Perfil', link: '/perfil' },
  ],
  barber: [
    { label: 'Agenda', link: '/agenda' },
    { label: 'Turnos', link: '/turnos' },
    { label: 'Perfil', link: '/perfil' },
  ],
  admin: [
    { label: 'Usuarios', link: '/admin/users' },
    { label: 'Locales', link: '/admin/locales' },
    { label: 'Barbers', link: '/admin/barbers' },
    { label: 'Servicios', link: '/admin/services' },
    { label: 'Reportes', link: '/admin/reportes' },
  ],
};

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const isHome = location.pathname === '/';
  const roleMenu = user ? menuByRole[user.role] || [] : [];

  const getHomeLink = () => {
  if (!user) return '/';

  switch (user.role) {
    case 'client':
      return '/client';
    case 'barber':
      return '/barber';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
};


  const renderButton = (label: string, link: string, onClick?: () => void) => (
    <Button
      key={label}
      component={link.startsWith('#') ? 'a' : RouterLink}
      href={link.startsWith('#') ? (isHome ? link : `/${link}`) : undefined}
      to={!link.startsWith('#') ? link : undefined}
      onClick={onClick}
      sx={{
        fontFamily: 'Keania One',
        color: '#fff',
        letterSpacing: 1,
        '&:hover': { color: '#DBD515' },
      }}
    >
      {label}
    </Button>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#000' }}>
        <Toolbar sx={{ minHeight: 72 }}>
          {/* LOGO */}
          <Box sx={{ flex: 1 }}>
            <ButtonBase component={RouterLink} to={getHomeLink()}>
              <Box component="img" src={icono} alt="SKOL" sx={{ height: 44 }} />
            </ButtonBase>
          </Box>

          {/* MENÚ DESKTOP */}
          {!isMobile && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {!user &&
                publicMenu.map((item) =>
                  renderButton(item.label, item.link)
                )}

              {user &&
                roleMenu.map((item) =>
                  renderButton(item.label, item.link)
                )}
            </Box>
          )}

          {/* DERECHA */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {!isMobile && (
              <>
                <IconButton sx={{ color: '#DBD515' }}><FacebookIcon /></IconButton>
                <IconButton sx={{ color: '#DBD515' }}><InstagramIcon /></IconButton>

                {!user ? (
                  <IconButton component={RouterLink} to="/login" sx={{ color: '#DBD515' }}>
                    <PersonOutlineIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={logout} sx={{ color: '#DBD515' }}>
                    <LogoutIcon />
                  </IconButton>
                )}
              </>
            )}

            {isMobile && (
              <IconButton onClick={() => setOpen(true)} sx={{ color: '#DBD515' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWER MOBILE */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, height: '100%', backgroundColor: '#000', color: '#fff' }}>
          <List>
            {!user &&
              publicMenu.map((item) => (
                <ListItemButton
                  key={item.label}
                  component="a"
                  href={isHome ? item.link : `/${item.link}`}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontFamily: 'Keania One' }}
                  />
                </ListItemButton>
              ))}

            {user &&
              roleMenu.map((item) => (
                <ListItemButton
                  key={item.label}
                  component={RouterLink}
                  to={item.link}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontFamily: 'Keania One' }}
                  />
                </ListItemButton>
              ))}
          </List>

          <Divider sx={{ backgroundColor: '#333' }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            {!user ? (
              <IconButton component={RouterLink} to="/login" sx={{ color: '#DBD515' }}>
                <PersonOutlineIcon />
              </IconButton>
            ) : (
              <IconButton onClick={logout} sx={{ color: '#DBD515' }}>
                <LogoutIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
