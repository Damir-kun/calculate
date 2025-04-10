import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const ManagerDashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const calculations = [
    { id: 1, type: 'foundation', address: 'ул. Ленина, 1', date: '2024-04-09', status: 'completed' },
    { id: 2, type: 'frame', address: 'ул. Пушкина, 10', date: '2024-04-08', status: 'in_progress' },
    { id: 3, type: 'staircase', address: 'пр. Мира, 25', date: '2024-04-07', status: 'pending' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <MotionCard variants={itemVariants}>
              <CardHeader
                title="Управление расчетами"
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    color="primary"
                  >
                    Новый расчет
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {calculations.map((calc) => (
                    <ListItem
                      key={calc.id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <CalculateIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Расчет ${calc.type}`}
                        secondary={`Адрес: ${calc.address} | Дата: ${calc.date}`}
                      />
                      <Box sx={{ width: '100px', ml: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calc.status === 'completed' ? 100 : calc.status === 'in_progress' ? 50 : 0}
                          color={calc.status === 'completed' ? 'success' : calc.status === 'in_progress' ? 'primary' : 'warning'}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard variants={itemVariants}>
              <CardHeader
                title="Статистика"
                avatar={<TrendingUpIcon />}
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Всего расчетов"
                      secondary="150"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Завершенные"
                      secondary="120"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="В процессе"
                      secondary="20"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Ожидающие"
                      secondary="10"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ManagerDashboard; 