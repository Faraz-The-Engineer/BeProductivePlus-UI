import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Container,
  LinearProgress,
} from '@mui/material';
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import DateFilter from '../components/DateFilter';

const TaskManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [moveTaskDialog, setMoveTaskDialog] = useState({ open: false, taskId: null, taskName: '' });
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    timeEstimate: '',
    dependency: '',
    priority: 'Medium',
    date: new Date().toISOString().slice(0, 10), // Default to today
    steps: [],
  });
  const [stepDescription, setStepDescription] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  console.log('TaskManager render:', { user, loading, error, tasks: tasks.length });

  useEffect(() => {
    console.log('TaskManager useEffect - fetching tasks');
    fetchTasks();
  }, []);

  useEffect(() => {
    if (activeFilter) {
      const filtered = tasks.filter(task => {
        const taskDate = new Date(task.date);
        const startDate = new Date(activeFilter.startDate);
        const endDate = new Date(activeFilter.endDate);
        endDate.setHours(23, 59, 59); // Include the entire end date
        
        return taskDate >= startDate && taskDate <= endDate;
      });
      setFilteredTasks(filtered);
    } else {
      // Filter tasks for the selected date
      const filtered = tasks.filter(task => {
        const taskDate = new Date(task.date);
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return taskDate >= selectedDateObj && taskDate < nextDay;
      });
      setFilteredTasks(filtered);
    }
  }, [tasks, activeFilter, selectedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
  };

  // Date navigation functions
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().slice(0, 10));
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getDateColor = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'primary';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'warning';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'success';
    } else {
      return 'text.primary';
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        name: task.name,
        timeEstimate: task.timeEstimate,
        dependency: task.dependency || '',
        priority: task.priority,
        date: task.date || new Date().toISOString().slice(0, 10),
        steps: task.steps || [],
      });
    } else {
      setEditingTask(null);
      setFormData({
        name: '',
        timeEstimate: '',
        dependency: '',
        priority: 'Medium',
        date: selectedDate, // Use the selected date instead of today
        steps: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setFormData({
      name: '',
      timeEstimate: '',
      dependency: '',
      priority: 'Medium',
      date: selectedDate, // Reset to selected date
      steps: [],
    });
    setStepDescription('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddStep = () => {
    if (stepDescription.trim()) {
      setFormData({
        ...formData,
        steps: [...formData.steps, { description: stepDescription.trim(), status: 'Pending' }],
      });
      setStepDescription('');
    }
  };

  const handleRemoveStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, formData);
      } else {
        await tasksAPI.create(formData);
      }
      handleCloseDialog();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        fetchTasks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMoveToNextDay = async (taskId, taskName) => {
    try {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = nextDay.toISOString().slice(0, 10);
      
      await tasksAPI.update(taskId, { date: nextDayString });
      fetchTasks();
      setMoveTaskDialog({ open: false, taskId: null, taskName: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const openMoveTaskDialog = (taskId, taskName) => {
    setMoveTaskDialog({ open: true, taskId, taskName });
  };

  const toggleTaskSteps = (taskId) => {
    const newExpandedTasks = new Set(expandedTasks);
    if (newExpandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);
  };

  const handleStepToggle = async (taskId, stepIndex, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await tasksAPI.updateStep(taskId, stepIndex, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
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

  const getTaskDateColor = (dateString) => {
    if (!dateString) return 'default';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'primary';
    } else if (date < today) {
      return 'error';
    } else {
      return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Task Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and organize your tasks efficiently
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={handleOpenDialog}
          size="small"
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Changer */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigateDate('prev')}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Typography variant="h6" fontWeight="bold" color={`${getDateColor(selectedDate)}.main`}>
                {getDateLabel(selectedDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => navigateDate('next')}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={goToToday}
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': { 
                  backgroundColor: 'primary.main', 
                  color: 'white',
                  borderColor: 'primary.main'
                }
              }}
            >
              Go to Today
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Date Filter */}
      {/* <DateFilter onFilterChange={handleFilterChange} onClearFilter={handleClearFilter} /> */}

      {/* Tasks Table */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {activeFilter ? 'No tasks found for the selected date range' : `No tasks for ${getDateLabel(selectedDate)}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeFilter ? 'Try adjusting your filter or create a new task' : `No tasks scheduled for ${getDateLabel(selectedDate).toLowerCase()}. Create a new task or navigate to a different date.`}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => handleOpenDialog()}
              >
                Create Task
              </Button>
            </Box>
          ) : (
            <Box sx={{ overflow: 'auto' }}>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }}>
                   <TableHead>
                     <TableRow>
                       <TableCell sx={{ minWidth: 200 }}>Task Name</TableCell>
                       <TableCell sx={{ minWidth: 100, textAlign: 'center' }}>Priority</TableCell>
                       <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>Status</TableCell>
                       <TableCell sx={{ minWidth: 100, textAlign: 'center' }}>Date</TableCell>
                       <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>Time Estimate</TableCell>
                       <TableCell sx={{ minWidth: 80, textAlign: 'center' }}>Steps</TableCell>
                       <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>Progress</TableCell>
                       <TableCell sx={{ minWidth: 80, textAlign: 'center' }}>Moves</TableCell>
                       <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>Actions</TableCell>
                     </TableRow>
                   </TableHead>
                  <TableBody>
                                         {filteredTasks.map((task) => (
                       <React.Fragment key={task._id}>
                         <TableRow hover>
                           <TableCell>
                             <Box sx={{ minWidth: 0 }}>
                               <Typography 
                                 variant="body1" 
                                 fontWeight="medium"
                                 sx={{
                                   wordBreak: 'break-word',
                                   lineHeight: 1.4,
                                   mb: 0.5,
                                 }}
                               >
                                 {task.name}
                               </Typography>
                               {task.dependency && (
                                 <Typography 
                                   variant="body2" 
                                   color="text.secondary"
                                   sx={{
                                     wordBreak: 'break-word',
                                     lineHeight: 1.4,
                                   }}
                                 >
                                   Depends on: {task.dependency}
                                 </Typography>
                               )}
                             </Box>
                           </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                           <Chip
                             label={task.priority}
                             color={getPriorityColor(task.priority)}
                             size="small"
                           />
                         </TableCell>
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Chip
                             label={task.status}
                             color={getStatusColor(task.status)}
                             size="small"
                           />
                         </TableCell>
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Chip
                             icon={<Calendar size={16} />}
                             label={formatDate(task.date)}
                             color={getTaskDateColor(task.date)}
                             size="small"
                             variant="outlined"
                           />
                         </TableCell>
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Typography variant="body2">
                             {task.timeEstimate} min
                           </Typography>
                         </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                             <Typography variant="body2">
                               {task.steps?.length || 0} steps
                             </Typography>
                             {task.steps && task.steps.length > 0 && (
                               <IconButton
                                 size="small"
                                 onClick={() => toggleTaskSteps(task._id)}
                                 sx={{ p: 0.5 }}
                               >
                                 {expandedTasks.has(task._id) ? (
                                   <ChevronUp size={16} />
                                 ) : (
                                   <ChevronDown size={16} />
                                 )}
                               </IconButton>
                             )}
                           </Box>
                         </TableCell>
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Box sx={{ minWidth: 100, display: 'flex', justifyContent: 'center' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, maxWidth: 120 }}>
                               <LinearProgress 
                                 variant="determinate" 
                                 value={task.progressPercentage || 0} 
                                 sx={{ 
                                   flex: 1, 
                                   height: 6, 
                                   borderRadius: 3,
                                   backgroundColor: 'grey.200',
                                   '& .MuiLinearProgress-bar': {
                                     borderRadius: 3,
                                   }
                                 }}
                               />
                               <Typography variant="caption" color="text.secondary" sx={{ minWidth: 25 }}>
                                 {task.progressPercentage || 0}%
                               </Typography>
                             </Box>
                           </Box>
                         </TableCell>
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Chip
                             label={`${task.moveCount || 0} moves`}
                             size="small"
                             variant="outlined"
                             color={task.moveCount > 0 ? 'warning' : 'default'}
                             sx={{ 
                               fontSize: '0.75rem',
                               height: 24
                             }}
                           />
                         </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                           <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                               <IconButton
                                 size="small"
                                 onClick={() => handleOpenDialog(task)}
                                 color="primary"
                               >
                                 <Edit size={16} />
                               </IconButton>
                               <IconButton
                                 size="small"
                                 onClick={() => handleStatusChange(task._id, 'Completed')}
                                 color="success"
                               >
                                 <CheckCircle size={16} />
                               </IconButton>
                               {task.status !== 'Completed' && (
                                 <IconButton
                                   size="small"
                                   onClick={() => openMoveTaskDialog(task._id, task.name)}
                                   color="info"
                                   title="Move to next day"
                                   sx={{
                                     '&:hover': {
                                       backgroundColor: 'info.light',
                                       color: 'white'
                                     }
                                   }}
                                 >
                                   <ArrowRight size={16} />
                                 </IconButton>
                               )}
                               <IconButton
                                 size="small"
                                 onClick={() => handleDeleteTask(task._id)}
                                 color="error"
                               >
                                 <Trash2 size={16} />
                               </IconButton>
                             </Box>
                           </TableCell>
                         </TableRow>
                         
                         {/* Expanded Steps Row */}
                         {expandedTasks.has(task._id) && task.steps && task.steps.length > 0 && (
                           <TableRow>
                             <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                                                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderTop: 1, borderColor: 'divider' }}>
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                 <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                   Task Steps
                                 </Typography>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     <LinearProgress 
                                       variant="determinate" 
                                       value={task.progressPercentage || 0} 
                                       sx={{ 
                                         width: 80, 
                                         height: 8, 
                                         borderRadius: 4,
                                         backgroundColor: 'grey.300',
                                         '& .MuiLinearProgress-bar': {
                                           borderRadius: 4,
                                         }
                                       }}
                                     />
                                     <Typography variant="caption" color="text.secondary">
                                       {task.progressPercentage || 0}%
                                     </Typography>
                                   </Box>
                                   <Chip
                                     label={`${task.moveCount || 0} moves`}
                                     size="small"
                                     variant="outlined"
                                     color={task.moveCount > 0 ? 'warning' : 'default'}
                                   />
                                 </Box>
                               </Box>
                                 <List sx={{ p: 0 }}>
                                   {task.steps.map((step, stepIndex) => (
                                     <ListItem 
                                       key={stepIndex} 
                                       sx={{ 
                                         px: 0, 
                                         py: 1,
                                         borderBottom: stepIndex < task.steps.length - 1 ? 1 : 0,
                                         borderColor: 'divider'
                                       }}
                                     >
                                       <ListItemText
                                         primary={
                                           <Typography
                                             variant="body2"
                                             sx={{
                                               textDecoration: step.status === 'Completed' ? 'line-through' : 'none',
                                               color: step.status === 'Completed' ? 'text.secondary' : 'text.primary',
                                               wordBreak: 'break-word',
                                               lineHeight: 1.4,
                                             }}
                                           >
                                             {step.description}
                                           </Typography>
                                         }
                                         secondary={
                                           step.timestamp ? (
                                             <Typography variant="caption" color="text.secondary">
                                               Completed: {new Date(step.timestamp).toLocaleString()}
                                             </Typography>
                                           ) : null
                                         }
                                       />
                                       <ListItemSecondaryAction>
                                         <IconButton
                                           size="small"
                                           onClick={() => handleStepToggle(task._id, stepIndex, step.status)}
                                           color={step.status === 'Completed' ? 'success' : 'default'}
                                           sx={{
                                             '&:hover': {
                                               backgroundColor: step.status === 'Completed' ? 'success.light' : 'action.hover',
                                               color: step.status === 'Completed' ? 'white' : 'inherit'
                                             }
                                           }}
                                         >
                                           {step.status === 'Completed' ? (
                                             <CheckCircle />
                                           ) : (
                                             <Circle />
                                           )}
                                         </IconButton>
                                       </ListItemSecondaryAction>
                                     </ListItem>
                                   ))}
                                 </List>
                               </Box>
                             </TableCell>
                           </TableRow>
                         )}
                       </React.Fragment>
                     ))}
                   </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Task Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Time Estimate (minutes)"
                name="timeEstimate"
                type="number"
                value={formData.timeEstimate}
                onChange={handleInputChange}
                required
                sx={{ flex: 1, minWidth: 200 }}
              />
              
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Task Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              
              <TextField
                fullWidth
                label="Dependency (optional)"
                name="dependency"
                value={formData.dependency}
                onChange={handleInputChange}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Steps
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Step Description"
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  fullWidth
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  sx={{ minWidth: 300 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddStep}
                  disabled={!stepDescription.trim()}
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Box>
              
              <List>
                {formData.steps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={step.description}
                      sx={{
                        '& .MuiListItemText-primary': {
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        },
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveStep(index)}>
                        <Trash2 />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.timeEstimate || !formData.date}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Task Confirmation Dialog */}
      <Dialog 
        open={moveTaskDialog.open} 
        onClose={() => setMoveTaskDialog({ open: false, taskId: null, taskName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Move Task to Next Day
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to move "{moveTaskDialog.taskName}" to the next day?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will reschedule the task for {(() => {
              const nextDay = new Date(selectedDate);
              nextDay.setDate(nextDay.getDate() + 1);
              return nextDay.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            })()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setMoveTaskDialog({ open: false, taskId: null, taskName: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleMoveToNextDay(moveTaskDialog.taskId, moveTaskDialog.taskName)}
            color="info"
          >
            Move to Next Day
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskManager; 