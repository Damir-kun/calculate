import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../api/axios';

interface CalculationData {
  id: string;
  title: string;
  type: string;
  parameters: {
    [key: string]: number;
  };
  result?: {
    [key: string]: number;
  };
}

const CalculationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calculation, setCalculation] = useState<CalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parameters, setParameters] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        if (id === 'new') {
          setCalculation({
            id: 'new',
            title: '',
            type: 'foundation',
            parameters: {},
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/calculation/${id}`);
        setCalculation(response.data);
        setParameters(response.data.parameters);
      } catch (error) {
        setError('Ошибка при загрузке расчёта');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [id]);

  const handleCalculate = async () => {
    try {
      const response = await axios.post('/api/calculate', {
        calc_type: calculation?.type,
        params: parameters,
        result: {},
        title: calculation?.title,
      });

      setCalculation((prev) => ({
        ...prev!,
        result: response.data.result,
      }));
    } catch (error) {
      setError('Ошибка при выполнении расчёта');
    }
  };

  const handleSave = async () => {
    try {
      if (id === 'new') {
        await axios.post('/api/calculations', {
          ...calculation,
          parameters,
        });
      } else {
        await axios.put(`/api/calculation/${id}`, {
          ...calculation,
          parameters,
        });
      }
      navigate('/dashboard');
    } catch (error) {
      setError('Ошибка при сохранении расчёта');
    }
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
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {id === 'new' ? 'Новый расчёт' : 'Детали расчёта'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название"
              value={calculation?.title}
              onChange={(e) =>
                setCalculation((prev) => ({ ...prev!, title: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Параметры расчёта
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(parameters).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={key}
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setParameters((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value),
                      }))
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          {calculation?.result && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Результаты расчёта
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(calculation.result).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Typography>
                      {key}: {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button variant="contained" onClick={handleCalculate}>
                Рассчитать
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Сохранить
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Отмена
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CalculationDetail; 