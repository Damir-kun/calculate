import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api/axios';

interface Calculation {
  id: string;
  type: string;
  parameters: {
    [key: string]: any;
  };
  result: {
    [key: string]: any;
  };
  created_at: string;
}

const Calculations = () => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await api.get('/api/v1/calculations');
        if (response.data.calculations) {
          setCalculations(response.data.calculations);
        } else {
          setCalculations([]);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке расчетов:', error);
        setError(error.response?.data?.detail || 'Ошибка при загрузке расчетов');
        setCalculations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, []);

  const handleNewCalculation = () => {
    navigate('/calculation/new');
  };

  const handleDeleteCalculation = async (id: string) => {
    try {
      await api.delete(`/api/v1/calculation/${id}`);
      setCalculations(calculations.filter(calc => calc.id !== id));
    } catch (error: any) {
      console.error('Ошибка при удалении расчета:', error);
      setError(error.response?.data?.detail || 'Ошибка при удалении расчета');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4">Мои расчёты</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewCalculation}
        >
          Новый расчёт
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {calculations.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center" color="textSecondary">
                  У вас пока нет сохраненных расчетов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          calculations.map((calc) => (
            <Grid item xs={12} sm={6} md={4} key={calc.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" gutterBottom>
                      {calc.type}
                    </Typography>
                    <Box>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/calculation/${calc.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCalculation(calc.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Создан: {formatDate(calc.created_at)}
                  </Typography>
                  {calc.result && (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Общая стоимость: {calc.result.cost?.toLocaleString('ru-RU')} ₽
                      </Typography>
                      {calc.result.volume && (
                        <Typography variant="body2" color="textSecondary">
                          Общий объем: {calc.result.volume} м³
                        </Typography>
                      )}
                      {calc.result.area && (
                        <Typography variant="body2" color="textSecondary">
                          Общая площадь: {calc.result.area} м²
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Calculations; 