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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../api/axios';

interface Calculation {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: string;
}

const Dashboard = () => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await api.get('/api/calculations');
        setCalculations(response.data.calculations);
      } catch (error) {
        console.error('Error fetching calculations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, []);

  const handleNewCalculation = () => {
    navigate('/calculation/new');
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
      <Grid container spacing={3}>
        {calculations.map((calc) => (
          <Grid item xs={12} sm={6} md={4} key={calc.id}>
            <Card
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/calculation/${calc.id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {calc.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Тип: {calc.type}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Создан: {new Date(calc.createdAt).toLocaleDateString()}
                </Typography>
                <Typography
                  color={calc.status === 'completed' ? 'success' : 'warning'}
                >
                  Статус: {calc.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 