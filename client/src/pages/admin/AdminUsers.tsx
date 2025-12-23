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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/user';
import AdminUserDialog from './AdminUserDialog';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${user?.access_token}`,
  };

  const fetchUsers = async () => {
    const res = await api.get('/user', { headers: authHeader });
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (data: Partial<User>) => {
    await api.patch(`/user/${selectedUser?.id}`, data, {
      headers: authHeader,
    });
    setOpen(false);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/user/${id}`, { headers: authHeader });
    setOpen(false);
    fetchUsers();
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
    <Box>
      <Typography
        variant="h4"
        mb={3}
        sx={{ color: '#DBD515', fontFamily: 'Keania One' }}
      >
        Gestión de usuarios
      </Typography>

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
                  onClick={() => handleDelete(u.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AdminUserDialog
        open={open}
        user={selectedUser}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onChangePassword={handleChangePassword}
      />
    </Box>
  );
}
