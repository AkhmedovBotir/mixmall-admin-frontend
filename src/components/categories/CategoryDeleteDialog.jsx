import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Close as CloseIcon } from '@mui/icons-material';

const CategoryDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  categoryName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
            Kategoriyani o'chirish
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
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography>
          Haqiqatan ham <strong>{categoryName}</strong> kategoriyasini o'chirmoqchimisiz?
          Bu kategoriyaga tegishli barcha ma'lumotlar o'chiriladi.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f5f5f5' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.1)'
            }
          }}
        >
          Bekor qilish
        </Button>
        <LoadingButton
          onClick={onConfirm}
          loading={loading}
          variant="contained"
          color="error"
          sx={{
            px: 3,
            '&.Mui-disabled': {
              backgroundColor: 'rgba(211, 47, 47, 0.3)'
            }
          }}
        >
          O'chirish
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDeleteDialog;
