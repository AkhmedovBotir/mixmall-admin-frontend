import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CourierDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  courierName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
            Kuryerni o'chirish
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography>
          Haqiqatan ham <strong>{courierName}</strong> ni o'chirib tashlamoqchimisiz?
        </Typography>
        <Typography color="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
          Diqqat: Bu amalni ortga qaytarib bo'lmaydi!
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Bekor qilish
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            '&:hover': {
              backgroundColor: '#b71c1c'
            }
          }}
        >
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourierDeleteDialog;
