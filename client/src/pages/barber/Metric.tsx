import { Box, Typography } from '@mui/material';

type MetricProps = {
  label: string;
  value: string | number;
  color?: string;
};

export default function Metric({
  label,
  value,
  color = '#ccc',
}: MetricProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: 1.5,
        py: { xs: 1, sm: 1.5 },
        textAlign: 'center',
      }}
    >
      <Typography sx={{ fontSize: 11, color: '#777' }}>
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: 16, sm: 18 },
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
