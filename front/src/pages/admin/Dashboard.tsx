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
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const AdminDashboard: React.FC = () => {
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
                title="Управление пользователями"
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    color="primary"
                  >
                    Добавить пользователя
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {['admin@example.com', 'manager@example.com', 'user@example.com'].map((user, index) => (
                    <ListItem
                      key={index}
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
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={user}
                        secondary={`Роль: ${user.split('@')[0]}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard variants={itemVariants}>
              <CardHeader
                title="Настройки системы"
                avatar={<SettingsIcon />}
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Версия системы"
                      secondary="1.0.0"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Последнее обновление"
                      secondary="2024-04-09"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Статус системы"
                      secondary="Активна"
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

export default AdminDashboard; 