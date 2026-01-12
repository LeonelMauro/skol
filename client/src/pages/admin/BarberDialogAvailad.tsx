import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { CreateBarberAvailabilityPayload } from "../../types/barberAvailability";
import type { AvailabilityForm } from "../../types/barberAvailability.form";

interface BarberDialogAvailProps {
  open: boolean;
  barberId: number | null;
  onClose: () => void;
  onSubmit: (data: CreateBarberAvailabilityPayload) => void;
}

export default function BarberDialogAvail({
  open,
  barberId,
  onClose,
  onSubmit,
}: BarberDialogAvailProps) {
  const [form, setForm] = useState<AvailabilityForm>({
    barberId: 0,
    days: [],
    start_time: "",
    end_time: "",
  });

  /** Reset al cerrar */
  useEffect(() => {
    if (!open) {
      setForm({
        barberId: barberId ?? 0,
        days: [],
        start_time: "",
        end_time: "",
      });
    }
  }, [open, barberId]);

  /** Validación de horario */
  const isTimeRangeValid =
    form.start_time !== "" &&
    form.end_time !== "" &&
    form.end_time > form.start_time;

  /** Validación total */
  const isFormValid =
    form.barberId > 0 &&
    form.days.length > 0 &&
    isTimeRangeValid;

  const DAY_LABELS: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  const handleSubmit = async () => {
  if (!isFormValid || !barberId) return;

  for (const day of form.days) {
    await onSubmit({
      barberId,
      day_of_week: day,
      start_time: form.start_time,
      end_time: form.end_time,
      is_active: true,
    });
  }

  onClose();
};




  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar disponibilidad</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {/* Días */}
        <TextField
          select
          label="Días"
          SelectProps={{ multiple: true }}
          value={form.days}
          onChange={(e: SelectChangeEvent<string[]>) =>
            setForm({ ...form, days: e.target.value as string[] })
          }
          fullWidth
        >
          {Object.entries(DAY_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        {form.days.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {form.days.map((day) => (
              <Chip
                key={day}
                label={DAY_LABELS[day]}
                onDelete={() =>
                  setForm({
                    ...form,
                    days: form.days.filter((d) => d !== day),
                  })
                }
              />
            ))}
          </Box>
        )}

        {/* Hora inicio */}
        <TextField
          label="Hora inicio"
          type="time"
          value={form.start_time}
          onChange={(e) =>
            setForm({ ...form, start_time: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Hora fin */}
        <TextField
          label="Hora fin"
          type="time"
          value={form.end_time}
          onChange={(e) =>
            setForm({ ...form, end_time: e.target.value })
          }
          error={form.end_time !== "" && !isTimeRangeValid}
          helperText={
            form.end_time !== "" && !isTimeRangeValid
              ? "La hora fin debe ser mayor a la de inicio"
              : ""
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
