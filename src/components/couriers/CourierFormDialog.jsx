import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const initialFormData = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  password: '',
  vehicle: '',
  vehicleNumber: '',
  status: 'inactive'
};

const CourierFormDialog = ({
  open,
  onClose,
  onSubmit,
  courier,
  mode,
}) => {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (courier && mode === 'edit') {
      setFormData({
        firstName: courier.firstName || '',
        lastName: courier.lastName || '',
        phoneNumber: courier.phoneNumber || '',
        vehicle: courier.vehicle || '',
        vehicleNumber: courier.vehicleNumber || '',
        status: courier.status || 'inactive'
      });
    } else {
      setFormData(initialFormData);
    }
  }, [courier, mode, open]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      if (mode === 'add') {
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    const { firstName, lastName, phoneNumber, vehicle, vehicleNumber, password } = formData;
    if (mode === 'add') {
      return (
        firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        phoneNumber.trim() !== '' &&
        vehicle.trim() !== '' &&
        vehicleNumber.trim() !== '' &&
        password?.trim() !== ''
      );
    }
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      vehicle.trim() !== '' &&
      vehicleNumber.trim() !== ''
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        elevation: 1,
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            {mode === 'add' ? 'Yangi kuryer qo\'shish' : 'Kuryerni tahrirlash'}
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: '#1a237e',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="Ism"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
                helperText="2-50 ta belgi"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a237e',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Familiya"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange}
                helperText="2-50 ta belgi"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a237e',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="Telefon"
                fullWidth
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+998901234567"
                helperText="+998XXXXXXXXX formatida"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a237e',
                  },
                }}
              />
            </Grid>
            {mode === 'add' && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Parol"
                  type="password"
                  fullWidth
                  required
                  value={formData.password || ''}
                  onChange={handleChange}
                  helperText="Kamida 4 ta belgi"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a237e',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1a237e',
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                name="vehicle"
                label="Transport"
                fullWidth
                required
                value={formData.vehicle}
                onChange={handleChange}
                helperText="Masalan: Nexia"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a237e',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vehicleNumber"
                label="Transport raqami"
                fullWidth
                required
                value={formData.vehicleNumber}
                onChange={handleChange}
                helperText="Masalan: 01A777AA"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a237e',
                  },
                }}
              />
            </Grid>
            {mode === 'edit' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a237e',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a237e',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a237e',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1a237e',
                      },
                    }}
                  >
                    <MenuItem value="active">Faol</MenuItem>
                    <MenuItem value="inactive">Faol emas</MenuItem>
                    <MenuItem value="busy">Band</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={handleClose}
            sx={{
              color: '#1a237e',
              borderColor: '#1a237e',
              '&:hover': {
                borderColor: '#1a237e',
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid()}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1'
              },
              '&.Mui-disabled': {
                backgroundColor: '#e0e0e0'
              }
            }}
          >
            {mode === 'add' ? 'Qo\'shish' : 'Saqlash'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CourierFormDialog;
