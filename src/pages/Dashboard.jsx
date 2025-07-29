import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckSquare,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const pending = tasks.filter(task => task.status === 'Pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, completionRate };
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', minHeight: 140 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography color="text.secondary" gutterBottom variant="body2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ 
                mt: 1,
                wordBreak: 'break-word',
                lineHeight: 1.4
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              ml: 2,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date < today) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getDateColor = (dateString) => {
    if (!dateString) return 'default';
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'primary';
    } else if (date < today) {
      return 'error';
    } else {
      return 'success';
    }
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks
      .filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate <= nextWeek && task.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    
    return tasks
      .filter(task => {
        const taskDate = new Date(task.date);
        return taskDate < today && task.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const TaskList = ({ tasks, title, icon, emptyMessage, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          {icon}
          <Typography variant="h6" color={`${color}.main`}>
            {title}
          </Typography>
        </Box>
        {tasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {emptyMessage}
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {tasks.map((task, index) => (
              <Box key={task._id}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          mb: 0.5,
                        }}
                      >
                        {task.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          {task.timeEstimate} min • {task.priority}
                        </Typography>
                        <Chip
                          icon={<Calendar size={16} />}
                          label={formatDate(task.date)}
                          color={getDateColor(task.date)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                  <Chip
                    label={task.status}
                    color={
                      task.status === 'Completed' ? 'success' :
                      task.status === 'In Progress' ? 'warning' : 'info'
                    }
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const RecentTasks = () => {
    // Sort tasks by date (most recent first) and take the first 5
    const recentTasks = tasks
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Recent Tasks
          </Typography>
          {recentTasks.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No tasks yet. Create your first task to get started!
            </Typography>
          ) : (
            <Box>
              {recentTasks.map((task, index) => (
                <Box
                  key={task._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    py: 2,
                    borderBottom: index < recentTasks.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 0,
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="medium" 
                      sx={{ 
                        mb: 0.5,
                        wordBreak: 'break-word',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {task.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {task.timeEstimate} min • {task.priority} priority
                      </Typography>
                      <Chip
                        icon={<Calendar size={16} />}
                        label={formatDate(task.date)}
                        color={getDateColor(task.date)}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                  <Chip
                    label={task.status}
                    color={
                      task.status === 'Completed' ? 'success' :
                      task.status === 'In Progress' ? 'warning' : 'info'
                    }
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
      </Box>
    );
  }

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your task management progress
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<CheckSquare size={20} />}
            color="primary"
            subtitle="All tasks created"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckSquare size={20} />}
            color="success"
            subtitle={`${stats.completionRate}% completion rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock size={20} />}
            color="warning"
            subtitle="Currently working on"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<TrendingUp size={20} />}
            color="info"
            subtitle="Waiting to start"
          />
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Completion Progress
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Overall Progress</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.completionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.completionRate}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <RecentTasks />
        </Grid>
      </Grid>

      {/* Task Lists */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TaskList
            tasks={overdueTasks}
            title="Overdue Tasks"
            icon={<AlertTriangle size={20} />}
            emptyMessage="No overdue tasks! Great job staying on track."
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskList
            tasks={upcomingTasks}
            title="Upcoming Tasks"
            icon={<CalendarDays size={20} />}
            emptyMessage="No upcoming tasks for the next week."
            color="info"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 