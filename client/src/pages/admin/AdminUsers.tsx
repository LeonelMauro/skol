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
  InputAdornment,
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
import SearchIcon from '@mui/icons-material/Search';


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
    await api.patch(`/user/${id}/deactivate`,{}, { headers: authHeader });

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
    <Box sx={{
        minHeight: '100vh',
        backgroundColor: '#f7f0f0ff',
        px: { xs: 2, md: 6 },
        pt: 3, // AppBar fixed
      }}    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr auto',
          },
          alignItems: 'center',
          mb: 3,
          gap: 2,
        }}
      >
        {/* TÍTULO */}
        <Typography
          sx={{
            gridColumn: {
              xs: '1 / -1',
              sm: '1 / -1',
            },
            textAlign: 'center',
            color: '#DBD515',
            fontFamily: 'Keania One',
            fontSize: {
              xs: '1.3rem',
              sm: '1.6rem',
              md: '2rem',
            },
          }}
        >
          Gestión de usuarios
        </Typography>

        {/* BUSCADOR */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: { sm: 'flex-end' },
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: {
                xs: '100%',
                sm: 260,
              },
            }}
             InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
          />
        </Box>
      </Box>
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
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{u.email}</TableCell>
                <TableCell>{u.role.name}</TableCell>
                <TableCell>
                  <Chip
                    label={u.isActive ? 'Activo' : 'Inactivo'}
                    color={u.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(u);
                        setOpen(true);
                      }}
                    >
                      <EditIcon sx={{ color: '#DBD515' }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      disabled={u.id === user?.id}
                      onClick={() => {
                        setUserToDelete(u);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
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
