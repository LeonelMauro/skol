import {useAuth} from '../../context/AuthContext';
import api from '../../services/api';
import {  useEffect, useState } from 'react';
import type { Service } from '../../types/services';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,  Divider,  IconButton,  Snackbar, Typography } from '@mui/material';
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
    backgroundColor: '#0F0F0F',
    pt: { xs: 10, md: 12 },
  }}
>
  {/* CONTENEDOR CENTRAL */}
  <Box
    sx={{
      maxWidth: 1200,
      mx: 'auto',
      px: { xs: 2, md: 4 },
      textAlign: 'center',
    }}
  >
    {/* TÍTULO */}
    <Typography
      variant="h4"
      sx={{
        fontFamily: 'Keania One',
        color: '#DBD515',
        mb: 1,
      }}
    >
      Servicios
    </Typography>

    {/* SUBTÍTULO */}
    <Typography sx={{ color: '#ccc', mb: 3 }}>
      Administración de servicios disponibles
    </Typography>

    <Divider sx={{ mb: 4 }} />

    {/* GRID DE SERVICIOS */}
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
      {services.map((servicio) => {
        const IconComponent =
          serviceIcons[servicio.icon as keyof typeof serviceIcons];

        return (
          <Card
            key={servicio.id}
            sx={{
              width: '100%',
              borderRadius: 2,
              backgroundColor: '#111',
              transition: '0.25s',
              cursor: 'pointer',

              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: '0 12px 28px rgba(219,213,21,0.25)',
              },
            }}
          >
            <CardContent
              sx={{
                textAlign: 'center',
                py: { xs: 1.2, sm: 2 },
                px: { xs: 1, sm: 2 },
              }}
            >
              {IconComponent && (
                <Box
                  sx={{
                    width: { xs: 40, sm: 56 },
                    height: { xs: 40, sm: 56 },
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: { xs: 1, sm: 2 },
                    mx: 'auto',
                  }}
                >
                  <IconComponent width={22} height={22} />
                </Box>
              )}

              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Keania One',
                  color: '#DBD515',
                  fontSize: { xs: 13, sm: 15 },
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {servicio.name}
              </Typography>

              <Typography
                sx={{
                  color: '#ccc',
                  fontSize: { xs: 11, sm: 13 },
                  lineHeight: 1.3,
                }}
              >
                {servicio.description}
              </Typography>
            </CardContent>

            {/* ACCIONES ADMIN */}
            {user?.role === 'admin' && (
              <Box
                display="flex"
                justifyContent="center"
                gap={1}
                pb={1}
              >
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
    </Box>

    {/* BOTÓN NUEVO SERVICIO */}
    {user?.role === 'admin' && (
      <Box textAlign="center" mt={4}>
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

  {/* SNACKBAR + DIÁLOGOS (SIN CAMBIOS) */}
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
)}