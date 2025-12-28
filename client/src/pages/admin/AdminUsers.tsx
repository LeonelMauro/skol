import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminUserDialog from './AdminUserDialog';
import { Snackbar, Alert } from '@mui/material';
import type { User, UpdateUserPayload } from '../../types/user';
import { TableContainer, Paper } from '@mui/material';



export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const showSnackbar = (
  message: string,
  severity: 'success' | 'error'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const authHeader = {
    Authorization: `Bearer ${user?.access_token}`,
  };

  const fetchUsers = async (query?: string) => {
  const res = await api.get('/user', {
    headers: authHeader,
    params: query ? { q: query } : {},
  });
  setUsers(res.data);
};

useEffect(() => {
  const timeout = setTimeout(() => {
    fetchUsers(search);
  }, 300); // debounce

  return () => clearTimeout(timeout);
}, [search]);
  

 

  

  const handleSave = async (data: UpdateUserPayload) => {
  try {
    await api.patch(`/user/${selectedUser?.id}`, data, {
      headers: authHeader,
    });

    showSnackbar('Usuario actualizado correctamente', 'success');
    setOpen(false);
    fetchUsers();
  } catch {
    showSnackbar('Error al actualizar el usuario', 'error');
  }
};


  const handleDelete = async (id: number) => {
  try {
    await api.delete(`/user/${id}`, { headers: authHeader });

    showSnackbar('Usuario eliminado correctamente', 'success');
    setOpen(false);
    fetchUsers();
  } catch {
    showSnackbar('Error al eliminar el usuario', 'error');
  }
};


  const handleChangePassword = async (
  id: number,
  currentPassword: string,
  newPassword: string
) => {
  await api.patch(
    `/user/${id}/password`,
    { currentPassword, newPassword },
    { headers: authHeader }
  );
};


  return (
    <Box sx={{ pt: { xs: 8, sm: 10 } }}    >
      <Typography
        variant="h4"
        mb={3}
        sx={{ color: '#DBD515', fontFamily: 'Keania One' }}
      >
        Gestión de usuarios
      </Typography>
      <TextField
        placeholder="Buscar usuario"
        size="small"
        sx={{ width: { xs: '100%', sm: 260 } }}
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          backgroundColor: 'transparent',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role.name}</TableCell>
                <TableCell>
                  <Chip
                    label={u.isActive ? 'Activo' : 'Inactivo'}
                    color={u.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelectedUser(u);
                      setOpen(true);
                    }}
                  >
                    <EditIcon sx={{ color: '#DBD515' }} />
                  </IconButton>

                  <IconButton
                    color="error"
                    disabled={u.id === user?.id}
                    onClick={() => {
                      setUserToDelete(u);
                      setConfirmDeleteOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    
      <AdminUserDialog
        open={open}
        user={selectedUser}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onChangePassword={handleChangePassword}
      />
      <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    <Dialog
            open={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
          >
            <DialogTitle>Confirmar eliminación</DialogTitle>

            <DialogContent>
              <Typography>
                ¿Estás seguro que deseas eliminar al usuario{' '}
                <strong>{userToDelete?.name}</strong>?  
                <br />
                Esta acción no se puede deshacer.
              </Typography>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setConfirmDeleteOpen(false)}>
                Cancelar
              </Button>

              <Button
                color="error"
                onClick={() => {
                  if (userToDelete) {
                    handleDelete(userToDelete.id);
                  }
                  setConfirmDeleteOpen(false);
                  setUserToDelete(null);
                }}
              >
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>

    

    </Box>
  );
}
