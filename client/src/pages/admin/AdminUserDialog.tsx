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

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => void;
  onDelete: (id: number) => void;
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
  onDelete,
  onChangePassword,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentPassword, setCurrentPassword] = useState('');

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
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
        />

        <TextField
        label="Nueva contraseña"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
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
        onClick={() => onSave(form)}
        sx={{ backgroundColor: '#DBD515', color: '#000' }}
        >
        Guardar
      </Button>




        {currentPassword && newPassword && (
            <Button
                onClick={() =>
                onChangePassword(user.id, currentPassword, newPassword)
                }
                sx={{ backgroundColor: '#555', color: '#fff' }}
            >
                Cambiar contraseña
            </Button>
            )}


        <Button
          onClick={() => onDelete(user.id)}
          color="error"
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
