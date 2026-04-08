import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Barber } from "../../types/user";
import { Avatar, Box, CircularProgress, Divider, Typography } from "@mui/material";
import api from "../../services/api";
import BarberReport from "./BarberReport";

type SelectedBarber =
  | { mode: 'any' }
  | { mode: 'specific'; barber: Barber };


export default function RepostsHIstory (){
    
  const {user}= useAuth();
  const authHeader = { Authorization : `Bearer  ${user?.access_token}`};
  const [loading, setLoading] = useState(false);

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [ selectedBarber , setSelectedBarber] = useState<SelectedBarber | null>(null)

  const fechtBarbers = async () =>{
    try{
      setLoading(true)
      const res = await api.get(`/user/barbers`, {headers:authHeader});
      setBarbers(res.data)
    }
    catch(error){
      console.error(error)
    }
    finally{
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fechtBarbers();
    
  }, []);
  

  return(
    <Box
     sx={{
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        pt: { xs: 10, md: 12 },
      }}>
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
            fontSize: { xs: 28, sm: 32, md: 36 },
            color: '#DBD515',
            letterSpacing: 1.5,
            mb: 1,
          }}
      >
        Elegir barbero
      </Typography>
      <Typography 
      sx={{
          color: '#aaa',
          fontSize: { xs: 14, sm: 15 },
          maxWidth: 420,
          mx: 'auto',
          lineHeight: 1.6,
        }}
      >
        Seleccioná quién querés ver reporte
      </Typography>
      <Divider sx={{ mb: 4 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : (
          <Box
         sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fit, minmax(150px, 1fr))',
                sm: 'repeat(auto-fit, minmax(220px, 1fr))',
                md: 'repeat(auto-fit, minmax(260px, 1fr))',
              },
              gap: { xs: 1.5, sm: 3 },
            }}
          
          >
            {/* BARBEROS */}
            {barbers.map((barber) => {
              const selected =
                selectedBarber?.mode === 'specific' &&
                selectedBarber.barber.id === barber.id;

              const avatarUrl = barber.avatar
                ? `${import.meta.env.VITE_API_URL}${barber.avatar}`
                : undefined;

              return (
                <Box
                  key={barber.id}
                  onClick={() =>
                    setSelectedBarber({
                      mode: 'specific',
                      barber,
                    })
                  }
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: '0.3s ease',

                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Avatar
                    src={avatarUrl}
                    alt={barber.name}
                    sx={{
                      width: { xs: 90, sm: 110, md: 120 },
                      height: { xs: 90, sm: 110, md: 120 },
                      mb: 1,
                      border: selected
                        ? '3px solid #DBD515'
                        : '2px solid #444',
                      boxShadow: selected
                        ? '0 0 18px rgba(219,213,21,0.45)'
                        : '0 6px 16px rgba(0,0,0,0.6)',
                      transform: selected ? 'scale(1.08)' : 'scale(1)',
                      transition: '0.25s',
                    }}
                  />

                  <Typography
                    sx={{
                      fontFamily: 'Keania One',
                      color: selected ? '#DBD515' : '#ccc',
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      letterSpacing: 1,
                      textAlign: 'center',
                    }}
                  >
                    {barber.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}                        
          {selectedBarber?.mode === 'specific' && (
            <Box sx={{ mt: 6 }}>
              <BarberReport barber={selectedBarber.barber} />
            </Box>
          )}
      </Box>
    </Box>
  );
}