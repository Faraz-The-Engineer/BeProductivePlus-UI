import React, { useState, useEffect } from 'react';
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Fab,
  Avatar,
  Tooltip,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  AccessTime,
  Flag,
  Assignment,
  CheckCircle,
  PlayArrow,
  Pause,
  Schedule,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const columns = [
  { id: 'Pending', title: 'To Do', color: '#f5f5f5' },
  { id: 'In Progress', title: 'In Progress', color: '#e3f2fd' },
  { id: 'Completed', title: 'Done', color: '#e8f5e8' },
  { id: 'On Hold', title: 'On Hold', color: '#fff3e0' },
];

const Kanban = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    timeEstimate: 30,
    priority: 'Medium',
    status: 'Pending',
    steps: [],
    date: new Date().toISOString().slice(0, 10),
  });
  const [stepDescription, setStepDescription] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    organizeTasks();
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

  const organizeTasks = () => {
    const organized = columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter(task => task.status === column.id);
      return acc;
    }, {});
    setTasksByStatus(organized);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const taskId = draggableId;

    try {
      // Update task status in backend
      await tasksAPI.update(taskId, { status: newStatus });
      
      // Update local state
      const updatedTasks = tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      
      setSuccessMessage(`Task moved to ${newStatus}`);
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task:', err);
    }
  };

  const handleCreateTask = async () => {
    try {
      await tasksAPI.create(formData);
      setSuccessMessage('Task created successfully!');
      setShowCreateDialog(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        setSuccessMessage('Task deleted successfully!');
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };

  const addStep = () => {
    if (stepDescription.trim()) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, { description: stepDescription.trim(), status: 'Pending' }]
      }));
      setStepDescription('');
    }
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      timeEstimate: 30,
      priority: 'Medium',
      status: 'Pending',
      steps: [],
      date: new Date().toISOString().slice(0, 10),
    });
    setStepDescription('');
  };

  const openTaskDialog = (task) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#f44336';
      case 'Medium': return '#ff9800';
      case 'Low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const TaskCard = ({ task, index }) => (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            cursor: 'grab',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            boxShadow: snapshot.isDragging ? 4 : 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 3,
            },
          }}
          onClick={() => openTaskDialog(task)}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {/* Priority Indicator */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Chip
                size="small"
                label={task.priority}
                sx={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
              <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>

            {/* Task Title */}
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
              {task.name}
            </Typography>

            {/* Time Estimate */}
            <Box display="flex" alignItems="center" gap={0.5} mb={1}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {task.timeEstimate} min
              </Typography>
            </Box>

            {/* Progress Bar */}
            {task.steps && task.steps.length > 0 && (
              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {task.progressPercentage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={task.progressPercentage || 0}
                  color={getProgressColor(task.progressPercentage || 0)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            {/* Steps Count */}
            {task.steps && task.steps.length > 0 && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Assignment fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {task.steps.filter(s => s.status === 'Completed').length}/{task.steps.length} steps
                </Typography>
              </Box>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {/* Avatar for assigned user */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              
              {/* Status indicator for overdue */}
              {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                <Badge color="error" variant="dot">
                  <Typography variant="caption" color="error">
                    Overdue
                  </Typography>
                </Badge>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const KanbanColumn = ({ column, tasks }) => (
    <Paper
      sx={{
        backgroundColor: column.color,
        minHeight: 600,
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          {column.title}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 500,
              backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.1)' : 'transparent',
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading kanban board...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📋 Kanban Board
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Drag and drop tasks between columns to update their status
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} mb={4}>
        {columns.map((column) => (
          <Grid item xs={12} sm={6} md={3} key={column.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {tasksByStatus[column.id]?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {column.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {columns.map((column) => (
            <Grid item xs={12} sm={6} md={3} key={column.id}>
              <KanbanColumn
                column={column}
                tasks={tasksByStatus[column.id] || []}
              />
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowCreateDialog(true)}
      >
        <Add />
      </Fab>

      {/* Task Details Dialog */}
      <Dialog
        open={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            Task Details
            <IconButton onClick={() => setShowTaskDialog(false)}>
              <Delete />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTask.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedTask.priority}
                    sx={{
                      backgroundColor: getPriorityColor(selectedTask.priority),
                      color: 'white',
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedTask.status} variant="outlined" />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Time Estimate
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.timeEstimate} minutes
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.progressPercentage || 0}%
                  </Typography>
                </Grid>

                {selectedTask.dueDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                {selectedTask.steps && selectedTask.steps.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Steps ({selectedTask.steps.filter(s => s.status === 'Completed').length}/{selectedTask.steps.length} completed)
                    </Typography>
                    <List dense>
                      {selectedTask.steps.slice(0, 5).map((step, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={step.description}
                            secondary={
                              <Chip
                                size="small"
                                label={step.status}
                                color={step.status === 'Completed' ? 'success' : 'default'}
                              />
                            }
                          />
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
          <Button onClick={() => setShowTaskDialog(false)}>
            Close
          </Button>
          {selectedTask && (
            <Button
              color="error"
              onClick={() => {
                handleDeleteTask(selectedTask._id);
                setShowTaskDialog(false);
              }}
            >
              Delete Task
            </Button>
          )}
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
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Steps Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Task Steps
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  placeholder="Add a step..."
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStep()}
                />
                <Button variant="outlined" onClick={addStep}>
                  Add
                </Button>
              </Box>
              <List dense>
                {formData.steps.map((step, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={step.description} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeStep(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
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

export default Kanban;