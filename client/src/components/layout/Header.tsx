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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

import icono from '../../img/icono.png';

const menuItems = ['Servicios', 'Nosotros', 'Tienda', 'Reservas'];

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <AppBar
        position="fixed"
        elevation={4}
        sx={{ backgroundColor: '#000' }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          {/* LOGO */}
          <Box sx={{ flex: 1 }}>
            <ButtonBase component={RouterLink} to="/">
              <Box component="img" src={icono} alt="SKOL" sx={{ height: 44 }} />
            </ButtonBase>
          </Box>

          {/* MENÚ DESKTOP */}
          {!isMobile && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item}
                  sx={{
                    fontFamily: 'Keania One',
                    color: '#fff',
                    letterSpacing: 1,
                    '&:hover': { color: '#DBD515' },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          )}

          {/* DERECHA */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {!isMobile && (
              <>
                <IconButton sx={{ color: '#DBD515' }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ color: '#DBD515' }}>
                  <InstagramIcon />
                </IconButton>

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
              </>
            )}

            {/* HAMBURGUESA MOBILE */}
            {isMobile && (
              <IconButton
                onClick={() => setOpen(true)}
                sx={{ color: '#DBD515' }}
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
      >
        <Box
          sx={{
            width: 260,
            height: '100%',
            backgroundColor: '#000',
            color: '#fff',
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item}
                onClick={() => setOpen(false)}
              >
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontFamily: 'Keania One',
                    letterSpacing: 1,
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ backgroundColor: '#333' }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 2 }}>
            <IconButton sx={{ color: '#DBD515' }}>
              <FacebookIcon />
            </IconButton>
            <IconButton sx={{ color: '#DBD515' }}>
              <InstagramIcon />
            </IconButton>

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
        </Box>
      </Drawer>
    </>
  );
}
