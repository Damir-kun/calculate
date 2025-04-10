import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useMediaQuery, CssBaseline } from '@mui/material';
import { 
  Box, 
  IconButton, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Fab,
  Zoom,
  useScrollTrigger,
  CircularProgress,
  Backdrop
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import CalculationPage from './pages/CalculationPage';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';

// Компонент для кнопки прокрутки вверх
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  );
}

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  // Имитация загрузки данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Закрываем сайдбар при изменении маршрута на мобильных устройствах
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location, isMobile, sidebarOpen]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20
    },
    animate: {
      opacity: 1,
      x: 0
    },
    exit: {
      opacity: 0,
      x: 20
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && (
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
            color: theme.palette.text.primary
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Строительный калькулятор
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {userRole === 'admin' ? 'Администратор' : userRole === 'manager' ? 'Менеджер' : 'Пользователь'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isAuthenticated && (
          <>
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              userRole={userRole || 'user'}
            />
            {sidebarOpen && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: theme.zIndex.drawer - 1,
                  display: { sm: 'none' }
                }}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${sidebarOpen ? 280 : 0}px)` },
            ml: { sm: sidebarOpen ? '280px' : 0 },
            mt: isAuthenticated ? '64px' : 0,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <div id="back-to-top-anchor" />
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/calculator" element={<CalculationPage />} />
                  <Route
                    path="/admin/*"
                    element={
                      userRole === 'admin' ? (
                        <AdminDashboard />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="/manager/*"
                    element={
                      userRole === 'manager' ? (
                        <ManagerDashboard />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route path="/" element={<Navigate to="/calculator" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Container>
        </Box>
      </Box>

      <ScrollTop />

      <Backdrop
        sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 2 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 