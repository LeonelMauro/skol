import { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog } from "@mui/material";
import  { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AvatarCompress from "./Avatarcompress";
import type { UpdateUserPayload } from "../types/user";
import ProfileDialog from "./ProfileDialog";
import Zoom from "@mui/material/Zoom";

export default function Profile() {


  const { user, setUser } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const token = localStorage.getItem("token");
  const avatarUrl =
  user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}?t=${Date.now()}`
    : undefined;
    
  const handleSelectFile = (file: File) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateProfile = async (data: UpdateUserPayload) => {
    try {

      const res = await api.patch(
        "/user/profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser({
        ...user!,
        ...res.data
      });

      alert("Perfil actualizado");

    } catch (err) {
      console.error(err);
    }
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
    setOpenAvatar(true);
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
      console.error("Error cargando perfil:", err);
    }
  };

  loadProfile();

}, [token]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0F0F0F",
        pt: 3,
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
      <Typography sx={{ color: "#aaa" }}>
        Teléfono: {user?.phone || "No especificado"}
      </Typography>
      <Typography sx={{ color: "#aaa" }}>
        Fecha de nacimiento: {
          user?.birthDate
            ? new Date(user.birthDate).toLocaleDateString()
            : "No especificado"
        }
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 4 }}>
        Rol: {user?.role}
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{
          backgroundColor: "#DBD515",
          color: "#000",
          mt: 2,
        }}
      >
        Editar perfil
      </Button>

      {file && (
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
      )}
      <ProfileDialog
      open={openDialog}
      user={user}
      onClose={() => setOpenDialog(false)}
      onSave={(data) => {
        updateProfile(data);
        setOpenDialog(false);
      }}
    />
    <Dialog
      open={openAvatar}
      onClose={() => setOpenAvatar(false)}
      TransitionComponent={Zoom}
      maxWidth="md"
    >
      <Box
        sx={{
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            borderRadius: 8,
          }}
        />
      </Box>
    </Dialog>
    </Box>
  );
}