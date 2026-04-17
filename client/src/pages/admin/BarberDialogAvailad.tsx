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
  InputAdornment,
} from "@mui/material";
import type { CreateBarberAvailabilityPayload } from "../../types/barberAvailability";
import type { AvailabilityForm } from "../../types/barberAvailability.form";
import { useTheme, useMediaQuery } from "@mui/material";
import api from "../../services/api";


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
  timeRanges: [{ start_time: "", end_time: "" }],
  percentage: "",
});

  /** Reset al cerrar */
  useEffect(() => {
  if (open) {
    setForm({
      barberId: barberId ?? 0,
      days: [],
      timeRanges: [{ start_time: "", end_time: "" }],
      percentage: "", // 🔥 importante
    });
  }
}, [open, barberId]);



 
 

  /** Validación total */
  const isValidRange = (start: string, end: string) => {
  if (!start || !end) return false;
  return new Date(`1970-01-01T${end}`) > new Date(`1970-01-01T${start}`);
};

  const isFormValid =
  form.days.length > 0 &&
  form.timeRanges.length > 0 &&
  form.timeRanges.every((range) =>
    isValidRange(range.start_time, range.end_time)
  ) &&
  form.percentage !== "" &&
  form.percentage >= 0 &&
  form.percentage <= 100;



  const DAY_LABELS: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const handleSubmit = async () => {
  if (!isFormValid || !barberId) return;

  // 🔥 1. guardar comisión
  await api.post('/commission', {
    barberId,
    percentage: Number(form.percentage),
  });

  // 🔥 2. guardar disponibilidad
  for (const day of form.days) {
    for (const range of form.timeRanges) {
      await onSubmit({
        barberId,
        day_of_week: day,
        start_time: range.start_time,
        end_time: range.end_time,
        is_active: true,
      });
    }
  }

  onClose();
};





  return (
  <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: { xs: "95%", sm: "100%" },
          maxHeight: { xs: "80vh", sm: "none" },
          m: 1,
        },
      }}
    >

    <DialogTitle
      sx={{
        fontSize: { xs: 18, sm: 22 },
        pb: 1,
      }}
    >
      Asignar comisión
    </DialogTitle>
    <DialogContent
      dividers
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        px: 2,
        py: 1.5,
        overflowY: "auto",
      }}
    >
      <TextField
  label="Comisión (%)"
  type="number"
  fullWidth
  size="small"
  required
  value={form.percentage}
  onChange={(e) => {
    let value = Number(e.target.value);

    if (value < 0) value = 0;
    if (value > 100) value = 100;

    setForm({
      ...form,
      percentage: value,
    });
  }}
  InputProps={{
    endAdornment: <InputAdornment position="end">%</InputAdornment>,
  }}
  error={
    form.percentage === "" ||
    Number(form.percentage) < 0 ||
    Number(form.percentage) > 100
  }
  helperText={
    form.percentage === ""
      ? "Campo obligatorio"
      : "Debe ser entre 0 y 100"
  }
/>
    </DialogContent>
    <DialogTitle
      sx={{
        fontSize: { xs: 18, sm: 22 },
        pb: 1,
      }}
    >
      Asignar disponibilidad
    </DialogTitle>

    <DialogContent
      dividers
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        px: 2,
        py: 1.5,
        overflowY: "auto",
      }}
    >

      {/* DÍAS */}
      <TextField
        select
        label="Días"
        fullWidth
        SelectProps={{
          multiple: true,
          value: form.days,
          onChange: (e) =>
            setForm({
              ...form,
              days: e.target.value as string[],
            }),
          renderValue: (selected) => (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {(selected as string[]).map((value) => (
                <Chip
                  key={value}
                  label={DAY_LABELS[value]}
                />
              ))}
            </Box>
          ),
        }}
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
              size="medium"
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

      {form.timeRanges.map((range, index) => {
      const isValid =
        range.start_time &&
        range.end_time &&
        range.end_time > range.start_time;

      return (
        <Box
          key={index}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            label="Inicio"
            type="time"
            value={range.start_time}
            onChange={(e) => {
              const updated = [...form.timeRanges];
              updated[index].start_time = e.target.value;
              setForm({ ...form, timeRanges: updated });
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          <TextField
            label="Fin"
            type="time"
            value={range.end_time}
            onChange={(e) => {
              const updated = [...form.timeRanges];
              updated[index].end_time = e.target.value;
              setForm({ ...form, timeRanges: updated });
            }}
            error={range.end_time !== "" && !isValid}
            helperText={
              range.end_time !== "" && !isValid
                ? "Fin debe ser mayor"
                : ""
            }
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          {form.timeRanges.length > 1 && (
            <Button
              color="error"
              onClick={() =>
                setForm({
                  ...form,
                  timeRanges: form.timeRanges.filter((_, i) => i !== index),
                })
              }
            >
              X
            </Button>
          )}
        </Box>
      );
    })}

    {/* 👇 ESTE VA FUERA DEL MAP */}
    <Button
      variant="outlined"
      size="small"
      onClick={() =>
        setForm({
          ...form,
          timeRanges: [
            ...form.timeRanges,
            { start_time: "", end_time: "" },
          ],
        })
      }
    >
      + Agregar horario
    </Button>


    </DialogContent>

    <DialogActions
      sx={{
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 2 },
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 0 },
      }}
    >
      <Button
        onClick={onClose}
        fullWidth={isMobile}
        size={isMobile ? "large" : "medium"}
      >
        Cancelar
      </Button>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!isFormValid}
        fullWidth={isMobile}
        size={isMobile ? "large" : "medium"}
      >
        Guardar
      </Button>
    </DialogActions>
  </Dialog>
);

}
