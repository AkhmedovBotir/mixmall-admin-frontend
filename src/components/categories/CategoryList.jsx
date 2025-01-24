import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const CategoryList = ({ categories, onEdit, onDelete }) => {
  if (!categories?.length) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rasm</TableCell>
              <TableCell>Nomi</TableCell>
              <TableCell>Subkategoriyalar</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary">
                  Kategoriyalar mavjud emas
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rasm</TableCell>
            <TableCell>Nomi</TableCell>
            <TableCell>Subkategoriyalar</TableCell>
            <TableCell align="right">Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category._id}>
              <TableCell>
                <Avatar
                  src={category.image ? `https://adderapi.mixmall.uz${category.image}` : undefined}
                  alt={category.name}
                  variant="rounded"
                  sx={{ width: 50, height: 50 }}
                />
              </TableCell>
              
              <TableCell>
                <Typography variant="subtitle1">
                  {category.name}
                </Typography>
              </TableCell>
              
              <TableCell>
                {category.subcategories?.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {category.subcategories.map((sub, index) => (
                      <Chip
                        key={sub._id || index}
                        label={sub.name}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Subkategoriyalar yo'q
                  </Typography>
                )}
              </TableCell>
              
              <TableCell align="right">
                <IconButton
                  onClick={() => onEdit(category)}
                  size="small"
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(category)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoryList;
