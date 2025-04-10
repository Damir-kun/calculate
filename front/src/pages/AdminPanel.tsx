import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from '../api/axios';

interface User {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Material {
  id: number;
  name: string;
  description: string;
  selling_price: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMaterial, setNewMaterial] = useState({ name: '', description: '', selling_price: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMaterials();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/v1/materials');
      setMaterials(response.data.materials);
    } catch (err) {
      setError('Ошибка при загрузке материалов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    try {
      await axios.post('/api/v1/materials/add', newMaterial);
      setNewMaterial({ name: '', description: '', selling_price: '' });
      fetchMaterials();
    } catch (err) {
      setError('Ошибка при добавлении материала');
    }
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await axios.post('/api/v1/admin/update_user_role', {
        user_id: selectedUser.id,
        new_role: newRole
      });
      setOpenDialog(false);
      setNewRole('');
      fetchUsers();
    } catch (err) {
      setError('Ошибка при обновлении роли пользователя');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Панель администратора
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Управление пользователями" {...a11yProps(0)} />
          <Tab label="Управление материалами" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Список пользователей
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Логин</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Фамилия</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.login}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setOpenDialog(true);
                          }}
                        >
                          Изменить роль
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Добавление материала
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Название"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Описание"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Цена"
                      type="number"
                      value={newMaterial.selling_price}
                      onChange={(e) => setNewMaterial({ ...newMaterial, selling_price: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Button variant="contained" onClick={handleAddMaterial}>
                  Добавить материал
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Список материалов
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Цена</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>{material.id}</TableCell>
                          <TableCell>{material.name}</TableCell>
                          <TableCell>{material.description}</TableCell>
                          <TableCell>{material.selling_price} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Изменение роли пользователя</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Новая роль</InputLabel>
            <Select
              labelId="role-select-label"
              value={newRole}
              label="Новая роль"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="client">Клиент</MenuItem>
              <MenuItem value="manager">Менеджер</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleUpdateUserRole} variant="contained">
            Обновить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 