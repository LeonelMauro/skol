import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  IconButton,
  Box,
  Typography,
  Divider,
  MenuItem,
  Select,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SelectChangeEvent } from "@mui/material/Select";



import type {
  BarberAvailability,
  EditableBarberAvailability,
  UpdateBarberSchedulePayload,
} from "../../types/barberAvailability";
import api from "../../services/api";
import type { Location } from "../../types/location";


const DAY_LABELS: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

interface Props {
  open: boolean;
  barberId: number;
  barberName: string;
  availabilities: BarberAvailability[];
  locationId: number | null;
  onClose: () => void;
  onSaveSchedule: (payload: UpdateBarberSchedulePayload) => void;
  onSaveLocation: (barberId: number, locationId: number) => void;
}



export default function BarberDialogEditAvail({
  open,
  barberId,
  barberName,
  availabilities,
  locationId,
  onClose,
  onSaveSchedule,
  onSaveLocation,
}: Props) {


  
const [days, setDays] = useState<EditableBarberAvailability[]>([]);
const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");

const [errors, setErrors] = useState<Record<string, string>>({});

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const validateAll = (updatedDays: EditableBarberAvailability[]) => {
  const newErrors: Record<string, string> = {};

  updatedDays.forEach((day, dayIndex) => {
    if (!day.is_active) return;

    const sorted = [...day.timeRanges].sort(
      (a, b) =>
        timeToMinutes(a.start_time || "00:00") -
        timeToMinutes(b.start_time || "00:00")
    );

    sorted.forEach((range, rangeIndex) => {
      const key = `${dayIndex}-${rangeIndex}`;

      if (!range.start_time || !range.end_time) {
        newErrors[key] = "Horario incompleto";
        return;
      }

      const start = timeToMinutes(range.start_time);
      const end = timeToMinutes(range.end_time);

      if (end <= start) {
        newErrors[key] =
          "La hora fin debe ser mayor a la de inicio";
      }
    });

    // Validar solapamientos
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = timeToMinutes(sorted[i].end_time);
      const nextStart = timeToMinutes(sorted[i + 1].start_time);

      if (currentEnd > nextStart) {
        const key = `${dayIndex}-${i}`;
        newErrors[key] = "Horario solapado";
      }
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const [hasCommission, setHasCommission] = useState(false);

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
  


useEffect(() => {
  if (!open) return;

  const ordered: EditableBarberAvailability[] = DAY_ORDER.map(day => {
    const dayAvailabilities = availabilities
      .filter(a => a.day_of_week === day)
      .sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

    return {
      day_of_week: day,
      is_active: dayAvailabilities.length > 0,
      timeRanges: dayAvailabilities.map(a => ({
        id: a.id, // 🔥 IMPORTANTE
        start_time: a.start_time,
        end_time: a.end_time,
      })),
    };
  });

  setDays(ordered);
  setRemovedIds([]);
  setSelectedLocationId(locationId ?? "");
}, [open, availabilities, locationId]);





  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const updateDay = (
  index: number,
  patch: Partial<EditableBarberAvailability>
) => {
  const copy = [...days];
  copy[index] = { ...copy[index], ...patch };

  if (
    patch.is_active &&
    copy[index].timeRanges.length === 0
  ) {
    copy[index].timeRanges.push({
      start_time: "",
      end_time: "",
    });
  }

  setDays(copy);
};




const [removedIds, setRemovedIds] = useState<number[]>([]);

const [locations, setLocations] = useState<Location[]>([]);

const [percentage, setPercentage] = useState<number | "">("");

useEffect(() => {
  if (!open) return;

  api.get(`/commission/barber/${barberId}`)
    .then(res => {
      if (res.data) {
        setPercentage(res.data.percentage);
        setHasCommission(true);
      } else {
        setPercentage("");
        setHasCommission(false);
      }
    })
    .catch(() => {
      setPercentage("");
      setHasCommission(false);
    });
}, [open, barberId]);
const validateDayRanges = (day: EditableBarberAvailability) => {
  const ranges = day.timeRanges;

  for (let i = 0; i < ranges.length; i++) {
    const { start_time, end_time } = ranges[i];

    if (!start_time || !end_time) {
      return `Faltan horarios en ${DAY_LABELS[day.day_of_week]}`;
    }

    const start = timeToMinutes(start_time);
    const end = timeToMinutes(end_time);

    if (end <= start) {
      return `El horario de ${DAY_LABELS[day.day_of_week]} tiene fin menor o igual al inicio`;
    }
  }

  // Validar solapamientos
  const sorted = [...ranges].sort(
    (a, b) =>
      timeToMinutes(a.start_time) -
      timeToMinutes(b.start_time)
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = timeToMinutes(sorted[i].end_time);
    const nextStart = timeToMinutes(sorted[i + 1].start_time);

    if (currentEnd > nextStart) {
      return `Hay solapamiento en ${DAY_LABELS[day.day_of_week]}`;
    }
  }

  return null;
};




const handleSave = async () => {
  if (!selectedLocationId) {
    alert("Debe seleccionar un local");
    return;
  }

  // 🔎 VALIDACIÓN
  for (const day of days) {
    if (!day.is_active) continue;

    const error = validateDayRanges(day);
    if (error) {
      alert(error);
      return;
    }
  }

  try {
    await onSaveSchedule({
      barberId,
      locationId: selectedLocationId,
      availabilities: days,
      removedIds,
    });

    // 🔥 comisión
if (hasCommission) {
  await api.patch(`/commission/barber/${barberId}`, {
    percentage: Number(percentage),
  });
} else {
  await api.post('/commission', {
    barberId,
    percentage: Number(percentage),
  });
}

    if (selectedLocationId !== locationId) {
      await onSaveLocation(barberId, selectedLocationId);
    }

    onClose();
  } catch (error) {
    console.error(error);
    alert("Error al guardar los cambios");
  }
};



useEffect(() => {
  if (!open) return;

  api.get('/location').then(res => {
    setLocations(res.data);
  });
}, [open]);

const handleLocationChange = (e: SelectChangeEvent<number>) => {
  const value = e.target.value;
  setSelectedLocationId(value);
};
const addTimeRange = (dayIndex: number) => {
  const copy = [...days];
  copy[dayIndex].timeRanges.push({
    start_time: "",
    end_time: "",
  });
  copy[dayIndex].is_active = true;
  setDays(copy);
  validateAll(copy);
};

const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
  const copy = [...days];
  const removedRange = copy[dayIndex].timeRanges[rangeIndex];

  // 🔥 si tiene id, lo agregamos a removedIds
  if (removedRange.id) {
    setRemovedIds(prev => [...prev, removedRange.id!]);
  }

  copy[dayIndex].timeRanges.splice(rangeIndex, 1);

  if (copy[dayIndex].timeRanges.length === 0) {
    copy[dayIndex].is_active = false;
  }

  setDays(copy);
  validateAll(copy);
};

const isFormValid =
  Object.keys(errors).length === 0 &&
  selectedLocationId !== "" &&
  percentage !== "" &&
  !isNaN(Number(percentage)) &&
  Number(percentage) >= 0 &&
  Number(percentage) <= 100;


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#111',

          // 🔥 clave para mobile
          width: { xs: '92%', sm: '100%' },
          margin: { xs: '16px auto', sm: 'auto' },
          maxHeight: { xs: '90vh', sm: '85vh' },
        },
      }}
    >
  <DialogTitle
  sx={{
    fontSize: { xs: 18, sm: 22 },
    pb: 1,
    color: '#DBD515',
    textAlign: 'center',
    fontFamily: 'Keania One',
  }}
