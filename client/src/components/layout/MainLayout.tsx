import { Toolbar } from '@mui/material';
import Header from './Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <>
    <Header />
    <Toolbar /> {/* SIEMPRE presente */}
    {children}
  </>
);
}
