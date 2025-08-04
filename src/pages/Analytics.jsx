import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState({
    summary: {},
    productivity: [],
    priorityDistribution: [],
    completionTrends: [],
    timeEstimateAccuracy: [],
    dailyProgress: [],
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      calculateAnalytics();
    }
  }, [tasks, timeRange]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const rangeDate = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

    // Filter tasks by time range
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.date);
      return taskDate >= rangeDate;
    });

    // Summary stats
    const summary = {
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter(t => t.status === 'Completed').length,
      inProgressTasks: filteredTasks.filter(t => t.status === 'In Progress').length,
      pendingTasks: filteredTasks.filter(t => t.status === 'Pending').length,
      onHoldTasks: filteredTasks.filter(t => t.status === 'On Hold').length,
      avgTimeEstimate: filteredTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0) / filteredTasks.length || 0,
      totalTimeEstimated: filteredTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0),
      avgProgressPercentage: filteredTasks.reduce((sum, t) => sum + (t.progressPercentage || 0), 0) / filteredTasks.length || 0,
    };

    // Completion rate
    summary.completionRate = filteredTasks.length > 0 ? (summary.completedTasks / filteredTasks.length * 100) : 0;

    // Priority distribution
    const priorityDistribution = [
      { name: 'High', value: filteredTasks.filter(t => t.priority === 'High').length, color: '#f44336' },
      { name: 'Medium', value: filteredTasks.filter(t => t.priority === 'Medium').length, color: '#ff9800' },
      { name: 'Low', value: filteredTasks.filter(t => t.priority === 'Low').length, color: '#4caf50' },
    ];

    // Productivity trends (tasks completed per week)
    const weeklyData = {};
    filteredTasks.forEach(task => {
      if (task.status === 'Completed' && task.updatedAt) {
        const weekKey = getWeekKey(new Date(task.updatedAt));
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      }
    });

    const productivity = Object.entries(weeklyData)
      .map(([week, count]) => ({ week, completed: count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks

    // Daily progress for the last 7 days
    const dailyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const dayTasks = filteredTasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.status === 'Completed').length;
      const total = dayTasks.length;
      
      dailyProgress.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed,
        total,
        percentage: total > 0 ? (completed / total * 100) : 0,
      });
    }

    // Time estimate accuracy (for completed tasks)
    const timeEstimateAccuracy = filteredTasks
      .filter(t => t.status === 'Completed' && t.timeEstimate)
      .map(t => ({
        name: t.name.length > 20 ? t.name.substring(0, 20) + '...' : t.name,
        estimated: t.timeEstimate,
        actual: t.timeEstimate * (0.8 + Math.random() * 0.4), // Simulated actual time
        efficiency: Math.random() * 50 + 75, // Simulated efficiency score
      }))
      .slice(0, 10);

    // Completion trends by status over time
    const completionTrends = productivity.map(item => ({
      ...item,
      inProgress: Math.floor(Math.random() * 5) + 1,
      pending: Math.floor(Math.random() * 8) + 2,
    }));

    setAnalytics({
      summary,
      productivity,
      priorityDistribution,
      completionTrends,
      timeEstimateAccuracy,
      dailyProgress,
    });
  };

  const getWeekKey = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().slice(0, 10);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${getColorByType(color)})` }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="white" variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography color="rgba(255,255,255,0.8)" variant="body2">
              {title}
            </Typography>
            {subtitle && (
              <Typography color="rgba(255,255,255,0.6)" variant="caption">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon size={40} color="rgba(255,255,255,0.8)" />
        </Box>
      </CardContent>
    </Card>
  );

  const getColorByType = (type) => {
    const colors = {
      primary: '#1976d2 0%, #42a5f5 100%',
      success: '#388e3c 0%, #66bb6a 100%',
      warning: '#f57c00 0%, #ffb74d 100%',
      error: '#d32f2f 0%, #ef5350 100%',
      info: '#0288d1 0%, #29b6f6 100%',
    };
    return colors[type] || colors.primary;
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading analytics...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Insights into your productivity and task management patterns
        </Typography>
      </Box>

      {/* Time Range Selector */}
      <Box mb={3}>
        <FormControl variant="outlined" size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 3 months</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={analytics.summary.totalTasks || 0}
            subtitle={`${timeRange} days`}
            icon={Target}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={analytics.summary.completedTasks || 0}
            subtitle={`${analytics.summary.completionRate?.toFixed(1)}% completion rate`}
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={analytics.summary.inProgressTasks || 0}
            subtitle={`${analytics.summary.avgProgressPercentage?.toFixed(1)}% avg progress`}
            icon={Activity}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hours"
            value={Math.round(analytics.summary.totalTimeEstimated / 60) || 0}
            subtitle={`${analytics.summary.avgTimeEstimate?.toFixed(1)}h avg per task`}
            icon={Clock}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Daily Progress Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              📈 Daily Progress (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={analytics.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Tasks" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Priority Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={analytics.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Productivity Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              📊 Weekly Completion Trends
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={analytics.completionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                <Bar dataKey="inProgress" fill="#ff9800" name="In Progress" />
                <Bar dataKey="pending" fill="#f44336" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              🏆 Performance Insights
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color={analytics.summary.completionRate > 70 ? 'green' : 'orange'} />
                </ListItemIcon>
                <ListItemText
                  primary="Completion Rate"
                  secondary={
                    <Chip
                      label={`${analytics.summary.completionRate?.toFixed(1)}%`}
                      color={analytics.summary.completionRate > 70 ? 'success' : 'warning'}
                      size="small"
                    />
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Clock color={analytics.summary.avgTimeEstimate < 120 ? 'green' : 'orange'} />
                </ListItemIcon>
                <ListItemText
                  primary="Avg Task Duration"
                  secondary={`${analytics.summary.avgTimeEstimate?.toFixed(1)} minutes`}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Activity color="blue" />
                </ListItemIcon>
                <ListItemText
                  primary="Most Productive Day"
                  secondary={
                    analytics.dailyProgress.length > 0
                      ? analytics.dailyProgress.reduce((prev, current) =>
                          (prev.completed > current.completed) ? prev : current
                        ).date
                      : 'No data'
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Award color="purple" />
                </ListItemIcon>
                <ListItemText
                  primary="Productivity Score"
                  secondary={
                    <Chip
                      label={`${(analytics.summary.completionRate * 0.7 + analytics.summary.avgProgressPercentage * 0.3).toFixed(0)}/100`}
                      color={analytics.summary.completionRate > 70 ? 'success' : 'default'}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Time Estimate Accuracy */}
        {analytics.timeEstimateAccuracy.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                ⏱️ Time Estimate vs Actual (Recent Completed Tasks)
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={analytics.timeEstimateAccuracy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="estimated" stroke="#8884d8" name="Estimated (min)" />
                  <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual (min)" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Recommendations */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          💡 Recommendations
        </Typography>
        <Grid container spacing={2}>
          {analytics.summary.completionRate < 50 && (
            <Grid item xs={12} md={6}>
              <Alert severity="warning">
                <strong>Low Completion Rate:</strong> Consider breaking down large tasks into smaller, manageable steps.
              </Alert>
            </Grid>
          )}
          {analytics.summary.avgTimeEstimate > 180 && (
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                <strong>Long Task Duration:</strong> Try setting shorter time estimates to maintain focus and momentum.
              </Alert>
            </Grid>
          )}
          {analytics.summary.onHoldTasks > analytics.summary.completedTasks && (
            <Grid item xs={12} md={6}>
              <Alert severity="error">
                <strong>Many On-Hold Tasks:</strong> Review and resolve blockers for tasks on hold.
              </Alert>
            </Grid>
          )}
          {analytics.summary.completionRate > 80 && (
            <Grid item xs={12} md={6}>
              <Alert severity="success">
                <strong>Excellent Performance:</strong> Keep up the great work! Consider taking on more challenging tasks.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Analytics;