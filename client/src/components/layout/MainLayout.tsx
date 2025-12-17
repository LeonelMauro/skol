import { Container } from '@mui/material';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
       <Container sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
}
