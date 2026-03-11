import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Barber } from "../../types/user";
import { Avatar, Box, Card, CardActionArea, CardContent, CircularProgress, Divider, Typography } from "@mui/material";
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
            {barbers.map(barber => {
              const selected =
              selectedBarber?.mode === 'specific' &&
              selectedBarber.barber.id === barber.id;
              return (
                <Card  key={barber.id}
                  onClick={() =>
                    setSelectedBarber({
                    mode: 'specific',
                    barber,
                    }) }
                  sx={{
                    width: '100%',
                    maxWidth: 320,
                    cursor: 'pointer',
                    backgroundColor: '#000',
                    borderRadius: 3,
                    border: selected
                    ? '2px solid #DBD515'
                    : '1px solid #333',
                    transition: '0.35s ease',
            
                    '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: selected
                    ? '0 0 20px rgba(219,213,21,0.4)'
                    : '0 12px 30px rgba(0,0,0,0.6)',
                    },
                      }}
                    >
                  <CardActionArea>
                    <CardContent 
                     sx={{
                      textAlign: 'center',
                      py: { xs: 1.2, sm: 2 },
                      px: { xs: 1, sm: 2 },
                    }}
                    >
                      <Avatar
                        sx={{
                          mx: 'auto',
                          mb: 1.5,
                          width: 64,
                          height: 64,
                          bgcolor: '#DBD515',
                          color: '#000',
                          fontWeight: 700,
                        }}
                        />
                    <Typography
                      sx={{
                      fontFamily: 'Keania One',
                      color: '#DBD515',
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      letterSpacing: 1,
                      }}
                      >
                       {barber.name}
                     </Typography>
                                    
                    </CardContent>
                  </CardActionArea>
                </Card>
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