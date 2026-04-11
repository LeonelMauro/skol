import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Avatar } from "@mui/material";
import api from "../../services/api";
import Metric from "../barber/Metric";
import { useAuth } from "../../context/AuthContext";

type Props = {
  location: {
    id: number;
    name: string;
  };
};

export default function LocationReport({ location }: Props) {

  const { user } = useAuth();

  const authHeader = {
    Authorization: `Bearer ${user?.access_token}`,
  };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    setLoading(true);

    api
      .get(`/payment/location/${location.id}/report?period=${period}`,{
      headers: authHeader,
    })
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, [location.id, period]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ mt: 4 }}>

      <Typography sx={{ color: "#DBD515", mb: 2 }}>
        {location.name}
      </Typography>

      {/* MÉTRICAS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2,1fr)',
            md: 'repeat(4,1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Metric label="💰 Total" value={formatCurrency(data.totalRevenue)} />
        <Metric label="🏪 Local" value={formatCurrency(data.shopTotal)} />
        <Metric label="💈 Barberos" value={formatCurrency(data.barberTotal)} />
        <Metric label="✂️ Servicios" value={data.services} />
      </Box>

      {/* TOP BARBERS DEL LOCAL */}
      <Typography sx={{ color: "#DBD515", mb: 2 }}>
        Top barberos del local
      </Typography>

      {data.topBarbers?.map((b: any, i: number) => {
        const avatarUrl = b.avatar
          ? `${import.meta.env.VITE_API_URL}${b.avatar}`
          : undefined;


        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#111",
              p: 1.5,
              borderRadius: 1,
              mb: 1,
              border: "1px solid #333",
            }}
          >
            {/* IZQUIERDA: avatar + nombre */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid #DBD515",
                }}
              />

              <Typography sx={{ color: "#fff" }}>
                #{i + 1} {b.name}
              </Typography>
            </Box>

            {/* DERECHA: servicios */}
            <Typography sx={{ color: "#DBD515" }}>
              {b.services} servicios
            </Typography>
          </Box>
        );
      })}
              
    </Box>
  );
}