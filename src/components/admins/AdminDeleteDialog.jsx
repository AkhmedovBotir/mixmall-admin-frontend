import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const AdminDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  adminName,
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#ffebee', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#d32f2f' }} />
          <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
            Adminni o'chirish
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Haqiqatan ham <strong>{adminName}</strong> adminni o'chirmoqchimisiz?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bu amalni ortga qaytarib bo'lmaydi.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f5f5f5' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Bekor qilish
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            '&:hover': {
              backgroundColor: '#c62828',
            },
          }}
        >
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDeleteDialog;