>
  Editar disponibilidad – {barberName}
</DialogTitle>

  <DialogContent
  dividers
  sx={{
    overflowY: 'auto',
  }}
>
  <Box
  sx={{
    mb: 3,
    p: 2,
    borderRadius: 3,
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.08)',
  }}
>
  <Typography
    sx={{
      color: '#DBD515',
      fontWeight: 600,
      mb: 1,
    }}
  >
    Comisión
  </Typography>

  <TextField
    fullWidth
    size="small"
    type="number"
    value={percentage}
    onChange={(e) => {
      let value = Number(e.target.value);

      if (value < 0) value = 0;
      if (value > 100) value = 100;

      setPercentage(value);
    }}
    placeholder="Ej: 20"
    InputProps={{
      endAdornment: <InputAdornment position="end">%</InputAdornment>,
    }}
    sx={{
      backgroundColor: '#111',
      borderRadius: 2,
      '& input': { color: '#fff' },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#444',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#666',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#DBD515',
      },
    }}
    error={
      percentage === "" ||
      Number(percentage) < 0 ||
      Number(percentage) > 100
    }
    helperText={
      percentage === ""
        ? "Campo obligatorio"
        : "Debe ser entre 0 y 100"
    }
  />
</Box>
    {days.map((day, dayIndex) => {
  const isActive = day.is_active;

  return (
    <Box
      key={day.day_of_week}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 2,
        borderRadius: 4,
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            color: isActive ? '#DBD515' : '#777',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          {DAY_LABELS[day.day_of_week]}
        </Typography>

        <Switch
        checked={isActive}
        onChange={(e) =>
          updateDay(dayIndex, {
            is_active: e.target.checked,
          })
        }
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#DBD515',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#DBD515',
          },
          '& .MuiSwitch-track': {
            backgroundColor: '#555',
          },
        }}
      />
      </Box>

      {/* Si no está activo */}
      {!isActive && (
        <Typography
           sx={{
          mb: 2,
          fontSize: 13,
          color: '#999', // 🔥 mejor contraste
          fontStyle: 'italic',
        }}>
          Activá el día para agregar horarios
        </Typography>
      )}

      {/* Rangos */}
      {day.timeRanges.map((range, rangeIndex) => (
        <Box
          key={rangeIndex}
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
            border: "1px solid #e5e5e5",
          }}
        >
          <TextField
            label="Desde"
            type="time"
            size="small"
            fullWidth
            value={range.start_time}
            disabled={!isActive}
            onChange={(e) => {
              const copy = [...days];
              copy[dayIndex].timeRanges[rangeIndex].start_time =
                e.target.value;
              setDays(copy);
              validateAll(copy);
            }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Hasta"
            type="time"
            size="small"
            fullWidth
            value={range.end_time}
            disabled={!isActive}
            onChange={(e) => {
              const copy = [...days];
              copy[dayIndex].timeRanges[rangeIndex].end_time =
                e.target.value;
              setDays(copy);
              validateAll(copy);
            }}
            InputLabelProps={{ shrink: true }}
          />

          <IconButton
            color="error"
            disabled={!isActive}
            onClick={() =>
              removeTimeRange(dayIndex, rangeIndex)
            }
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      {/* Botón siempre visible */}
      <Button
        variant="contained"
        size="small"
        onClick={() => addTimeRange(dayIndex)}
        disabled={!isActive}
        sx={{
          mt: 1,
          alignSelf: "flex-start",
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        + Agregar horario
      </Button>
    </Box>
  );
})}





    <Divider sx={{ my: 2 }} />

<Select
  fullWidth
  value={selectedLocationId}
  onChange={handleLocationChange}
  displayEmpty
  required
  sx={{
    mt: 1,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: 2,

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#444',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#666',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#DBD515',
    },

    '& .MuiSvgIcon-root': {
      color: '#aaa', // flechita
    },
  }}

  MenuProps={{
    PaperProps: {
      sx: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
      },
    },
  }}
>
  <MenuItem value="">
    <em style={{ color: '#888' }}>Seleccionar local</em>
  </MenuItem>

  {locations.map((loc) => (
    <MenuItem
      key={loc.id}
      value={loc.id}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(219,213,21,0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(219,213,21,0.15)',
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'rgba(219,213,21,0.25)',
        },
      }}
    >
      {loc.name}, {loc.address}
    </MenuItem>
  ))}
</Select>



  </DialogContent>

  <DialogActions>
    <Button
  onClick={onClose}
  sx={{
    color: '#ccc',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 2,
    px: 2,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: '#888',
    },
  }}
>
  Cancelar
</Button>
    <Button variant="contained" onClick={handleSave} disabled={!isFormValid}>
      Guardar cambios
    </Button>




  </DialogActions>
</Dialog>

  );
}
