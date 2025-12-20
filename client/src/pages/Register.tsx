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

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
  });

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/user/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        birthDate: form.birthDate,
        
      });

      login(response.data);
      navigate('/dashboard');
    } catch {
      alert('Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: 3,
        }}
      >
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
          Crear cuenta
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nombre completo"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Teléfono"
            name="phone"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={handleChange}
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            fullWidth
            margin="normal"
            value={form.birthDate}
            onChange={handleChange}
            required
            InputLabelProps={{
              shrink: true,
              style: { color: '#aaa' },
            }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
          />

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
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </Box>

        <Typography textAlign="center" sx={{ mt: 3, fontSize: '0.9rem' }}>
          ¿Ya tenés cuenta?{' '}
          <Box
            component={RouterLink}
            to="/login"
            sx={{
              color: '#DBD515',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Ingresar
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
