import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AvatarCompress from "./Avatarcompress";

export default function Profile() {

  const { user, setUser } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const token = localStorage.getItem("token");

  const avatarUrl =
  user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}?t=${Date.now()}`
    : undefined;
    
  const handleSelectFile = (file: File) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = {
        ...user!,
        avatar: res.data.avatar,
      };

      setUser(updatedUser);

      setFile(null);
      setPreview(null);

      alert("Avatar actualizado");

    } catch (error) {
      console.error(error);
      alert("Error subiendo imagen");
    }
  };

  const handleViewAvatar = () => {
    if (!avatarUrl) return;

    window.open(avatarUrl, "_blank");
  };

  const handleDeleteAvatar = async () => {

    if (!user?.avatar) return;

    try {
        await api.delete('/user/delete-avatar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPreview(null);
      setFile(null);

      setUser({
        ...user,
        avatar: null,
      });

      alert('Avatar eliminado');

    } catch (error) {
      console.error(error);
      alert('Error eliminando avatar');
    }
  };
  useEffect(() => {

    if (!token) return;

    const loadProfile = async () => {
      try {

        const res = await api.get("/user/profile", {
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
        minHeight: "100vh",
        backgroundColor: "#0F0F0F",
        pt: 10,
        textAlign: "center",
      }}
    >

      <Typography
        sx={{
          fontFamily: "Keania One",
          color: "#DBD515",
          mb: 4,
          fontSize: 30,
        }}
      >
        Mi Perfil
      </Typography>

      <AvatarCompress
      avatarUrl={preview || avatarUrl}
      onSelectFile={handleSelectFile}
      onDelete={handleDeleteAvatar}
      onView={handleViewAvatar}
    />

      <Typography sx={{ color: "#fff", mb: 1 }}>
        {user?.name}
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 4 }}>
        {user?.email}
      </Typography>

      <Button
        variant="outlined"
        onClick={uploadAvatar}
        sx={{
          borderColor: "#DBD515",
          color: "#DBD515",
        }}
      >
        Subir foto
      </Button>

    </Box>
  );
}