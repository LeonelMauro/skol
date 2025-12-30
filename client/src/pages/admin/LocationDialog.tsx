import { useEffect, useState } from "react";
import type { CreateLocationPayload, Location } from "../../types/location";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationPayload) => void;
  initialData?: Location | null
}
export default function LocationDialog({
  open,
  onClose,
  onSubmit,
  initialData
}: Props) {

    const [form , setForm] = useState<CreateLocationPayload>({
        name: '',
        address: '',
        phone: '',
        imageUrl: ''
    })
     useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone,
        imageUrl: initialData.imageUrl,
      });
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        imageUrl: '',
      });
    }
   
  }, [initialData]);
   const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!form.imageUrl.trim()) {
      newErrors.imageUrl = 'La imagen es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     SUBMIT
     ========================= */
  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  const handleChange =
    (field: keyof CreateLocationPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setErrors({ ...errors, [field]: '' });
    };

    return(
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialData ? 'Editar local' : 'Crear nuevo local'}</DialogTitle>

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
          label="URL de imagen"
          fullWidth
          required
          value={form.imageUrl}
          onChange={handleChange('imageUrl')}
          error={!!errors.imageUrl}
          helperText={errors.imageUrl}
          sx={{ mt: 2 }}
        />
      </DialogContent>


            <DialogActions>
  <Button onClick={onClose}>Cancelar</Button>
  <Button
    variant="contained"
    onClick={handleSubmit}
  >
    {initialData ? 'Guardar cambios' : 'Crear'}
  </Button>
</DialogActions>

            </Dialog>

    )
}


