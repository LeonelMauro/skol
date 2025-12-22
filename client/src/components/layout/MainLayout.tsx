import { Container, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Rutas full-screen (NO deben tener spacer ni Container)
  const noSpacingRoutes = ['/', '/login', '/register'];

  const hasSpacing = !noSpacingRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <Header />

      {/* Spacer SOLO para páginas internas */}
      {hasSpacing && <Toolbar />}

      {hasSpacing ? (
        <Container sx={{ mt: 4 }}>
          {children}
        </Container>
      ) : (
        children
      )}
    </>
  );
}
