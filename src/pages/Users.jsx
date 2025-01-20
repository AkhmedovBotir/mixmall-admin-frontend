import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  TablePagination,
  FormControlLabel,
  Checkbox,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  CircularProgress
} from "@mui/material"
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from "@mui/icons-material"
import axios from "axios"

const API_URL = "https://adderapi.mixmall.uz/api"

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [newAddress, setNewAddress] = useState({
    address: "",
    apartment: "",
    entrance: "",
    floor: "",
    domofonCode: "",
    courierComment: "",
    isMain: false
  })
  const [addresses, setAddresses] = useState([])
  const [editingAddressIndex, setEditingAddressIndex] = useState(null)
  const [editingAddress, setEditingAddress] = useState({
    address: "",
    apartment: "",
    entrance: "",
    floor: "",
    domofonCode: "",
    courierComment: "",
    isMain: false
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/users', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      // Server javobini to'g'ridan-to'g'ri olish
      setUsers(response.data)
      
    } catch (error) {
      console.error('Error fetching users:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Foydalanuvchilar ma\'lumotlarini olishda xatolik yuz berdi',
        severity: "error"
      })
      setUsers([]) // Xatolik bo'lganda bo'sh ro'yxat ko'rsatish
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewUser = user => {
    setSelectedUser(user)
    setOpenViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`/api/users/${userId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi',
          severity: 'success'
        });
        fetchUsers(); // Ro'yxatni yangilash
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Foydalanuvchini o\'chirishda xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await axios.put(`/api/users/${userData._id}`, userData, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Foydalanuvchi ma\'lumotlari muvaffaqiyatli yangilandi',
          severity: 'success'
        });
        fetchUsers(); // Ro'yxatni yangilash
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Foydalanuvchi ma\'lumotlarini yangilashda xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  const handleEditClick = user => {
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      newPassword: "",
      confirmPassword: ""
    })
    setAddresses(user.addresses || [])
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setSelectedUser(null)
    setEditFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      newPassword: "",
      confirmPassword: ""
    })
    setAddresses([])
    setTabValue(0)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleAddAddress = () => {
    if (!newAddress.address) return

    if (newAddress.isMain) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isMain: false })))
    }

    setAddresses(prev => [...prev, { ...newAddress }])
    setNewAddress({
      address: "",
      apartment: "",
      entrance: "",
      floor: "",
      domofonCode: "",
      courierComment: "",
      isMain: false
    })
  }

  const handleRemoveAddress = index => {
    setAddresses(prev => prev.filter((_, i) => i !== index))
  }

 

  const handleEditAddress = index => {
    setEditingAddressIndex(index)
    setEditingAddress({ ...addresses[index] })
  }

  const handleSaveAddress = () => {
    if (editingAddressIndex === null) return

    setAddresses(prev =>
      prev.map((addr, index) => {
        if (index === editingAddressIndex) {
          if (editingAddress.isMain) {
            // Agar yangi manzil asosiy bo'lsa, boshqa manzillarni asosiy emas qilamiz
            return { ...editingAddress, isMain: true }
          }
          return editingAddress
        }
        // Agar yangi manzil asosiy bo'lsa, boshqa manzillarni asosiy emas qilamiz
        if (editingAddress.isMain) {
          return { ...addr, isMain: false }
        }
        return addr
      })
    )

    setEditingAddressIndex(null)
    setEditingAddress({
      address: "",
      apartment: "",
      entrance: "",
      floor: "",
      domofonCode: "",
      courierComment: "",
      isMain: false
    })
  }

  const handleCancelEditAddress = () => {
    setEditingAddressIndex(null)
    setEditingAddress({
      address: "",
      apartment: "",
      entrance: "",
      floor: "",
      domofonCode: "",
      courierComment: "",
      isMain: false
    })
  }

  const handleEditSubmit = async () => {
    if (!selectedUser) return

    try {
      const updateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phoneNumber: editFormData.phoneNumber,
        addresses
      }

      // Agar parol o'zgartirilayotgan bo'lsa
      if (editFormData.newPassword) {
        if (editFormData.newPassword !== editFormData.confirmPassword) {
          setSnackbar({
            open: true,
            message: "Yangi parol va tasdiqlash paroli bir xil emas",
            severity: "error"
          })
          return
        }
        updateData.newPassword = editFormData.newPassword
      }

      await handleUpdateUser({ ...selectedUser, ...updateData })

      setSnackbar({
        open: true,
        message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi",
        severity: "success"
      })

      fetchUsers()
      handleEditClose()
    } catch (error) {
      console.error("Foydalanuvchi ma'lumotlarini yangilashda xatolik:", error)
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Foydalanuvchi ma'lumotlarini yangilashda xatolik yuz berdi",
        severity: "error"
      })
    }
  }

  const filteredUsers = users?.filter(
    user =>
      (user?.firstName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (user?.lastName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (user?.phoneNumber || "").includes(searchQuery)
  ) || []

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {loading && <LinearProgress />}

      <Typography variant="h5" component="h1" gutterBottom>
        Foydalanuvchilar
      </Typography>

      {/* Filter va qidiruv paneli */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={10}>
            <TextField
              fullWidth
              variant="outlined"
              label="Qidirish"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ism, familiya yoki telefon raqami"
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2} container justifyContent="flex-end">
            <IconButton
              onClick={fetchUsers}
              disabled={isRefreshing}
              color="primary"
              title="Yangilash"
              sx={{ width: 48, height: 48 }}
            >
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Foydalanuvchilar jadvali */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ism</TableCell>
              <TableCell>Familiya</TableCell>
              <TableCell>Telefon raqami</TableCell>
              <TableCell>Manzillar soni</TableCell>
              <TableCell>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{user.addresses?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton
                        color="info"
                        onClick={() => handleViewUser(user)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Qatorlar soni:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} dan ${count} ta`
          }
        />
      </TableContainer>

      {/* Foydalanuvchi ma'lumotlari modali */}
      <Dialog
        open={openDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>Foydalanuvchi ma'lumotlari</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={
                    selectedUser.image
                      ? `${API_URL}/uploads/${selectedUser.image.replace(
                          /^\/uploads\//,
                          ""
                        )}`
                      : undefined
                  }
                  alt={selectedUser.firstName}
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {selectedUser.firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography color="textSecondary">
                    {selectedUser.phoneNumber}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Manzillar
              </Typography>
              <List>
                {selectedUser.addresses.map((address, index) => (
                  <div key={address._id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <>
                            {address.isMain && (
                              <Chip
                                label="Asosiy"
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            )}
                            {address.address}
                          </>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {address.apartment &&
                              `Kvartira: ${address.apartment}`}
                            {address.entrance &&
                              `, Podezd: ${address.entrance}`}
                            {address.floor && `, Qavat: ${address.floor}`}
                            {address.domofonCode &&
                              `, Domofon: ${address.domofonCode}`}
                            {address.courierComment && (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mt: 0.5 }}
                              >
                                Kuryer uchun izoh: {address.courierComment}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < selectedUser.addresses.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Yopish</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Ko'rish modali */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Foydalanuvchi ma'lumotlari</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Ism:</strong> {selectedUser.firstName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Familiya:</strong> {selectedUser.lastName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Telefon:</strong> {selectedUser.phoneNumber}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Manzillar soni:</strong>{" "}
                {selectedUser.addresses?.length || 0}
              </Typography>
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Manzillar
                  </Typography>
                  {selectedUser.addresses.map((address, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 2, pl: 2, borderLeft: "2px solid #eee" }}
                    >
                      <Typography variant="body1">
                        <strong>Manzil:</strong> {address.address}
                      </Typography>
                      {address.apartment && (
                        <Typography variant="body2">
                          <strong>Kvartira:</strong> {address.apartment}
                        </Typography>
                      )}
                      {address.entrance && (
                        <Typography variant="body2">
                          <strong>Kirish:</strong> {address.entrance}
                        </Typography>
                      )}
                      {address.floor && (
                        <Typography variant="body2">
                          <strong>Qavat:</strong> {address.floor}
                        </Typography>
                      )}
                      {address.domofonCode && (
                        <Typography variant="body2">
                          <strong>Domofon kodi:</strong> {address.domofonCode}
                        </Typography>
                      )}
                      {address.courierComment && (
                        <Typography variant="body2">
                          <strong>Izoh:</strong> {address.courierComment}
                        </Typography>
                      )}
                      {address.isMain && (
                        <Chip
                          label="Asosiy manzil"
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Yopish</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Foydalanuvchi ma'lumotlarini tahrirlash</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Asosiy ma'lumotlar" />
              <Tab label="Manzillar" />
              <Tab label="Parolni o'zgartirish" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Ism"
                fullWidth
                value={editFormData.firstName}
                onChange={e =>
                  setEditFormData(prev => ({
                    ...prev,
                    firstName: e.target.value
                  }))
                }
              />
              <TextField
                label="Familiya"
                fullWidth
                value={editFormData.lastName}
                onChange={e =>
                  setEditFormData(prev => ({
                    ...prev,
                    lastName: e.target.value
                  }))
                }
              />
              <TextField
                label="Telefon raqami"
                fullWidth
                value={editFormData.phoneNumber}
                onChange={e =>
                  setEditFormData(prev => ({
                    ...prev,
                    phoneNumber: e.target.value
                  }))
                }
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6">Yangi manzil qo'shish</Typography>
              <TextField
                label="Manzil"
                fullWidth
                value={newAddress.address}
                onChange={e =>
                  setNewAddress(prev => ({ ...prev, address: e.target.value }))
                }
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Kvartira"
                  value={newAddress.apartment}
                  onChange={e =>
                    setNewAddress(prev => ({
                      ...prev,
                      apartment: e.target.value
                    }))
                  }
                />
                <TextField
                  label="Kirish"
                  value={newAddress.entrance}
                  onChange={e =>
                    setNewAddress(prev => ({
                      ...prev,
                      entrance: e.target.value
                    }))
                  }
                />
                <TextField
                  label="Qavat"
                  value={newAddress.floor}
                  onChange={e =>
                    setNewAddress(prev => ({ ...prev, floor: e.target.value }))
                  }
                />
                <TextField
                  label="Domofon kodi"
                  value={newAddress.domofonCode}
                  onChange={e =>
                    setNewAddress(prev => ({
                      ...prev,
                      domofonCode: e.target.value
                    }))
                  }
                />
              </Box>
              <TextField
                label="Kuryer uchun izoh"
                fullWidth
                multiline
                rows={2}
                value={newAddress.courierComment}
                onChange={e =>
                  setNewAddress(prev => ({
                    ...prev,
                    courierComment: e.target.value
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAddress.isMain}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        isMain: e.target.checked
                      }))
                    }
                  />
                }
                label="Asosiy manzil"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddAddress}
                disabled={!newAddress.address}
              >
                Manzil qo'shish
              </Button>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Mavjud manzillar
              </Typography>
              <List>
                {addresses.map((address, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: "column",
                      alignItems: "stretch",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      mb: 1,
                      p: 2
                    }}
                  >
                    {editingAddressIndex === index ? (
                      // Tahrirlash holati
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          width: "100%"
                        }}
                      >
                        <TextField
                          label="Manzil"
                          fullWidth
                          value={editingAddress.address}
                          onChange={e =>
                            setEditingAddress(prev => ({
                              ...prev,
                              address: e.target.value
                            }))
                          }
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2
                          }}
                        >
                          <TextField
                            label="Kvartira"
                            value={editingAddress.apartment}
                            onChange={e =>
                              setEditingAddress(prev => ({
                                ...prev,
                                apartment: e.target.value
                              }))
                            }
                          />
                          <TextField
                            label="Kirish"
                            value={editingAddress.entrance}
                            onChange={e =>
                              setEditingAddress(prev => ({
                                ...prev,
                                entrance: e.target.value
                              }))
                            }
                          />
                          <TextField
                            label="Qavat"
                            value={editingAddress.floor}
                            onChange={e =>
                              setEditingAddress(prev => ({
                                ...prev,
                                floor: e.target.value
                              }))
                            }
                          />
                          <TextField
                            label="Domofon kodi"
                            value={editingAddress.domofonCode}
                            onChange={e =>
                              setEditingAddress(prev => ({
                                ...prev,
                                domofonCode: e.target.value
                              }))
                            }
                          />
                        </Box>
                        <TextField
                          label="Kuryer uchun izoh"
                          fullWidth
                          multiline
                          rows={2}
                          value={editingAddress.courierComment}
                          onChange={e =>
                            setEditingAddress(prev => ({
                              ...prev,
                              courierComment: e.target.value
                            }))
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editingAddress.isMain}
                              onChange={e =>
                                setEditingAddress(prev => ({
                                  ...prev,
                                  isMain: e.target.checked
                                }))
                              }
                            />
                          }
                          label="Asosiy manzil"
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                            mt: 1
                          }}
                        >
                          <Button onClick={handleCancelEditAddress}>
                            Bekor qilish
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveAddress}
                            disabled={!editingAddress.address}
                          >
                            Saqlash
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      // Ko'rish holati
                      <>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {address.address}
                            {address.isMain && (
                              <Chip
                                label="Asosiy"
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[
                              address.apartment &&
                                `Kvartira: ${address.apartment}`,
                              address.entrance && `Kirish: ${address.entrance}`,
                              address.floor && `Qavat: ${address.floor}`,
                              address.domofonCode &&
                                `Domofon: ${address.domofonCode}`
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>
                          {address.courierComment && (
                            <Typography variant="body2" color="text.secondary">
                              Izoh: {address.courierComment}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditAddress(index)}
                          >
                            Tahrirlash
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveAddress(index)}
                          >
                            O'chirish
                          </Button>
                        </Box>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Yangi parol"
                type="password"
                fullWidth
                value={editFormData.newPassword}
                onChange={e =>
                  setEditFormData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))
                }
              />
              <TextField
                label="Yangi parolni tasdiqlash"
                type="password"
                fullWidth
                value={editFormData.confirmPassword}
                onChange={e =>
                  setEditFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))
                }
              />
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Bekor qilish</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
