import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme, useMediaQuery } from "@mui/material";

import { Box, Typography } from "@mui/material";

type Props = {
  data: any[];
  onSelect?: (label: string) => void;
};

export default function RevenueChart({ data, onSelect }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box
      sx={{
        width: "100%",
        height: 280,
        backgroundColor: "#111",
        border: "1px solid #222",
        borderRadius: 3,
        p: 2.5,
      }}
    >
      <Typography
        sx={{
          color: "#DBD515",
          mb: 2,
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: 1,
        }}
      >
        Ingresos
      </Typography>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          onClick={(e:any)=>{
            if(e?.activeLabel && onSelect){
              onSelect(e.activeLabel)
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          <XAxis
          dataKey="label"
          tickFormatter={(value) =>
            value.length > 12 ? value.slice(0, 12) + "…" : value
          }
          stroke="#aaa"
          angle={isMobile ? -45 : -25}
          textAnchor="end"
          interval={0}
          height={isMobile ? 80 : 60}
        />

          <YAxis
            stroke="#aaa"
            tickFormatter={(v) => `$${v}`}
          />

          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value ?? 0);

              return num.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              });
            }}
          />

          <Legend />

           {data?.[0]?.cash !== undefined && (
            <Bar dataKey="cash" fill="#4CAF50" radius={[6,6,0,0]} />
          )}

          {data?.[0]?.mp !== undefined && (
            <Bar dataKey="mp" fill="#2196F3" radius={[6,6,0,0]} />
          )}

          {data?.[0]?.total !== undefined && (
            <Bar dataKey="total" fill="#DBD515" radius={[6,6,0,0]} />
          )}

        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}