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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Fab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Timer,
  Add,
  History,
  Assessment,
  TrendingUp,
  AccessTime,
  Schedule,
  CheckCircle,
  Pause,
  Edit,
  Delete,
  Today,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const TimeTracking = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({});
  const [activeTasks, setActiveTasks] = useState([]);
  const [timeReports, setTimeReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Dialog states
  const [showManualLogDialog, setShowManualLogDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Timer states
  const [activeTimers, setActiveTimers] = useState({});
  const [timerIntervals, setTimerIntervals] = useState({});

  // Form data
  const [manualLogData, setManualLogData] = useState({
    taskId: '',
    duration: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchData();
    // Cleanup intervals on unmount
    return () => {
      Object.values(timerIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchSummary();
    }
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchSummary(),
      ]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response);
      
      // Set up timers for active tasks
      const activeTasksWithTimers = response.filter(task => task.isTimerActive);
      setActiveTasks(activeTasksWithTimers);
      
      // Initialize active timers
      const timers = {};
      const intervals = {};
      
      activeTasksWithTimers.forEach(task => {
        if (task.timerStartTime) {
          const startTime = new Date(task.timerStartTime);
          const initialElapsed = Math.floor((new Date() - startTime) / 1000);
          timers[task._id] = initialElapsed;
          
          // Update timer every second
          intervals[task._id] = setInterval(() => {
            setActiveTimers(prev => ({
              ...prev,
              [task._id]: prev[task._id] + 1
            }));
          }, 1000);
        }
      });
      
      setActiveTimers(timers);
      setTimerIntervals(intervals);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await tasksAPI.getTimeTrackingSummary(
        dateRange.startDate,
        dateRange.endDate
      );
      setSummary(response);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const startTimer = async (taskId) => {
    try {
      await tasksAPI.startTimer(taskId);
      setSuccessMessage('Timer started!');
      fetchTasks();
    } catch (err) {
      setError('Failed to start timer');
      console.error('Error starting timer:', err);
    }
  };

  const stopTimer = async (taskId, description = '') => {
    try {
      await tasksAPI.stopTimer(taskId, description);
      setSuccessMessage('Timer stopped!');
      
      // Clear the interval
      if (timerIntervals[taskId]) {
        clearInterval(timerIntervals[taskId]);
        setTimerIntervals(prev => {
          const updated = { ...prev };
          delete updated[taskId];
          return updated;
        });
      }
      
      fetchTasks();
      fetchSummary();
    } catch (err) {
      setError('Failed to stop timer');
      console.error('Error stopping timer:', err);
    }
  };

  const addManualTimeLog = async () => {
    try {
      await tasksAPI.addTimeLog(manualLogData.taskId, {
        duration: parseInt(manualLogData.duration),
        description: manualLogData.description,
        date: manualLogData.date,
      });
      
      setSuccessMessage('Time log added successfully!');
      setShowManualLogDialog(false);
      resetManualLogForm();
      fetchTasks();
      fetchSummary();
    } catch (err) {
      setError('Failed to add time log');
      console.error('Error adding time log:', err);
    }
  };

  const fetchTaskReport = async (task) => {
    try {
      const report = await tasksAPI.getTimeReport(task._id);
      setTimeReports(prev => ({
        ...prev,
        [task._id]: report
      }));
      setSelectedTask(task);
      setShowReportDialog(true);
    } catch (err) {
      setError('Failed to fetch task report');
      console.error('Error fetching task report:', err);
    }
  };

  const resetManualLogForm = () => {
    setManualLogData({
      taskId: '',
      duration: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 70) return 'warning';
    return 'error';
  };

  const TimerCard = ({ task }) => {
    const elapsed = activeTimers[task._id] || 0;
    const isActive = task.isTimerActive;

    return (
      <Card sx={{ mb: 2, border: isActive ? 2 : 1, borderColor: isActive ? 'primary.main' : 'divider' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" component="h3">
                {task.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estimate: {formatDuration(task.timeEstimate)} | 
                Spent: {formatDuration(task.totalTimeSpent || 0)}
              </Typography>
              {isActive && (
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatTime(elapsed)}
                </Typography>
              )}
            </Box>
            
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={task.status}
                color={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'default'}
                size="small"
              />
              
              <Tooltip title={isActive ? 'Stop Timer' : 'Start Timer'}>
                <IconButton
                  color={isActive ? 'error' : 'primary'}
                  onClick={() => isActive ? stopTimer(task._id) : startTimer(task._id)}
                  disabled={task.status === 'Completed'}
                >
                  {isActive ? <Stop /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="View Report">
                <IconButton onClick={() => fetchTaskReport(task)}>
                  <Assessment />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {task.totalTimeSpent > 0 && (
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption">
                  Efficiency: {task.timeEstimate > 0 ? 
                    Math.round((task.timeEstimate / task.totalTimeSpent) * 100) : 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((task.totalTimeSpent / task.timeEstimate) * 100, 100)}
                color={getEfficiencyColor(task.timeEstimate > 0 ? 
                  (task.timeEstimate / task.totalTimeSpent) * 100 : 0)}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const chartData = summary.taskBreakdown?.slice(0, 10).map(task => ({
    name: task.name.length > 15 ? task.name.substring(0, 15) + '...' : task.name,
    estimated: task.timeEstimate,
    actual: task.totalTimeSpent,
    efficiency: parseFloat(task.efficiency),
  })) || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          ⏱️ Time Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track time spent on tasks and analyze your productivity
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchSummary}
            >
              Update Report
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowManualLogDialog(true)}
            >
              Add Time Log
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                {summary.activeTimers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Timers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {formatDuration(summary.totalTimeSpent || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Time Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {formatDuration(summary.totalTimeEstimated || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Estimated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {Math.round(summary.averageEfficiency || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Active Timers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 600, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <Timer color="primary" />
              Active Tasks
              <Badge badgeContent={activeTasks.length} color="primary" />
            </Typography>
            
            {tasks.slice(0, 10).map((task) => (
              <TimerCard key={task._id} task={task} />
            ))}
            
            {tasks.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No tasks available. Create some tasks to start tracking time!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Time Analysis Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 600 }}>
            <Typography variant="h6" gutterBottom>
              📊 Time Analysis (Top 10 Tasks)
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#8884d8" name="Estimated (min)" />
                  <Bar dataKey="actual" fill="#82ca9d" name="Actual (min)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="85%">
                <Typography color="text.secondary">
                  No time tracking data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Time Summary Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Task Time Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Name</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Estimated</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Efficiency</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.taskBreakdown?.slice(0, 20).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {task.isTimerActive && <Timer color="primary" fontSize="small" />}
                          {task.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={task.status}
                          size="small"
                          color={task.status === 'Completed' ? 'success' : 
                                task.status === 'In Progress' ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(task.timeEstimate)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(task.totalTimeSpent)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${task.efficiency}%`}
                          size="small"
                          color={getEfficiencyColor(parseFloat(task.efficiency))}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Report">
                          <IconButton
                            size="small"
                            onClick={() => fetchTaskReport({ _id: task.id, name: task.name })}
                          >
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Manual Time Log Dialog */}
      <Dialog
        open={showManualLogDialog}
        onClose={() => setShowManualLogDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Manual Time Log</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Task</InputLabel>
                <Select
                  value={manualLogData.taskId}
                  label="Task"
                  onChange={(e) => setManualLogData(prev => ({ ...prev, taskId: e.target.value }))}
                >
                  {tasks.map((task) => (
                    <MenuItem key={task._id} value={task._id}>
                      {task.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={manualLogData.duration}
                onChange={(e) => setManualLogData(prev => ({ ...prev, duration: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={manualLogData.date}
                onChange={(e) => setManualLogData(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                multiline
                rows={2}
                value={manualLogData.description}
                onChange={(e) => setManualLogData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualLogDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={addManualTimeLog}
            variant="contained"
            disabled={!manualLogData.taskId || !manualLogData.duration}
          >
            Add Time Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Report Dialog */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Time Report: {selectedTask?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTask && timeReports[selectedTask._id] && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Time Estimate
                  </Typography>
                  <Typography variant="h6">
                    {formatDuration(timeReports[selectedTask._id].timeEstimate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Time Spent
                  </Typography>
                  <Typography variant="h6">
                    {formatDuration(timeReports[selectedTask._id].totalTimeSpent)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">
                      {timeReports[selectedTask._id].efficiency}%
                    </Typography>
                    <Chip
                      label={parseFloat(timeReports[selectedTask._id].efficiency) >= 90 ? 'Excellent' :
                            parseFloat(timeReports[selectedTask._id].efficiency) >= 70 ? 'Good' : 'Needs Improvement'}
                      color={getEfficiencyColor(parseFloat(timeReports[selectedTask._id].efficiency))}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Time Logs
              </Typography>
              <List>
                {timeReports[selectedTask._id].timeLogs.map((log, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${formatDuration(log.duration)} - ${log.date}`}
                      secondary={log.description || 'No description'}
                    />
                  </ListItem>
                ))}
              </List>
              
              {timeReports[selectedTask._id].timeLogs.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No time logs recorded yet
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage('')}
          sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}
        >
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}
        >
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default TimeTracking;