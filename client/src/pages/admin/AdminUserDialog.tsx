import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import type { User, UpdateUserPayload } from '../../types/user';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';


interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => void;
  onChangePassword: (
    id: number,
    currentPassword: string,
    newPassword: string
  ) => void;
}



export default function AdminUserDialog({
  open,
  user,
  onClose,
  onSave,
  onChangePassword,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  const [form, setForm] = useState({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  roleId: 3, // client por defecto
});
  

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birthDate,
        roleId: user.role.id,
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          backgroundColor: '#000',
          color: '#DBD515',
          fontFamily: 'Keania One',
          letterSpacing: 1,
        }}
      >
        Editar usuario
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#c0c785ff', color: '#fff' }}>
        <Box display="grid" gap={2} mt={2}>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
          />

          <TextField
            label="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />

          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={form.birthDate}
            onChange={(e) =>
              setForm({ ...form, birthDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            select
            label="Rol"
            value={form.roleId}
            onChange={(e) =>
                setForm({ ...form, roleId: Number(e.target.value) })
            }
            fullWidth
            >
            <MenuItem value={1}>Admin</MenuItem>
            <MenuItem value={2}>Barber</MenuItem>
            <MenuItem value={3}>Cliente</MenuItem>
          </TextField>

        </Box>

        <Divider sx={{ my: 3, backgroundColor: '#333' }} />

        <Typography variant="subtitle1" color="#DBD515">
        Cambiar contraseña
        </Typography>

        <TextField
          label="Contraseña actual"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          fullWidth
          sx={{ mt: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowCurrentPassword((prev) => !prev)
                  }
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Nueva contraseña"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          sx={{ mt: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowNewPassword((prev) => !prev)
                  }
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: '#000',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button onClick={onClose} sx={{ color: '#fff' }}>
          Cancelar
        </Button>

     <Button
        sx={{ backgroundColor: '#DBD515', color: '#000' }}
        onClick={() => {
          onSave(form);

          if (currentPassword && newPassword) {
            onChangePassword(user.id, currentPassword, newPassword);
          }
        }}
      >
        Guardar cambios
      </Button>


      </DialogActions>
    </Dialog>
  );
}
