import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      login(response.data); // ← SOLO UN ARGUMENTO
      navigate('/dashboard');
    } catch {
      alert('Credenciales inválidas');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4">Login</Typography>

      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Button type="submit" variant="contained">
        Ingresar
      </Button>
    </Box>
  );
}
