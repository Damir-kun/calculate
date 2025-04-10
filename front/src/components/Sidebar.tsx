import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Calculate as CalculateIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import axios from '../api/axios';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'manager' | 'user';
}

const MotionListItem = motion(ListItem);
const MotionDrawer = motion(Drawer);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, logout } = useAuth();
  
  const [adminOpen, setAdminOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'manager'>('admin');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminClick = () => {
    setAdminOpen(!adminOpen);
  };

  const handleManagerClick = () => {
    setManagerOpen(!managerOpen);
  };

  const handleLoginClick = (type: 'admin' | 'manager') => {
    setLoginType(type);
    setLoginDialogOpen(true);
  };

  const handleLoginClose = () => {
    setLoginDialogOpen(false);
    setLoginError('');
    setLoginData({ email: '', password: '' });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демонстрации используем имитацию
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Имитация успешного входа
      const mockToken = `mock-token-${loginType}-${Date.now()}`;
      login(mockToken, loginType);
      
      handleLoginClose();
      navigate(loginType === 'admin' ? '/admin' : '/manager');
    } catch (error) {
      setLoginError('Ошибка входа. Проверьте данные и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Главная', icon: <DashboardIcon />, path: '/' },
    { text: 'Калькулятор', icon: <CalculateIcon />, path: '/calculator' },
  ];

  const adminItems = [
    { text: 'Управление пользователями', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Настройки системы', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const managerItems = [
    { text: 'Управление расчетами', icon: <CalculateIcon />, path: '/manager/calculations' },
    { text: 'Статистика', icon: <DashboardIcon />, path: '/manager/statistics' },
  ];

  const drawerVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -280, opacity: 0 }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <>
      <MotionDrawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        variant={isMobile ? "temporary" : "permanent"}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            borderRight: 'none',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            height: '100%',
            minHeight: '100vh',
          },
          display: isOpen ? 'block' : 'none',
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Строительный калькулятор
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.secondary.main,
              width: 40,
              height: 40
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {userRole === 'admin' ? 'Администратор' : userRole === 'manager' ? 'Менеджер' : 'Пользователь'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {userRole === 'admin' ? 'admin@example.com' : userRole === 'manager' ? 'manager@example.com' : 'user@example.com'}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <MotionListItem
              key={item.text}
              button
              onClick={() => navigate(item.path)}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </MotionListItem>
          ))}

          {userRole === 'admin' && (
            <>
              <MotionListItem
                button
                onClick={handleAdminClick}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                transition={{ delay: menuItems.length * 0.1 }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText primary="Админ панель" />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </MotionListItem>
              <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {adminItems.map((item, index) => (
                    <MotionListItem
                      key={item.text}
                      button
                      onClick={() => navigate(item.path)}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      transition={{ delay: (menuItems.length + index + 1) * 0.1 }}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </MotionListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {userRole === 'manager' && (
            <>
              <MotionListItem
                button
                onClick={handleManagerClick}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                transition={{ delay: (menuItems.length + (userRole === 'admin' ? adminItems.length + 1 : 0)) * 0.1 }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <ManagerIcon />
                </ListItemIcon>
                <ListItemText primary="Панель менеджера" />
                {managerOpen ? <ExpandLess /> : <ExpandMore />}
              </MotionListItem>
              <Collapse in={managerOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {managerItems.map((item, index) => (
                    <MotionListItem
                      key={item.text}
                      button
                      onClick={() => navigate(item.path)}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      transition={{ delay: (menuItems.length + (userRole === 'admin' ? adminItems.length + 2 : 1) + index) * 0.1 }}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </MotionListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', my: 1 }} />

          <MotionListItem
            button
            onClick={handleLogout}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: (menuItems.length + (userRole === 'admin' ? adminItems.length + 1 : 0) + (userRole === 'manager' ? managerItems.length + 1 : 0)) * 0.1 }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Выйти" />
          </MotionListItem>
        </List>
      </MotionDrawer>

      <Dialog
        open={loginDialogOpen}
        onClose={handleLoginClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {loginType === 'admin' ? 'Вход для администратора' : 'Вход для менеджера'}
        </DialogTitle>
        <DialogContent>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={loginData.email}
            onChange={handleLoginChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={loginData.password}
            onChange={handleLoginChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose}>Отмена</Button>
          <Button 
            onClick={handleLoginSubmit} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar; 