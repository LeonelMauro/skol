import {useAuth} from '../../context/AuthContext';
import api from '../../services/api';
import {  useEffect, useState } from 'react';
import type { Service } from '../../types/services';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,  IconButton,  Snackbar, Typography } from '@mui/material';
import { serviceIcons } from '../../utils/serviceIcons';
import ServiceDialog from './ServiceDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';




export default function Services(){

    //User authorization

    const {user}= useAuth();
    const authHeader = { Authorization : `Bearer ${user?.access_token}`}
    
    //Snackbar mensaje al cliente

    const [snackbar, setSnackbar]= useState<{
      open:boolean,
      message: string,
      severity:'success'| 'error',
    }>({
      open: false,
      message: '',
      severity: 'success'
    });
    const showSnackbar=(
      message: string,
      severity: 'success'| 'error',
    ) => {
      setSnackbar({open:true,message,severity})
    }

    
    //Mostrar los servicios
    const [services , setServices] = useState<Service[]>([]);

    const fechServices = async() =>{
        try {
            const res = await api.get('/services',{headers:authHeader})
            setServices(res.data)
        } catch (error) {
            console.error('No se encontraron los servicios',error)
            
        }finally{}
      }
      useEffect(()=>{
      fechServices();
         },[])
    
    
    // Endpoind para actualizar servicio
    const [openDialog, setOpenDialog]= useState(false);
    const [editingService , setEditingService ] = useState<Service | null>(null); 

    const handleUpdateService = async (data : Partial<Service>) =>{
      if(!editingService) return;

      try {
        await api.patch(`/services/${editingService.id}`,data, {headers: authHeader});
        showSnackbar('Servicio actulizado con exito', 'success');
        setOpenDialog(false);
        setEditingService(null);
        fechServices();
      } catch (error) {
        showSnackbar('Error al actualizar servicio','error')
      }
    }    

    // Endpoind para Eliminar servicio
    const [confirmDeleteOpen, setConfirmDeleteOpen]= useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>( null);

    const handleDelete = async (id: number) => {
  try {
        await api.delete(`/services/${id}`, { headers: authHeader });
        showSnackbar('Servicio eliminado con éxito', 'success');
        fechServices();
      } catch (error) {
        showSnackbar('Error al eliminar servicio', 'error');
      }
    };


    const handleCreateService = async (data: Partial<Service>) => {
      
  try {
    await api.post('/services', data, { headers: authHeader });
    
    showSnackbar('Servicio creado con éxito', 'success');
    setOpenDialog(false);
    fechServices();
  } catch (error) {
    showSnackbar('Error al crear servicio', 'error');
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
      Servicios
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
      {services.map((servicio) => {
      const IconComponent =
        serviceIcons[servicio.icon as keyof typeof serviceIcons];

      return (
        <Card
          key={servicio.id}
          sx={{
            width: '100%',
            maxWidth: 320,
            borderRadius: 2.5,
            overflow: 'hidden',
            backgroundColor: '#111',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            transition: '0.35s ease',
            cursor: 'pointer',

            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: '0 18px 45px rgba(219,213,21,0.35)',
            },
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            {/* ÍCONO */}
            {IconComponent && (
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
              }}
            >
              <IconComponent width={32} height={32} />
            </Box>
          )}


            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Keania One',
                color: '#DBD515',
                letterSpacing: 1,
                mb: 1,
              }}
            >
              {servicio.name}
            </Typography>

            <Typography variant="body2" sx={{ color: '#ccc' }}>
              {servicio.description}
            </Typography>
          </CardContent>
          {user?.role === 'admin' && (
          <Box display="flex" justifyContent="center" gap={1} mt={1}>
            <IconButton
              sx={{ color: '#DBD515' }}
              onClick={() => {
                setEditingService(servicio);
                setOpenDialog(true);
              }}
            >
              <EditIcon />
            </IconButton>

            <IconButton
              color="error"
              onClick={() => {
                setServiceToDelete(servicio);
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
    {user?.role === 'admin' && (
  <Box textAlign="center" mb={4}>
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      sx={{ backgroundColor: '#DBD515', color: '#000' }}
      onClick={() => {
        setEditingService(null);
        setOpenDialog(true);
      }}
    >
      Nuevo servicio
    </Button>
  </Box>
)}


    </Box>

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
          <ServiceDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditingService(null);
          }}
          initialData={editingService}
          
          onSubmit={editingService ? handleUpdateService : handleCreateService}
        />
    <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>

        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar el servicio{' '}
            <strong>{serviceToDelete?.name}</strong>?
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
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (serviceToDelete) {
                handleDelete(serviceToDelete.id);
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}