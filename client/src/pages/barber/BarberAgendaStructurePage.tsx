import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { BarberAvailability } from "../../types/barberAvailability";
import type { TodayBooking } from "../../types/booking";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function BarberAgendaStructurePage() {
  const { user } = useAuth();
  const authHeader = { Authorization : `Bearer ${user?.access_token}`}
  const [availabilities, setAvailabilities] = useState<BarberAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<TodayBooking[]>([]);

  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/barber-availability/barber/${user?.id}`,{headers:authHeader}
      );

      setAvailabilities(response.data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAppointments = async () => {
  if (!user?.access_token) return;

  try {
    const response = await api.get(
      '/bookings/barber/by-date',
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      }
    );

    // Filtramos por fecha seleccionada
    const filtered = response.data.filter(
  (booking: TodayBooking) =>
    booking.date.split("T")[0] === selectedDate
);


    setAppointments(filtered);
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
};
useEffect(() => {
  if (!user?.access_token) return;
  fetchAppointments();
}, [selectedDate, user?.access_token]);


  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#0F0F0F',
      pt: 3,
    }}
  >
    <Box
              sx={{
                maxWidth: 1200,
                mx: 'auto',
                px: { xs: 2, md: 4 },
                textAlign: 'center',
              }}
            >
    <Typography
      variant="h4"
      sx={{
        fontFamily: 'Keania One',
        color: '#DBD515',
        mb: 1,
      }}
    >
      Mi Disponibilidad
    </Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          lg: "1fr 1fr 1fr",
        },
        gap: 3,
      }}
    >
      {DAY_ORDER.map((day) => {
        const dayRanges = availabilities
          .filter((a) => a.day_of_week === day)
          .sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          );

        if (dayRanges.length === 0) return null;

        const isActive = dayRanges.some((r) => r.is_active);

        return (
          <Paper
            key={day}
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: "#1a1a1aff",
              borderRadius: 3,
              border: isActive
                ? "1px solid rgba(46,125,50,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              transition: "0.2s ease",
            }}
          >
            {/* Header Día */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", md: "1.1rem", color:'#DBD515'} }}
              >
                {DAY_LABELS[day]}
              </Typography>

              <Chip
                label={isActive ? "Activo" : "Inactivo"}
                size="small"
                color={isActive ? "success" : "default"}
                variant={isActive ? "filled" : "outlined"}
              />
            </Box>

            <Divider sx={{ mb: 2, backgroundColor: "#333" }} />

            {/* Rangos */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {dayRanges.map((range) => (
                <Typography
                  key={range.id}
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.85rem", md: "0.9rem" },
                    color: range.is_active
                      ? "#2e7d32"
                      : "#888",
                    textDecoration: range.is_active
                      ? "none"
                      : "line-through",
                    opacity: range.is_active ? 1 : 0.6,
                  }}
                >
                  {range.start_time} – {range.end_time}
                </Typography>
              ))}
            </Box>
          </Paper>
        );
      })}
    </Box>
    <Box sx={{ mt: 5 }}>
    <Typography
      variant="h4"
      sx={{
        fontFamily: 'Keania One',
        color: '#DBD515',
        mb: 3,
      }}
    >
      Agenda del Día
    </Typography>

    <Box sx={{ mb: 4, maxWidth: 250 }}>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#1a1a1a',
          color: 'white',
          width: '100%',
        }}
      />
    </Box>

    {appointments.length === 0 ? (
      <Typography sx={{ color: '#777' }}>
        No hay turnos para esta fecha.
      </Typography>
    ) : (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 3,
        }}
      >
        {appointments
          .sort((a, b) =>
            a.time.localeCompare(b.time)
          )
          .map((booking) => (
            <Paper
              key={booking.id}
              sx={{
                p: 3,
                backgroundColor: '#1a1a1a',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  {booking.time}
                </Typography>

                <Chip
                  label={booking.status}
                  size="small"
                  color={
                    booking.status === 'confirmed'
                      ? 'success'
                      : booking.status === 'pending'
                      ? 'warning'
                      : booking.status === 'completed'
                      ? 'primary'
                      : booking.status === 'no_show'
                      ? 'error'
                      : 'default'
                  }
                />
              </Box>

              <Typography variant="body1">
                Cliente: {booking.client?.name ?? "Cliente no disponible"}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: '#aaa' }}
              >
                Servicio: {booking.service.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: '#aaa' }}
              >
                Local: {booking.location.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: '#2e7d32', mt: 1 }}
              >
                ${booking.service.price}
              </Typography>
            </Paper>
          ))}
      </Box>
    )}
  </Box>

    </Box>
  </Box>
);

}
