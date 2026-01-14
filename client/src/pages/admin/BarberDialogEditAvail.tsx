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
  if (open) {
    const ordered = DAY_ORDER
      .map(day =>
        availabilities.find(a => a.day_of_week === day)
      )
      .filter(Boolean)
      .map(a => ({
        id: a!.id,
        day_of_week: a!.day_of_week,
        start_time: a!.start_time,
        end_time: a!.end_time,
        is_active: a!.is_active,
      }));

    setDays(ordered);
    setRemovedIds([]); 
    setSelectedLocationId(locationId ?? "");
  }
}, [open, availabilities, locationId]);



  
  const updateDay = (index: number, patch: Partial<BarberAvailability>) => {
  const copy = [...days];
  copy[index] = { ...copy[index], ...patch };
  setDays(copy);
};

const removeDay = (id?: number) => {
  if (!id) return;

  setRemovedIds(prev => [...prev, id]);
  setDays(prev => prev.filter(d => d.id !== id));
};


const [removedIds, setRemovedIds] = useState<number[]>([]);

const [locations, setLocations] = useState<Location[]>([]);

const handleSave = async () => {
  if (!selectedLocationId) {
    alert("Debe seleccionar un local");
    return;
  }

  try {
    await onSaveSchedule({
      barberId,
      locationId: selectedLocationId,
      availabilities: days,
      removedIds,
    });

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

const handleLocationChange = (e: SelectChangeEvent) => {
  const value = e.target.value;
  setSelectedLocationId(value === "" ? "" : Number(value));
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
  <DialogTitle>
    Editar disponibilidad – {barberName}
  </DialogTitle>

  <DialogContent>
    {days.map((a, index) => (
      <Box
        key={a.id ?? index}
        sx={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr 110px 40px",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography>{DAY_LABELS[a.day_of_week]}</Typography>

        <TextField
          type="time"
          value={a.start_time}
          disabled={!a.is_active}
          onChange={(e) =>
            updateDay(index, { start_time: e.target.value })
          }
        />

        <TextField
          type="time"
          value={a.end_time}
          disabled={!a.is_active}
          onChange={(e) =>
            updateDay(index, { end_time: e.target.value })
          }
        />

        <Switch
          checked={a.is_active}
          onChange={(e) =>
            updateDay(index, { is_active: e.target.checked })
          }
        />

        <IconButton
          color="error"
          onClick={() => {
            if (confirm("¿Eliminar este día?")) {
              removeDay(a.id);
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    ))}

    <Divider sx={{ my: 2 }} />
     <Select
  fullWidth
  value={selectedLocationId}
  onChange={handleLocationChange}
  displayEmpty
  required
>
  <MenuItem value="">
    <em>Seleccionar local</em>
  </MenuItem>

  {locations.map((loc) => (
    <MenuItem key={loc.id} value={loc.id}>
      {loc.name}, {loc.address}
    </MenuItem>
  ))}
</Select>



  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>Cancelar</Button>
    <Button variant="contained" onClick={handleSave}>
      Guardar cambios
    </Button>




  </DialogActions>
</Dialog>

  );
}
