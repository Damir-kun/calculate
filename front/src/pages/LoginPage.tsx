import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthProvider';

const LoginPage = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { reload } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!login || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/v1/login', {
        login,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Авторизация успешна!');
        
        // Перенаправление в зависимости от роли пользователя
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else if (response.data.role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.detail || 'Ошибка авторизации');
      } else {
        setError('Произошла ошибка при отправке запроса');
      }
    } finally {
      setLoading(false);
      reload();
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Авторизация
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Логин"
              name="login"
              autoComplete="username"
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="#" variant="body2">
                Забыли пароль?
              </Link>
            </Box>
            <Divider sx={{ my: 2 }}>или</Divider>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                sx={{ width: '48%' }}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ width: '48%' }}
                disabled={loading}
              >
                Facebook
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 