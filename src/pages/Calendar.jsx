import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Fab,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Add,
  Event,
  AccessTime,
  Alarm,
  Repeat,
  Flag,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Today,
  ViewWeek,
  ViewModule,
} from '@mui/icons-material';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  
  // Form state for creating/editing events
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    dueTime: '',
    timeEstimate: 30,
    priority: 'Medium',
    reminderDate: '',
    isRecurring: false,
    recurringPattern: '',
    steps: [],
  });

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [overdueEvents, setOverdueEvents] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      processTasksToEvents();
      calculateUpcomingDeadlines();
      calculateOverdueEvents();
    }
  }, [tasks]);

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

  const processTasksToEvents = () => {
    const processedEvents = tasks.map(task => {
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date(task.date);
      const endDate = new Date(startDate.getTime() + (task.timeEstimate || 30) * 60000);
      
      // If task has a specific due time, adjust the date
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        endDate.setTime(startDate.getTime() + (task.timeEstimate || 30) * 60000);
      }

      return {
        id: task._id,
        title: task.name,
        start: startDate,
        end: endDate,
        resource: task,
        allDay: !task.dueTime,
      };
    });

    setEvents(processedEvents);
  };

  const calculateUpcomingDeadlines = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= nextWeek && task.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    setUpcomingDeadlines(upcoming);
  };

  const calculateOverdueEvents = () => {
    const now = new Date();
    
    const overdue = tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setOverdueEvents(overdue);
  };

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  const handleSelectSlot = useCallback(({ start }) => {
    setSelectedDate(start);
    setFormData({
      ...formData,
      date: start.toISOString().slice(0, 10),
      dueDate: start.toISOString().slice(0, 10),
    });
    setShowCreateDialog(true);
  }, [formData]);

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        reminderDate: formData.reminderDate ? new Date(formData.reminderDate) : null,
      };
      
      await tasksAPI.create(taskData);
      setShowCreateDialog(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
      if (showEventDialog) {
        setShowEventDialog(false);
      }
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().slice(0, 10),
      dueDate: '',
      dueTime: '',
      timeEstimate: 30,
      priority: 'Medium',
      reminderDate: '',
      isRecurring: false,
      recurringPattern: '',
      steps: [],
    });
  };

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (task.priority) {
      case 'High':
        backgroundColor = '#f44336';
        break;
      case 'Medium':
        backgroundColor = '#ff9800';
        break;
      case 'Low':
        backgroundColor = '#4caf50';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    if (task.status === 'Completed') {
      backgroundColor = '#9e9e9e';
    } else if (task.status === 'On Hold') {
      backgroundColor = '#795548';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: task.status === 'Completed' ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      }
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'On Hold': return 'warning';
      default: return 'default';
    }
  };

  const formatTime = (date) => {
    return moment(date).format('h:mm A');
  };

  const formatDate = (date) => {
    return moment(date).format('MMM DD, YYYY');
  };

  const getDaysUntilDue = (dueDate) => {
    const now = moment();
    const due = moment(dueDate);
    return due.diff(now, 'days');
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading calendar...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📅 Task Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize your tasks and deadlines in calendar view
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: 600 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Task Calendar</Typography>
              <Box>
                <Button
                  variant={view === Views.MONTH ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setView(Views.MONTH)}
                  sx={{ mr: 1 }}
                >
                  Month
                </Button>
                <Button
                  variant={view === Views.WEEK ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setView(Views.WEEK)}
                  sx={{ mr: 1 }}
                >
                  Week
                </Button>
                <Button
                  variant={view === Views.DAY ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setView(Views.DAY)}
                >
                  Day
                </Button>
              </Box>
            </Box>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              view={view}
              onView={setView}
              date={selectedDate}
              onNavigate={setSelectedDate}
              eventPropGetter={eventStyleGetter}
              popup
            />
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Upcoming Deadlines */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <AccessTime color="warning" />
              Upcoming Deadlines
            </Typography>
            {upcomingDeadlines.length > 0 ? (
              <List dense>
                {upcomingDeadlines.map((task) => (
                  <ListItem key={task._id} divider>
                    <ListItemIcon>
                      <Badge
                        badgeContent={getDaysUntilDue(task.dueDate)}
                        color="warning"
                        max={99}
                      >
                        <Event />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Due: {formatDate(task.dueDate)}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </Typography>
                          <Chip
                            size="small"
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming deadlines
              </Typography>
            )}
          </Paper>

          {/* Overdue Tasks */}
          {overdueEvents.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Cancel color="error" />
                Overdue Tasks
              </Typography>
              <List dense>
                {overdueEvents.slice(0, 5).map((task) => (
                  <ListItem key={task._id} divider>
                    <ListItemIcon>
                      <Event color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block" color="error">
                            Due: {formatDate(task.dueDate)}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </Typography>
                          <Chip
                            size="small"
                            label={task.status}
                            color={getStatusColor(task.status)}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Today's Tasks */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <Today color="primary" />
              Today's Tasks
            </Typography>
            {events
              .filter(event => moment(event.start).isSame(moment(), 'day'))
              .length > 0 ? (
              <List dense>
                {events
                  .filter(event => moment(event.start).isSame(moment(), 'day'))
                  .slice(0, 5)
                  .map((event) => (
                    <ListItem key={event.id} divider>
                      <ListItemIcon>
                        <Event color={event.resource.status === 'Completed' ? 'success' : 'primary'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <Box>
                            {event.resource.dueTime && (
                              <Typography variant="caption" display="block">
                                {event.resource.dueTime}
                              </Typography>
                            )}
                            <Chip
                              size="small"
                              label={event.resource.status}
                              color={getStatusColor(event.resource.status)}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tasks scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowCreateDialog(true)}
      >
        <Add />
      </Fab>

      {/* Event Details Dialog */}
      <Dialog
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            Task Details
            <IconButton onClick={() => setShowEventDialog(false)}>
              <Cancel />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedEvent.resource.priority}
                    color={getPriorityColor(selectedEvent.resource.priority)}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedEvent.resource.status}
                    color={getStatusColor(selectedEvent.resource.status)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedEvent.start)}
                    {!selectedEvent.allDay && ` at ${formatTime(selectedEvent.start)}`}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.resource.timeEstimate} minutes
                  </Typography>
                </Grid>

                {selectedEvent.resource.dueDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedEvent.resource.dueDate)}
                      {selectedEvent.resource.dueTime && ` at ${selectedEvent.resource.dueTime}`}
                    </Typography>
                  </Grid>
                )}

                {selectedEvent.resource.steps && selectedEvent.resource.steps.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Steps ({selectedEvent.resource.steps.filter(s => s.status === 'Completed').length}/{selectedEvent.resource.steps.length} completed)
                    </Typography>
                    <List dense>
                      {selectedEvent.resource.steps.slice(0, 3).map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color={step.status === 'Completed' ? 'success' : 'disabled'} />
                          </ListItemIcon>
                          <ListItemText primary={step.description} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedEvent && selectedEvent.resource.status !== 'Completed' && (
            <>
              <Button
                onClick={() => handleUpdateTaskStatus(selectedEvent.resource._id, 'In Progress')}
                color="info"
              >
                Start
              </Button>
              <Button
                onClick={() => handleUpdateTaskStatus(selectedEvent.resource._id, 'Completed')}
                color="success"
              >
                Complete
              </Button>
            </>
          )}
          <Button onClick={() => setShowEventDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Time"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Time Estimate (minutes)"
                type="number"
                value={formData.timeEstimate}
                onChange={(e) => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Reminder Date"
                type="date"
                value={formData.reminderDate}
                onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                }
                label="Recurring Task"
              />
            </Grid>

            {formData.isRecurring && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recurring Pattern</InputLabel>
                  <Select
                    value={formData.recurringPattern}
                    label="Recurring Pattern"
                    onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
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

export default Calendar;