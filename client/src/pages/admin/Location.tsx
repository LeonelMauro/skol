import { useEffect, useState } from "react";
import api from "../../services/api";
import { type Location } from '../../types/location';
import { useAuth } from "../../context/AuthContext";
import { Box, Card, CardActionArea, CardContent, Typography, IconButton, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LocationDialog from "./LocationDialog";
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';



export default function Locations(){

   
    const { user } = useAuth();
    //Snackbar Mensajes al cliente
     const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: 'success' | 'error';
      }>({
        open: false,
        message: '',
        severity: 'success',
      });
      const showSnackbar = (
      message: string,
      severity: 'success' | 'error'
      ) => {
        setSnackbar({ open: true, message, severity });
      };
      const [imageIndex, setImageIndex] = useState<Record<number, number>>({});

      const nextImage = (locationId: number, total: number) => {
        setImageIndex(prev => ({
          ...prev,
          [locationId]: ((prev[locationId] || 0) + 1) % total
        }));
      };

      const prevImage = (locationId: number, total: number) => {
        setImageIndex(prev => ({
          ...prev,
          [locationId]:
            (prev[locationId] || 0) === 0
              ? total - 1
              : (prev[locationId] || 0) - 1
        }));
      };
      //Fromluario crear local
      //Endpoind crear local
      const handleCreateLocation= async (data: FormData)=>{
        try {
          await api.post('/location', data,);
          showSnackbar('Local creado con exito', 'success');
          fetchLocations();
        } catch (error) {
          showSnackbar('Error al crear local', 'error');
        }

      }

      //Estados para mostrar locales
    const [locations, setLocations] = useState<Location[]>([]);

      //Endpoind para mostrar locales
    const fetchLocations = async () =>{
        try{
           const res =  await api.get('/location');

           setLocations(res.data)
        }
        catch(error){
            console.error('Error en mostrar locales',error)
        }finally{
        }
    }
    //Endpoind para eliminar locales
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

    

    const handleDelete= async (id: number) =>{
      try{
         await api.delete(`/location/${id}`);
        showSnackbar('Local eliminado con exito','success');
        fetchLocations();
      }catch{
        showSnackbar('Error al eliminar local','error')
      }
    }

    useEffect(()=>{
        fetchLocations();
    },[]);
    
    //Endpoind para editar locales

    const [openDialog, setOpenDialog] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const handleUpdateLocation = async (data: FormData) => {
      if (!editingLocation) return;

      try {
        await api.patch(`/location/${editingLocation.id}`, data);
        showSnackbar('Local actualizado con éxito', 'success');
        setOpenDialog(false);
        setEditingLocation(null);
        fetchLocations();
      } catch {
        showSnackbar('Error al actualizar local', 'error');
      }
    };
    useEffect(() => {
      const interval = setInterval(() => {
        setImageIndex(prev => {
          const updated = { ...prev };

          locations.forEach(loc => {
            if (loc.images?.length > 1) {
              const current = prev[loc.id] || 0;
              updated[loc.id] = (current + 1) % loc.images.length;
            }
          });

          return updated;
        });
      }, 4000);

      return () => clearInterval(interval);
    }, [locations]);

    
    return(
    <Box
  sx={{
    minHeight: '100vh',
    backgroundColor: '#0F0F0F',
    pt: { xs: 10, md: 12 },
    px: { xs: 2, md: 4 },
  }}
>
  <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
    <Typography
      sx={{
        fontFamily: 'Keania One',
        fontSize: { xs: 28, sm: 32, md: 36 },
        color: '#DBD515',
        letterSpacing: 1.5,
        mb: 1,
      }}
    >
      Nuestros Locales
    </Typography>
  </Box>

  {/* GRID DE LOCALES */}
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(auto-fit, minmax(150px, 1fr))',
        sm: 'repeat(auto-fit, minmax(200px, 1fr))',
        md: 'repeat(auto-fit, minmax(260px, 1fr))',
      },
      justifyContent: 'center',
      gap: { xs: 1.5, sm: 3 },
    }}
  >
    {locations.map((local) => {

  const currentIndex = imageIndex[local.id] ?? 0;

const currentImage =
  local.images && local.images.length > 0
    ? local.images[currentIndex] || local.images[0]
    : null;
    
const imageUrl = currentImage
  ? `${import.meta.env.VITE_API_URL}/uploads/location/${currentImage}`
  : '/placeholder.jpg';
  console.log("IMG FINAL:", imageUrl);
  return (
      <Card
        key={local.id}
        sx={{
        borderRadius: 2,
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'rgba(219,213,21,0.15)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.55)',
        },
      }}
      >
        <CardActionArea sx={{  }}>
          {/* IMAGEN */}
          <Box sx={{ position: 'relative', '&:hover .controls': { opacity: 1 } }}>
            <Box
  sx={{
    height: { xs: 110, sm: 130, md: 150 },
    overflow: 'hidden',
  }}
>
  <img
    src={imageUrl}
    alt={local.name}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    }}
    onError={(e) => {
      console.log("ERROR IMG:", imageUrl);
      e.currentTarget.src = "/placeholder.jpg";
    }}
  />
</Box>
        

            {/* FLECHA IZQUIERDA */}
            {local.images?.length > 1 && (
              <Box
                className="controls"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage(local.id, local.images.length);
                }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 5,
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 18,
                  background: 'rgba(0,0,0,0.4)',
                  px: 1,
                  borderRadius: 1,
                }}
              >
                ‹
              </Box>
            )}

            {/* FLECHA DERECHA */}
            {local.images?.length > 1 && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage(local.id, local.images.length);
                }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 5,
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 18,
                  background: 'rgba(0,0,0,0.4)',
                  px: 1,
                  borderRadius: 1,
                }}
              >
                ›
              </Box>
            )}

            {/* DOTS */}
            {local.images?.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 5,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                {local.images.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor:
                        (imageIndex[local.id] || 0) === i
                          ? '#DBD515'
                          : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* CONTENIDO */}
          <CardContent
            sx={{
              textAlign: 'center',
              py: { xs: 1, sm: 1.5 },
              px: { xs: 1, sm: 2 },
            }}
          >
            {/* NOMBRE */}
            <Typography
              sx={{
                fontFamily: 'Keania One',
                color: '#DBD515',
                fontSize: { xs: 12, sm: 16, md: 18 },
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              {local.name}
            </Typography>

            {/* DIRECCIÓN + DEPARTAMENTO */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.4,
              }}
            >
              <Typography
                sx={{
                  color: '#bbb',
                  fontSize: { xs: 10.5, sm: 13, md: 14 },
                  lineHeight: 1.25,
                }}
              >
                {local.address}
                {local.department ? ', ' + local.department : ''}
              </Typography>

              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  const fullAddress = `${local.address}${local.department ? ', ' + local.department : ''}`;
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
                    '_blank'
                  );
                }}
                sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'rgba(219,213,21,0.5)' }}
              >
                <LocationOnIcon sx={{ fontSize: 20 }} />
              </Box>

            </Box>

            {/* TELÉFONO */}
            <Typography
              sx={{
                color: '#ccc',
                fontSize: { xs: 10.5, sm: 13, md: 14 },
                mt: 0.5,
              }}
            >
              {local.phone}
            </Typography>
          </CardContent>
        </CardActionArea>

         {/* BOTONES ADMIN */}
      {user?.role === 'admin' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 2, pb: 2 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setEditingLocation(local);
              setOpenDialog(true);
            }}
            sx={{ color: '#DBD515' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setLocationToDelete(local);
              setConfirmDeleteOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
          </Card>
        );
      })}

        {/* BOTÓN NUEVO LOCAL */}
        {user?.role === 'admin' && (
          <Box textAlign="center" mb={4} mt={2}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#DBD515', color: '#000' }}
              onClick={() => {
                setEditingLocation(null);
                setOpenDialog(true);
              }}
            >
              Más local
            </Button>
          </Box>
        )}
      </Box>

  {/* DIALOG CREAR/EDITAR */}
  <LocationDialog
    open={openDialog}
    onClose={() => {
      setOpenDialog(false);
      setEditingLocation(null);
    }}
    initialData={editingLocation}
    onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation}
  />

  {/* SNACKBAR */}
  <Snackbar
    open={snackbar.open}
    autoHideDuration={4000}
    onClose={() => setSnackbar({ ...snackbar, open: false })}
  >
    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
      {snackbar.message}
    </Alert>
  </Snackbar>

  {/* CONFIRM DELETE */}
  <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
    <DialogTitle>Confirmar eliminación</DialogTitle>
    <DialogContent>
      <Typography>
        ¿Estás seguro que deseas eliminar el local <strong>{locationToDelete?.name}</strong>?
        <br />
        Esta acción no se puede deshacer.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
      <Button
        color="error"
        onClick={() => {
          if (locationToDelete) handleDelete(locationToDelete.id);
          setConfirmDeleteOpen(false);
          setLocationToDelete(null);
        }}
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
</Box>

    )
}