import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  
} from "@mui/material";
import { useState, useEffect } from "react";
import type { AuthUser } from "../context/AuthContext";
interface Props {
  open: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onSave: (data: any) => void;
}
export default function ProfileDialog({
  open,
  user,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
  });
  
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
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 3) return numbers;

    return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}`;
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

      if (!valid) return;

      onSave(form);
    };
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

      <DialogTitle
        sx={{
          backgroundColor: "#000",
          color: "#DBD515",
          fontFamily: "Keania One",
        }}
      >
        Editar perfil
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: "#ffff" }}>

        <Box display="grid" gap={2} mt={2}>

          <TextField
            label="Nombre"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Teléfono"
            value={form.phone}
            error={!!errors.phone}
            helperText={errors.phone || "Ej: 261-2001100"}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);

              setForm({
                ...form,
                phone: formatted,
              });
            }}
            inputProps={{ maxLength: 11 }}
            fullWidth
          />

          <TextField
            label="Fecha nacimiento"
            type="date"
            value={form.birthDate}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setForm({ ...form, birthDate: e.target.value })
            }
            fullWidth
          />

        </Box>

      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#000" }}>

        <Button onClick={onClose} sx={{ color: "#fff" }}>
          Cancelar
        </Button>

        <Button
          onClick={handleSave}
          sx={{
            backgroundColor: "#DBD515",
            color: "#000",
          }}
        >
          Guardar
        </Button>

      </DialogActions>

    </Dialog>
  );
}