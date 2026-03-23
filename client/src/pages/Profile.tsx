import {  useEffect, useState } from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user ,setUser} = useAuth();

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const token = localStorage.getItem('token');

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };
  
  const avatarUrl =
    user?.avatar
      ? `${import.meta.env.VITE_API_URL}${user.avatar}`
      : undefined;
  
  const uploadAvatar = async () => {
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/user/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        const updatedUser = {
          ...user!,
          avatar: res.data.avatar,
        };

        setUser(updatedUser);

        alert('Avatar actualizado');
      } catch (error) {
        console.error(error);
        alert('Error subiendo imagen');
      }
    };
    useEffect(() => {
        if (!token) return;

        const loadProfile = async () => {
          try {
            const res = await api.get('/user/profile', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setUser(res.data);

          } catch (err) {
            console.error(err);
          }
        };

        loadProfile();
      }, [token]);
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: 10,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Keania One',
          color: '#DBD515',
          mb: 4,
          fontSize: 30,
        }}
      >
        Mi Perfil
      </Typography>

     <Avatar
      src={preview || avatarUrl}
      sx={{
        width: 140,
        height: 140,
        margin: '0 auto',
        mb: 3,
        border: '3px solid #DBD515',
      }}
    />

      <Typography sx={{ color: '#fff', mb: 1 }}>
        {user?.name}
      </Typography>

      <Typography sx={{ color: '#aaa', mb: 4 }}>
        {user?.email}
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: '#DBD515',
          color: '#000',
          mb: 2,
        }}
      >
        Seleccionar imagen
        <input
          type="file"
          hidden
          accept="image/png, image/jpeg"
          onChange={handleSelectImage}
        />
      </Button>

      <Box>
        <Button
          variant="outlined"
          onClick={uploadAvatar}
          sx={{
            borderColor: '#DBD515',
            color: '#DBD515',
          }}
        >
          Subir foto
        </Button>
      </Box>
    </Box>
  );
}