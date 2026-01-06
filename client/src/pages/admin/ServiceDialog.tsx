import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  MenuItem,
} from '@mui/material';
import type { CreateServicePayload, Service } from '../../types/services';
import { serviceIcons, DEFAULT_SERVICE_ICON } 
  from '../../utils/serviceIcons';

import type { ServiceIconKey } 
  from '../../utils/serviceIcons';



interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServicePayload) => void;
  initialData?: Service | null;
}

export default function ServiceDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState<CreateServicePayload>({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 0,
    icon: DEFAULT_SERVICE_ICON,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* =========================
     CARGA DATOS (EDITAR)
     ========================= */
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        duration_minutes:initialData.duration_minutes,
        icon: initialData.icon as ServiceIconKey,
      });
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 0,
        icon: DEFAULT_SERVICE_ICON,
      });
    }
  }, [initialData]);

  /* =========================
     VALIDACIÓN
     ========================= */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.description.trim())
      newErrors.description = 'La descripción es obligatoria';

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Editar servicio' : 'Crear servicio'}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Nombre"
          fullWidth
          required
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Descripción"
          fullWidth
          required
          multiline
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Precio"
          type="number"
          fullWidth
          value={form.price ?? ''}
          onChange={(e) =>
            setForm({
              ...form,
             price: Number(e.target.value),
            })
          }
          sx={{ mt: 2 }}
        />
        <TextField
          label="Duración (minutos)"
          type="number"
          fullWidth
          required
          value={form.duration_minutes}
          onChange={(e) =>
            setForm({
              ...form,
              duration_minutes: Number(e.target.value),
            })
          }
          sx={{ mt: 2 }}
        />


        {/* =========================
            SELECTOR DE ÍCONOS
           ========================= */}
        <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Ícono del servicio
        </Typography>

        <TextField
          select
          label="Ícono"
          value={form.icon}
          onChange={(e) =>
            setForm({ ...form, icon: e.target.value as ServiceIconKey })
          }
          fullWidth
        >
          {Object.keys(serviceIcons).map((key) => {
            const Icon = serviceIcons[key as ServiceIconKey];

            return (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  {Icon && <Icon width={40} height={40} />}
                  {key}
                </Box>
              </MenuItem>
            );
          })}
        </TextField>
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
