import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  CardContent,
  Card,
  Divider,
} from "@mui/material";
import { useMemo } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Barber } from "../../types/user";
import Metric from "../barber/Metric";
import RevenueChart from "../../components/charts/RevenueChart";
type Props = {
  barber: Barber;
};

export default function BarberReport({ barber }: Props) {
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

  const [history, setHistory] = useState<any[]>([]);

  const now = new Date();
  const [selectedService, setSelectedService] = useState<string | null>(null);

const filteredHistory = useMemo(() => {
  return history.filter(r => {

    const date = parseLocalDate(r.date);

    if (period === "day") {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return date >= startOfWeek && date <= endOfWeek;
    }

    if (period === "month") {
      return (
        date.getMonth() === selectedMonth &&
        date.getFullYear() === now.getFullYear()
      );
    }
    
    return true;
  });
}, [history, period, selectedMonth]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    const res = await api.get(`/bookings/barber/${barber.id}/history`, {
      headers: { Authorization: `Bearer ${user?.access_token}` },
    });

    setHistory(res.data);
  };
  



  useEffect(() => {
    if (!user?.access_token) return;

    setLoading(true);

    api
      .get(`/payment/barber/${barber.id}/metrics?period=${period}`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      })
      .then(res => setData(res.data))
      .finally(() => setLoading(false));

  }, [barber.id, period, user?.access_token]);

  useEffect(() => {
  if (!user?.access_token) return;
    fetchHistory();
  }, [barber.id]);

  

  const metrics = useMemo(() => {

  const result = {
    services: 0,
    barberTotal: 0,
    shopTotal: 0,
    cash: 0,
    mercadoPago: 0
  };

  filteredHistory.forEach(r => {

    if (r.status !== "completed") return;

    const barberEarning = Number(r.payment?.barberEarning ?? 0);
    const shopEarning = Number(r.payment?.shopEarning ?? 0);

    result.services++;
    result.barberTotal += barberEarning;
    result.shopTotal += shopEarning;

    if (r.payment?.method === "cash") {
      result.cash += barberEarning;
    }

    if (r.payment?.method === "mercado_pago") {
      result.mercadoPago += barberEarning;
    }

  });

  return result;

}, [filteredHistory]);
  
  

  const chartData = useMemo(() => {

  if (period === "day") {

  const services: any = {};

  filteredHistory.forEach(r => {

    const name = r.service.name;
    const method = r.payment?.method?.toLowerCase();

    if (!services[name]) {
      services[name] = {
        label: name,
        cash: 0,
        mp: 0,
      };
    }

    if (method === "cash") {
      services[name].cash += r.service.price;
    }

    if (method === "mercado_pago") {
      services[name].mp += r.service.price;
    }

  });

  return Object.values(services);
}

  if (period === "week") {

    const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const map: any = {};

    days.forEach(d => {
      map[d] = { label: d, total: 0 };
    });

    filteredHistory.forEach(r => {

      const date = parseLocalDate(r.date);

      const day = date
      .toLocaleDateString("es-AR", { weekday: "short" })
      .replace(".", "")
      .replace(/^\w/, c => c.toUpperCase());

      if (map[day]) {
        map[day].total += r.service.price;
      }

    });

    return days.map(d => map[d]);
  }

  if (period === "month") {

    const map: any = {};

    filteredHistory.forEach(r => {

      const day = parseLocalDate(r.date).getDate();

      if (!map[day]) {
        map[day] = {
          label: `${day}`,
          total: 0,
        };
      }

      map[day].total += r.service.price;

    });
    

    return Object.values(map);
  }
    return [];

  }, [filteredHistory, period]);
