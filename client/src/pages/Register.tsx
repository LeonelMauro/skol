import { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { MenuItem, Select } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Location } from '../types/location';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type RegisterMode = 'public' | 'admin-barber';
interface RegisterProps {
  mode?: RegisterMode;
  onSuccess?: () => void; 
}

export default function Register({ mode = 'public' , onSuccess}: RegisterProps) {
  const {user}= useAuth();
  const authHeader = { Authorization : `Bearer ${user?.access_token}`}
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    locationId: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const phoneRegex = /^\d{3}-\d{7}$/;
  
    const validatePhone = (phone: string) => {
      if (!phone) return true;
      return phoneRegex.test(phone);
    };
  
    const validateBirthDate = (date: string) => {
      if (!date) return true;
  
      const d = new Date(date);
  
      if (isNaN(d.getTime())) return false;
  
      const today = new Date();
  
      if (d > today) return false;
  
      const minYear = 1900;
  
      if (d.getFullYear() < minYear) return false;
  
      return true;
    };
    
    const [errors, setErrors] = useState({
      phone: "",
      birthDate: "",
    });
    
   const formatPhone = (value: string) => {
      const numbers = value.replace(/\D/g, "").slice(0, 10);

      if (numbers.length <= 3) return numbers;

      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    };
    
    const handleSave = () => {
  let valid = true;

  const newErrors = {
    phone: "",
    birthDate: "",
  };

  if (!validatePhone(form.phone)) {
    newErrors.phone = "Formato inválido. Ej: 261-2158833";
    valid = false;
  }

  if (!validateBirthDate(form.birthDate)) {
    newErrors.birthDate = "Fecha inválida";
    valid = false;
  }

  setErrors(newErrors);

  return valid;
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!handleSave()) return;

  if (form.password !== form.confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  setLoading(true);

  try {
    if (mode === 'admin-barber') {

      await api.post(
        '/user/create-barbers',
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          birthDate: form.birthDate,
          locationId: Number(form.locationId),
        },
        { headers: authHeader }
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/barbers');
      }

    } else {

      await api.post('/user/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        birthDate: form.birthDate,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/login');
      }

    }

  } catch {
    alert('Error al registrar');
  } finally {
    setLoading(false);
  }
};  
  
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (mode !== 'admin-barber') return;

    api
      .get('/location') // 👈 ruta correcta
      .then(res => {
        setLocations(res.data);
      })
  }, [mode]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#0F0F0F',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        px: { xs: 1.5, sm: 0 },
        py: 3,
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
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            fontFamily: 'Keania One',
            color: '#DBD515',
            letterSpacing: 1.5,
            fontSize: { xs: '1.6rem', sm: '2rem' },
            mb: { xs: 2, sm: 3 },
          }}
        >
          Crear cuenta
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nombre completo"
            name="name"
            size="small"
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
            size="small"
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
            size="small"
            fullWidth
            margin="normal"
            value={form.phone}
            error={!!errors.phone}
            helperText={errors.phone || "Ej: 261-2952223"}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);

              setForm({
                ...form,
                phone: formatted,
              });
            }}
            inputProps={{ maxLength: 11 }}
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{
              input: { color: '#fff' }
            }}
          />
          
          <TextField
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            size="small"
            fullWidth
            margin="normal"
            value={form.birthDate}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            onChange={(e) =>
              setForm({ ...form, birthDate: e.target.value })
            }
            required
            InputLabelProps={{
              shrink: true,
              style: { color: '#aaa' },
            }}
            sx={{
              input: { color: '#fff' }
            }}
          />
          
          <TextField
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
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


          <TextField
            label="Confirmar contraseña"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            InputLabelProps={{ style: { color: '#aaa' } }}
            sx={{ input: { color: '#fff' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: '#aaa' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {mode === 'admin-barber' && (
            <Select
              fullWidth
              name="locationId"
              value={form.locationId}
              onChange={(e) =>
                setForm({ ...form, locationId: e.target.value })
              }
              displayEmpty
              required
              sx={{ mt: 2, color: '#fff' }}
            >
              <MenuItem value="">
                <em>Seleccionar local</em>
              </MenuItem>

              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name} , {loc.address}
                </MenuItem>
              ))}
            </Select>
          )}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: '#DBD515',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#c4bd13',
                mt: 3,
               py: { xs: 1.1, sm: 1.3 },
              },
            }}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </Box>

        <Typography textAlign="center" 
          sx={{
              mt: 2.5,
              fontSize: { xs: '0.85rem', sm: '0.9rem',color: '#ffffffff' },
            }}>
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
