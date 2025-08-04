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
  Button,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Skeleton,
  CardActions,
  Fade,
  Zoom,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  CheckSquare,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CalendarDays,
  Plus,
  Target,
  Zap,
  Star,
  ArrowRight,
  Timer,
  Award,
  Activity,
  Sunrise,
  Coffee,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    fetchTasks();
    setTimeOfDay(getTimeOfDay());
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

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    };
    return greetings[timeOfDay] || 'Hello';
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sunrise size={24} />;
      case 'afternoon': return <Coffee size={24} />;
      case 'evening': return <Activity size={24} />;
      default: return <Activity size={24} />;
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const pending = tasks.filter(task => task.status === 'Pending').length;
    const onHold = tasks.filter(task => task.status === 'On Hold').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate productivity score
    const productivityScore = total > 0 ? Math.round(
      (completed * 0.6 + inProgress * 0.3 + pending * 0.1) / total * 100
    ) : 0;

    return { total, completed, inProgress, pending, onHold, completionRate, productivityScore };
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon, color, subtitle, trend, onClick }) => (
    <Zoom in={!loading} style={{ transitionDelay: loading ? '0ms' : '200ms' }}>
      <Card 
        sx={{ 
          height: '100%', 
          minHeight: { xs: 140, sm: 160 },
          background: `linear-gradient(135deg, ${getGradientColors(color)})`,
          color: 'white',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: onClick ? 'translateY(-4px)' : 'none',
            boxShadow: onClick ? '0 12px 25px rgba(0,0,0,0.15)' : 'none',
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                component="div" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '2.2rem', sm: '3rem' }
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.8,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {subtitle}
                  </Typography>
                  {trend && (
                    <Chip 
                      label={trend} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem'
                      }} 
                    />
                  )}
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  const getGradientColors = (color) => {
    const gradients = {
      primary: '#1976d2 0%, #42a5f5 100%',
      success: '#388e3c 0%, #66bb6a 100%',
      warning: '#f57c00 0%, #ffb74d 100%',
      error: '#d32f2f 0%, #ef5350 100%',
      info: '#0288d1 0%, #29b6f6 100%',
      purple: '#7b1fa2 0%, #ba68c8 100%',
    };
    return gradients[color] || gradients.primary;
  };

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
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
          {icon}
          <Typography variant="h6" color={`${color}.main`} sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            {title}
          </Typography>
        </Box>
        {tasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ 
            textAlign: 'center', 
            py: { xs: 3, sm: 4 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            {emptyMessage}
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {tasks.map((task, index) => (
              <Box key={task._id}>
                <ListItem sx={{ px: 0, py: { xs: 0.5, sm: 1 } }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          mb: 0.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {task.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          {task.timeEstimate} min • {task.priority}
                        </Typography>
                        <Chip
                          icon={<Calendar size={16} />}
                          label={formatDate(task.date)}
                          color={getDateColor(task.date)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
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
                    sx={{ 
                      flexShrink: 0,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
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

  const QuickActions = () => (
    <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '400ms' }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <Zap size={20} />
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus />}
                onClick={() => navigate('/tasks')}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)',
                  }
                }}
              >
                New Task
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Target />}
                onClick={() => navigate('/kanban')}
                sx={{ py: 1.5 }}
              >
                Kanban
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Calendar />}
                onClick={() => navigate('/calendar')}
                sx={{ py: 1.5 }}
              >
                Calendar
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Timer />}
                onClick={() => navigate('/time-tracking')}
                sx={{ py: 1.5 }}
              >
                Time Track
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  const TaskDistributionChart = () => {
    const chartData = [
      { name: 'Completed', value: stats.completed, color: '#4caf50' },
      { name: 'In Progress', value: stats.inProgress, color: '#ff9800' },
      { name: 'Pending', value: stats.pending, color: '#2196f3' },
      { name: 'On Hold', value: stats.onHold, color: '#f44336' },
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={200}>
              <Typography color="text.secondary">
                No tasks to display
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '600ms' }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Task Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const ProductivityInsights = () => (
    <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '800ms' }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <Award size={20} />
            Productivity Insights
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Productivity Score
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {stats.productivityScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.productivityScore}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: stats.productivityScore >= 80 ? '#4caf50' : 
                                 stats.productivityScore >= 60 ? '#ff9800' : '#f44336',
                  borderRadius: 4,
                }
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Today's Focus
            </Typography>
            <Typography variant="body1">
              {stats.inProgress > 0 
                ? `Focus on completing ${stats.inProgress} in-progress task${stats.inProgress > 1 ? 's' : ''}`
                : stats.pending > 0 
                  ? `Start working on ${Math.min(stats.pending, 3)} pending task${stats.pending > 1 ? 's' : ''}`
                  : "Great job! All tasks are completed 🎉"
              }
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  const RecentTasks = () => {
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
    
    return (
      <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '1000ms' }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                🕒 Recent Activity
              </Typography>
              <IconButton size="small" onClick={() => navigate('/all-tasks')}>
                <ArrowRight />
              </IconButton>
            </Box>
            
            {recentTasks.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                <Typography color="text.secondary">
                  No recent activity. Start by creating a task!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {recentTasks.map((task, index) => (
                  <Box key={task._id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          backgroundColor: task.status === 'Completed' ? 'success.main' : 
                                          task.status === 'In Progress' ? 'warning.main' : 'info.main'
                        }}
                      >
                        {task.status === 'Completed' ? <CheckSquare size={16} /> : 
                         task.status === 'In Progress' ? <Clock size={16} /> : <Target size={16} />}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {task.name}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                              label={task.status}
                              size="small"
                              color={
                                task.status === 'Completed' ? 'success' :
                                task.status === 'In Progress' ? 'warning' : 'info'
                              }
                            />
                            <Typography variant="caption" color="text.secondary">
                              {task.timeEstimate}m • {task.priority}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Welcome Header */}
      <Fade in={!loading}>
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: `linear-gradient(135deg, ${getGradientColors('primary')})`,
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {getTimeIcon()}
              <Typography variant="h4" fontWeight="bold">
                {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Ready to tackle your tasks and boost your productivity?
            </Typography>
            <Box display="flex" alignItems="center" gap={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Target size={20} />
                <Typography variant="body1">
                  {stats.total} Total Tasks
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Star size={20} />
                <Typography variant="body1">
                  {stats.productivityScore}% Productivity Score
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckSquare size={20} />
                <Typography variant="body1">
                  {stats.completionRate}% Completion Rate
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<Target size={24} />}
            color="primary"
            subtitle="All your tasks"
            trend={stats.total > 10 ? "+5 this week" : null}
            onClick={() => navigate('/all-tasks')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckSquare size={24} />}
            color="success"
            subtitle={`${stats.completionRate}% completion rate`}
            trend={stats.completed > 0 ? "Great progress!" : null}
            onClick={() => navigate('/all-tasks')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock size={24} />}
            color="warning"
            subtitle="Active tasks"
            trend={stats.inProgress > 0 ? "Keep going!" : null}
            onClick={() => navigate('/kanban')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productivity Score"
            value={`${stats.productivityScore}%`}
            icon={<Award size={24} />}
            color="purple"
            subtitle="Your efficiency"
            trend={stats.productivityScore >= 80 ? "Excellent!" : stats.productivityScore >= 60 ? "Good" : "Needs improvement"}
            onClick={() => navigate('/analytics')}
          />
        </Grid>
      </Grid>

      {/* Enhanced Dashboard Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <QuickActions />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TaskDistributionChart />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ProductivityInsights />
        </Grid>
      </Grid>

      {/* Task Activity and Lists */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <RecentTasks />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '1200ms' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AlertTriangle size={20} />
                  Important Tasks
                </Typography>
                
                {overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                    <Typography color="text.secondary">
                      No urgent tasks! You're all caught up! 🎉
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {overdueTasks.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="error.main" gutterBottom>
                          ⚠️ Overdue ({overdueTasks.length})
                        </Typography>
                        <List dense>
                          {overdueTasks.slice(0, 3).map((task) => (
                            <ListItem key={task._id} sx={{ px: 0 }}>
                              <ListItemText
                                primary={task.name}
                                secondary={`Due: ${formatDate(task.date)}`}
                              />
                              <Chip label="Overdue" color="error" size="small" />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {upcomingTasks.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="info.main" gutterBottom>
                          📅 Upcoming ({upcomingTasks.length})
                        </Typography>
                        <List dense>
                          {upcomingTasks.slice(0, 3).map((task) => (
                            <ListItem key={task._id} sx={{ px: 0 }}>
                              <ListItemText
                                primary={task.name}
                                secondary={`Due: ${formatDate(task.date)}`}
                              />
                              <Chip label={task.priority} color="info" size="small" />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Calendar />}
                  onClick={() => navigate('/calendar')}
                >
                  View Calendar
                </Button>
                <Button
                  size="small"
                  startIcon={<ArrowRight />}
                  onClick={() => navigate('/all-tasks')}
                >
                  All Tasks
                </Button>
              </CardActions>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Motivational Footer */}
      <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : '1400ms' }}>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(45deg, #f5f5f5 30%, #e8e8e8 90%)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            💪 Keep up the great work!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.completionRate >= 80 
              ? "You're crushing your goals! Excellent productivity!"
              : stats.completionRate >= 60 
                ? "Good progress! Keep the momentum going!"
                : stats.total === 0
                  ? "Ready to start? Create your first task and begin your productivity journey!"
                  : "Every step counts! Focus on one task at a time."
            }
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
};

export default Dashboard; 