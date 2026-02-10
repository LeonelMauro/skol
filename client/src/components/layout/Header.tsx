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
    { label: 'Historial', link: '/metricas' },
    { label: 'Servicios', link: '/servicios' },

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
  const roleMenu = user && menuByRole[user.role]
  ? menuByRole[user.role]
  : [];


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
      fontFamily: 'Inter, sans-serif',
      fontSize: 11,
      fontWeight: 700,          // ✅ negrita
      letterSpacing: '0.06em',
      color: '#EAEAEA',
      px: 1,
      minWidth: 'auto',
      position: 'relative',
      backgroundColor: 'transparent',

      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -6,
        left: 0,
        width: '0%',
        height: '2px',
        backgroundColor: '#DBD515',
        transition: 'width 0.3s ease',
      },

      '&:hover': {
        backgroundColor: 'transparent',
        color: '#DBD515',
        '&::after': {
          width: '100%',
        },
      },
    }}
  >
    {label.toLowerCase()}
  </Button>
);

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/skolmza/?locale=es_LA',
  instagram: 'https://www.instagram.com/skol.barberia/?hl=es-la',
};

const socialIconStyles = {
  color: '#575757ff',
  transition: 'color 0.25s ease, transform 0.25s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
};

const facebookHover = {
  '&:hover': {
    color: '#1877F2', // Facebook blue
  },
};

const instagramHover = {
  '&:hover': {
    color: '#E1306C', // Instagram pink
  },
};



  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(10px)',
        }}

      >
        <Toolbar
          sx={{
            minHeight: 60,
            px: { xs: 2, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >

          {/* LOGO */}
          <ButtonBase
            component={RouterLink}
            to={getHomeLink()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src={icono}
              alt="Logo"
              sx={{
                height: 50,
                display: 'block',
              }}
            />
          </ButtonBase>



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
                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ...socialIconStyles, ...facebookHover }}
                >
                  <FacebookIcon />
                </IconButton>

                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ...socialIconStyles, ...instagramHover }}
                >
                  <InstagramIcon />
                </IconButton>



                {!user ? (
                  <IconButton component={RouterLink} to="/login" sx={{ color: '#747171ff' }}>
                    <PersonOutlineIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={logout} sx={{ color: '#575757ff' }}>
                    <LogoutIcon />
                  </IconButton>
                )}
              </>
            )}

            {isMobile &&(
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2, // cuadrado redondeado
                border: '1px solid rgba(202, 202, 197, 0.4)',
                color: '#575757ff',
                backgroundColor: 'rgba(170, 170, 170, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(240, 240, 240, 0.15)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWER MOBILE */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            height: '100%',
            backgroundColor: '#0B0B0B',
            borderRadius: '16px 0 0 16px',
          },
        }}
      >
        {user && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 2,
              borderBottom: '1px solid #222',
            }}
          >
            {/* Redes */}
            <Box>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialIconStyles, ...facebookHover }}
              >
                <FacebookIcon />
              </IconButton>

              <IconButton
                component="a"
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialIconStyles, ...instagramHover }}
              >
                <InstagramIcon />
              </IconButton>


            </Box>

            {/* Dashboard */}
            <IconButton
              component={RouterLink}
              to={getHomeLink()}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                border: '1px solid rgba(248, 248, 245, 0.4)',
                color: '#ebebebff',
              }}
            >
              <PersonOutlineIcon />
            </IconButton>
          </Box>
        )}


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
                    primaryTypographyProps={{
                      fontSize: 13,
                      letterSpacing: '0.15em',
                      fontWeight: 500,
                    }}
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
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(219,213,21,0.08)',
                    },
                  }}
                >

                  <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,     // 🔥 igual al header
                    letterSpacing: '0.04em',
                    color: '#EAEAEA',
                  }}
                />

                </ListItemButton>
              ))}
          </List>

          <Divider sx={{ backgroundColor: '#333' }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            {!user ? (
              <Box>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialIconStyles, ...facebookHover }}
              >
                <FacebookIcon />
              </IconButton>

              <IconButton
                component="a"
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialIconStyles, ...instagramHover }}
              >
                <InstagramIcon />
              </IconButton>


              <IconButton component={RouterLink} to="/login" sx={{ color: '#575757ff' }}>
                <PersonOutlineIcon />
              </IconButton>
              </Box>
            ) : (
              <IconButton onClick={logout} sx={{ color: '#575757ff' }}>
                <LogoutIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
