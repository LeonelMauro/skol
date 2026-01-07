import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { access_token, payload } = response.data;

    login({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      location: payload.location,
      access_token,
    });

    // Redirección por rol
    if (payload.role === 'admin') {
      navigate('/admin');
    } else if (payload.role === 'barber') {
      navigate('/barber');
    } else {
      navigate('/client');
    }

  } catch {
    alert('Credenciales inválidas');
  } finally {
    setLoading(false);
  }
};


  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        display: 'flex',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 380,
          p: 4,
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: 3,
        }}
      >
        {/* TÍTULO */}
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
            letterSpacing: 2,
            mb: 3,
          }}
        >
          Ingresar
        </Typography>

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            autoComplete="email"
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { color: '#fff' },
            }}
          />

          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { color: '#fff' },
            }}
          />

          {/* BOTÓN LOGIN */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.3,
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#c4bd13',
              },
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Box>

        {/* REGISTRO */}
        <Typography
          textAlign="center"
          sx={{ mt: 3, fontSize: '0.9rem' }}
        >
          ¿No tenés cuenta?{' '}
          <Box
            component={RouterLink}
            to="/register"
            sx={{
              color: '#DBD515',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Registrate
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
