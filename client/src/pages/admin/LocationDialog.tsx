import { useEffect, useState } from "react";
import type { Location } from "../../types/location";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void; // 🔥 cambio clave
  initialData?: Location | null;
}

export default function LocationDialog({
  open,
  onClose,
  onSubmit,
  initialData
}: Props) {

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    department: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* =========================
     HANDLE INPUT TEXT
  ========================= */
  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setErrors({ ...errors, [field]: '' });
    };

  /* =========================
     HANDLE FILES
  ========================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles).slice(0, 3);

    setFiles(fileArray);

    const previewUrls = fileArray.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  /* =========================
     CARGA INICIAL (EDIT)
  ========================= */
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone,
        department: initialData.department,
      });

      // 🔥 mostrar imágenes existentes
      const existingPreviews = initialData.images?.map(
        img => `${import.meta.env.VITE_API_URL}/uploads/location/${img}`
      ) || [];

      setPreviews(existingPreviews);
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        department: '',
      });
      setFiles([]);
      setPreviews([]);
    }
  }, [initialData]);

  /* =========================
     CLEANUP PREVIEWS
  ========================= */
  useEffect(() => {
    return () => {
      previews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  /* =========================
     VALIDACIÓN
  ========================= */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!form.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    // 🔥 solo obligatorio en CREATE
    if (!initialData && files.length === 0) {
      newErrors.images = 'Debe subir al menos una imagen';
    }

    if (files.length > 3) {
      newErrors.images = 'Máximo 3 imágenes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = () => {
    if (!validate()) return;

    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('address', form.address);
    formData.append('phone', form.phone);
    formData.append('department', form.department);

    files.forEach(file => {
      formData.append('images', file);
    });

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Editar local' : 'Crear nuevo local'}
      </DialogTitle>

      <DialogContent>

        <TextField
          label="Nombre"
          fullWidth
          required
          value={form.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Dirección"
          fullWidth
          required
          value={form.address}
          onChange={handleChange('address')}
          error={!!errors.address}
          helperText={errors.address}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Teléfono"
          fullWidth
          value={form.phone}
          onChange={handleChange('phone')}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Departamento"
          fullWidth
          value={form.department}
          onChange={handleChange('department')}
          sx={{ mt: 2 }}
        />

        {/* SUBIDA */}
        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Subir imágenes (máx 3)
          <input
            type="file"
            hidden
            multiple
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
        </Button>

        {/* ERROR IMÁGENES */}
        {errors.images && (
          <Box sx={{ color: 'red', fontSize: 12, mt: 1 }}>
            {errors.images}
          </Box>
        )}

        {/* PREVIEW */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {previews.map((src, i) => (
            <Box
              key={i}
              sx={{
                width: 80,
                height: 80,
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                borderRadius: 1,
              }}
            />
          ))}
        </Box>

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}