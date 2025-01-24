import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const BrandList = ({
  brands,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Brend nomi</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand._id} hover>
              <TableCell>{brand.name}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEdit(brand)}
                  size="small"
                  sx={{
                    color: '#1a237e',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(brand._id)}
                  size="small"
                  sx={{
                    color: '#d32f2f',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {brands.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">
                  Brendlar topilmadi
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BrandList;
