import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { type CreateLocationPayload, type Location } from '../../types/location';
import { Box, Card, CardActionArea, CardContent, Typography, IconButton, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LocationDialog from "./LocationDialog";
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';



export default function Locations(){

    //User authorization
    const {user}= useAuth();
    const authHeader={
      Authorization: `Bearer ${user?.access_token}`
    }
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

      //Fromluario crear local
      //Endpoind crear local
      const handleCreateLocation= async (data: CreateLocationPayload)=>{
        try {
          await api.post('/location', data, { headers: authHeader });
          showSnackbar('Local creado con exito', 'success');
          feachLocations();
        } catch (error) {
          showSnackbar('Error al crear local', 'error');
        }

      }

      //Estados para mostrar locales
    const [locations, setLocations] = useState<Location[]>([]);

      //Endpoind para mostrar locales
    const feachLocations = async () =>{
        try{
           const res =  await api.get('/location',{
            headers: authHeader
           });

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
         await api.delete(`/location/${id}`, {headers: authHeader});
        showSnackbar('Local eliminado con exito','success');
        feachLocations();
      }catch{
        showSnackbar('Error al eliminar local','error')
      }
    }

    useEffect(()=>{
        feachLocations();
    },[]);
    
    //Endpoind para editar locales

    const [openDialog, setOpenDialog] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const handleUpdateLocation = async (data: CreateLocationPayload) => {
      if (!editingLocation) return;

      try {
        await api.patch(`/location/${editingLocation.id}`, data, {
          headers: authHeader,
        });
        showSnackbar('Local actualizado con éxito', 'success');
        setOpenDialog(false);
        setEditingLocation(null);
        feachLocations();
      } catch {
        showSnackbar('Error al actualizar local', 'error');
      }
    };


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
    {locations.map((local) => (
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
          <Box
            sx={{
              height: { xs: 110, sm: 130, md: 150 },
              backgroundImage: `url(${local.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

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
    ))}

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