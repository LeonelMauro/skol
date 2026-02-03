import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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
      name: payload.name,
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
      console.log(login)
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
        width: '100%',
        justifyContent: 'center',
        alignItems: { xs: 'flex-start', sm: 'center' },
        pt: { xs: '88px', sm: '104px' },
        px: { xs: 2, sm: 0 },
      }}
    >


      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: { xs: 320, sm: 380 },
          p: { xs: 2.5, sm: 4 },
          backgroundColor: '#000',
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
            mb: 2.5,
            fontSize: { xs: '1.7rem', sm: '2.1rem' },
          }}
        >
          Ingresar
        </Typography>

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            size="small"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { color: '#fff' },
            }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { color: '#fff' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: '#aaa' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />


          {/* BOTÓN LOGIN */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: { xs: 1.1, sm: 1.3 },
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
          sx={{ mt: 3, fontSize: '0.9rem' ,color: '#ffffffff',}}
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
