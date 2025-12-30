import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { type CreateLocationPayload, type Location } from '../../types/location';
import { Box, Card, CardActionArea, CardContent, Typography, IconButton, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LocationDialog from "./LocationDialog";
import EditIcon from '@mui/icons-material/Edit';


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
            backgroundColor: '#696161ff',
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            px: { xs: 2, md: 6 },
            pt: { xs: 10, md: 12 }, // AppBar fixed
          }}
        >
        <Typography
        variant="h2"
        textAlign= 'center'
        sx={{
            color: '#DBD515',
            fontFamily: 'Keania One',
        }}
        >
        Nuestros Locales
        </Typography>
        <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 4,
                      px: { xs: 2, md: 8 },
                      justifyItems: 'center',
                    }}
                  >
                    {locations.map((local) => (
                      <Card
                        key={local.id}
                        sx={{
                          width: '100%',
                          maxWidth: 320,
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          backgroundColor: '#111',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                          transition: '0.35s ease',
                          cursor: 'pointer',
                          justifyItems: 'center',
        
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 18px 45px rgba(219,213,21,0.35)',
                          },
                        }}
                      >
                        <CardActionArea
                          
                          sx={{ position: 'relative',justifyItems: 'center', }}
                          
                        >
                          {/* IMAGEN */}
                          <Box
                            sx={{
                              height: 180,
                              backgroundImage: `url(${local.imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
        
                          {/* OVERLAY DORADO HOVER */}
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(rgba(219,213,21,0.25), rgba(0,0,0,0.7))',
                              opacity: 0,
                              transition: '0.35s',
                              '&:hover': {
                                opacity: 1,
                              },
                            }}
                          />
        
                          {/* CONTENIDO */}
                          <CardContent
                            sx={{
                              position: 'relative',
                              backgroundColor: '#0F0F0F',
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontFamily: 'Keania One',
                                color: '#DBD515',
                                letterSpacing: 1,
                              }}
                            >
                              {local.name}
                            </Typography>
        
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ccc',
                                mt: 0.5,
                              }}
                            >
                              {local.address}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ccc',
                                mt: 0.5,
                              }}
                            >
                              {local.phone}
                            </Typography>
                          </CardContent>
                        </CardActionArea>                        
                          {user?.role === 'admin' && (
                            <Box display="flex" justifyContent="flex-end">
                              <IconButton
                                onClick={() => {
                                  setEditingLocation(local);
                                  setOpenDialog(true);
                                }}
                                sx={{ color: '#DBD515' }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => {
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
                    {user?.role === 'admin' && (
                      <Box textAlign='center' mb={4}>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#DBD515', color: '#000' }}
                          onClick={() => {
                            setEditingLocation(null);   // ← modo crear
                            setOpenDialog(true);
                          }}
                        >
                          Más local
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <LocationDialog
                  open={openDialog}
                  onClose={() => {
                    setOpenDialog(false);
                    setEditingLocation(null);
                  }}
                  initialData={editingLocation}
                  onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation}
                />


      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
  open={confirmDeleteOpen}
  onClose={() => setConfirmDeleteOpen(false)}
>
  <DialogTitle>Confirmar eliminación</DialogTitle>

  <DialogContent>
    <Typography>
      ¿Estás seguro que deseas eliminar el local{' '}
      <strong>{locationToDelete?.name}</strong>?
      <br />
      Esta acción no se puede deshacer.
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setConfirmDeleteOpen(false)}>
      Cancelar
    </Button>

    <Button
      color="error"
      onClick={() => {
        if (locationToDelete) {
          handleDelete(locationToDelete.id);
        }
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