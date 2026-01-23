import { Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  const noSpacingRoutes = ['/', '/login', '/register'];
  const hasSpacing = !noSpacingRoutes.includes(location.pathname);

  return (
    <>
      <Header />

      {/* Spacer exacto al Header */}
      {hasSpacing && <Toolbar sx={{ minHeight: 72 }} />}

      {children}
    </>
  );
}
