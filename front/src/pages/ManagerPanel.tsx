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
} from '@mui/material';
import axios from '../api/axios';

interface Material {
  id: number;
  name: string;
  description: string;
  selling_price: number;
}

interface Calculation {
  id: number;
  title: string;
  type: string;
  parameters: any;
  result: any;
  created_at: string;
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
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
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
    id: `manager-tab-${index}`,
    'aria-controls': `manager-tabpanel-${index}`,
  };
}

const ManagerPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMaterial, setNewMaterial] = useState({ name: '', description: '', selling_price: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchCalculations();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/v1/materials');
      setMaterials(response.data.materials);
    } catch (err) {
      setError('Ошибка при загрузке материалов');
    }
  };

  const fetchCalculations = async () => {
    try {
      const response = await axios.get('/api/v1/manager/calculations');
      setCalculations(response.data.calculations);
    } catch (err) {
      setError('Ошибка при загрузке расчетов');
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

  const handleUpdatePrice = async () => {
    if (!selectedMaterial) return;
    try {
      await axios.post('/api/v1/manager/update_material_price', {
        material_name: selectedMaterial.name,
        new_selling_price: parseFloat(newPrice)
      });
      setOpenDialog(false);
      setNewPrice('');
      fetchMaterials();
    } catch (err) {
      setError('Ошибка при обновлении цены');
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
        Панель менеджера
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
          <Tab label="Управление материалами" {...a11yProps(0)} />
          <Tab label="Расчеты пользователей" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
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
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>{material.name}</TableCell>
                          <TableCell>{material.description}</TableCell>
                          <TableCell>{material.selling_price} ₽</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setSelectedMaterial(material);
                                setOpenDialog(true);
                              }}
                            >
                              Изменить цену
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Расчеты пользователей
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Параметры</TableCell>
                    <TableCell>Результат</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>{calc.title}</TableCell>
                      <TableCell>{calc.type}</TableCell>
                      <TableCell>{new Date(calc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{JSON.stringify(calc.parameters)}</TableCell>
                      <TableCell>{JSON.stringify(calc.result)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Изменение цены материала</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Новая цена"
            type="number"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleUpdatePrice} variant="contained">
            Обновить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagerPanel; 