if (loading || !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  

const totalDay = filteredHistory.reduce(
  (sum, r) => sum + r.service.price,
  0
);

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 3,
      }}
    >

      {/* HEADER */}
      <Typography
        sx={{
          textAlign: "center",
          color: "#DBD515",
          fontSize: 26,
          fontFamily: "Keania One",
          mb: 3,
        }}
      >
        Reporte de {barber.name}
      </Typography>

      {/* FILTROS */}
      <Stack
      direction="row"
      spacing={1.5}
      justifyContent="center"
      alignItems="center"
      mb={4}
      flexWrap="wrap"
    >
      <Button
        variant={period === "day" ? "contained" : "outlined"}
        onClick={() => setPeriod("day")}
      >
        Día
      </Button>

      <Button
        variant={period === "week" ? "contained" : "outlined"}
        onClick={() => setPeriod("week")}
      >
        Semana
      </Button>

      <Button
        variant={period === "month" ? "contained" : "outlined"}
        onClick={() => setPeriod("month")}
      >
        Mes
      </Button>

      {period === "month" && (
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          style={{
            background: "#111",
            color: "#DBD515",
            border: "1px solid #333",
            padding: "6px 10px",
            borderRadius: 6,
            marginLeft: "8px"
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(2024, i).toLocaleString("es-AR", { month: "long" })}
            </option>
          ))}
        </select>
      )}
    </Stack>

      {/* MÉTRICAS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            md: "repeat(6,1fr)",
          },
          gap: 2,
          mb: 5,
        }}
      >
        <Metric label="Servicios" value={metrics.services} />

        <Metric
          label="💰 Ganancia barbero"
          value={metrics.barberTotal}
          color="success.main"
        />

        <Metric label="🏪 Comisión local" value={metrics.shopTotal} />

        <Metric label="💵 Efectivo" value={metrics.cash} />

        <Metric label="📱 MercadoPago" value={metrics.mercadoPago} />

        <Metric
          label="📊 Comisión barbero"
          value={`${Number(data.commissionPercentage)}%`}
          color="warning.main"
        />
      </Box>
      <Box sx={{ mb: 5 }}>
        <RevenueChart data={chartData}  onSelect={(label)=>setSelectedService(label)}/>
      </Box>
      {period === "day" && (
        <Typography
          sx={{
            mt:2,
            color:"#fff",
            textAlign:"center",
            fontWeight:600
          }}
        >
          Total del día: $
          {totalDay.toLocaleString("es-AR")}
        </Typography>
      )}
      {period === "week" && (
        <Typography
          sx={{
            mt:2,
            color:"#fff",
            textAlign:"center",
            fontWeight:600
          }}
        >
          Total de la: $
          {totalDay.toLocaleString("es-AR")}
        </Typography>
      )}
      {period === "month" && (
        <Typography
          sx={{
            mt:2,
            color:"#fff",
            textAlign:"center",
            fontWeight:600
          }}
        >
          Total del mes: $ 
          {totalDay.toLocaleString("es-AR")} ; 
          Total del local: $
          {data.shopTotal}
        </Typography>
        
      )}

      {/* HISTORIAL */}
      <Stack alignItems="center" mb={3}>
        <Button
          variant="outlined"
          onClick={() => setShowHistory(prev => !prev)}
        >
          {showHistory ? "Ocultar historial" : "Ver historial"}
        </Button>
      </Stack>

      {showHistory && (
        <Stack spacing={2}>
          <Divider sx={{ mb: 2 }} />

          {history.map(r => (
            <Card
              key={r.id}
              sx={{
                backgroundColor: "#111",
                border: "1px solid #222",
              }}
            >
              <CardContent>

                <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                  {r.time} · {r.client?.name ?? "Cliente"}
                </Typography>

                <Typography sx={{ color: "#aaa", fontSize: 13 }}>
                  ✂️ {r.service.name} · ${r.service.price}
                </Typography>

                <Typography sx={{ color: "#777", fontSize: 12 }}>
                  Estado: {r.status}
                </Typography>

                <Typography sx={{ color: "#777", fontSize: 12 }}>
                  Fecha: {r.date}
                </Typography>

              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {selectedService && (
        <Box
          sx={{
            mt:3,
            p:2,
            background:"#111",
            border:"1px solid #333",
            borderRadius:2
          }}
        >
          <Typography sx={{color:"#DBD515", mb:1}}>
            Servicio seleccionado
          </Typography>

          {filteredHistory
            .filter(r => r.service.name === selectedService)
            .map(r => (
              <Typography key={r.id} sx={{color:"#ccc"}}>
                {r.time} · {r.client?.name} · ${r.service.price}
              </Typography>
            ))}
        </Box>
      )}
    </Box>
  );
}