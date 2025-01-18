import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Agar foydalanuvchi tizimga kirgan bo'lsa, dashboardga yo'naltirish
  useEffect(() => {
    const token = localStorage.getItem('token');
    const admin = localStorage.getItem('admin');
    if (token && admin) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Email validatsiyasi
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase())) {
      setError('Email noto\'g\'ri formatda');
      setLoading(false);
      return;
    }

    // Parol validatsiyasi
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://adderapi.mixmall.uz/api/admins/login', {
        email: email.toLowerCase(),
        password
      });

      const { success, data, message } = response.data;

      if (success && data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('permissions', JSON.stringify(data.admin.permissions || []));
        
        // Keyingi so'rovlar uchun token o'rnatish
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        navigate('/');
      } else {
        setError(message || 'Login jarayonida xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            setError(data.message || 'Email yoki parol noto\'g\'ri formatda');
            break;
          case 401:
            setError(data.message || 'Email yoki parol noto\'g\'ri');
            break;
          case 403:
            setError(data.message || 'Sizning akkauntingiz bloklangan');
            break;
          case 500:
            setError(data.message || 'Serverda xatolik yuz berdi');
            break;
          default:
            setError('Login jarayonida xatolik yuz berdi');
        }
      } else {
        setError('Server bilan bog\'lanishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value.trim());
    } else if (name === 'password') {
      setPassword(value.trim());
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'url(https://source.unsplash.com/random/1920x1080/?abstract,minimal) center/cover no-repeat fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              width: '100%'
            }}
          >
            <Typography
              component="h1"
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 700,
                color: '#1976d2',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Admin Panel
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              name="email"
              label="Email"
              type="email"
              value={email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#1976d2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#1976d2',
                  '&.Mui-focused': {
                    color: '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#000',
                },
              }}
            />

            <TextField
              fullWidth
              required
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#1976d2' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff sx={{ color: '#1976d2' }} /> : <Visibility sx={{ color: '#1976d2' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#1976d2',
                  '&.Mui-focused': {
                    color: '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#000',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                position: 'relative',
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
                '&:disabled': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  opacity: 0.7,
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              ) : (
                'Kirish'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
