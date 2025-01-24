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
  Box,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../../api/axios';

const CategoryViewDialog = ({
  open,
  onClose,
  category,
}) => {
  if (!category) return null;

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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Kategoriya ma'lumotlari
          </Typography>
          <IconButton
            onClick={onClose}
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

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={category.image ? `https://adderapi.mixmall.uz${category.image}` : undefined}
              alt={category.name}
              sx={{ width: 120, height: 120 }}
              variant="rounded"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Kategoriya nomi
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {category.name}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Subkategoriyalar
            </Typography>
            {category.subcategories?.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {category.subcategories.map((sub) => (
                  <Chip
                    key={sub._id || sub}
                    label={typeof sub === 'string' ? sub : sub.name}
                    sx={{
                      backgroundColor: '#e8eaf6',
                      color: '#1a237e',
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Subkategoriyalar yo'q
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            borderColor: '#1a237e',
            color: '#1a237e',
            '&:hover': {
              borderColor: '#1a237e',
              backgroundColor: 'rgba(26, 35, 126, 0.1)'
            }
          }}
        >
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryViewDialog;
