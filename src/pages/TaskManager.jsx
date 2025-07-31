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
  Tabs,
  Tab,
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
  FileText,
  Clock,
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
  const [onHoldDialog, setOnHoldDialog] = useState({ open: false, taskId: null, taskName: '', reason: '' });
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [bulkCreateDialog, setBulkCreateDialog] = useState({ open: false, mode: 'form' }); // 'form' or 'raw'
  const [bulkTasks, setBulkTasks] = useState([]);
  const [rawText, setRawText] = useState('');
  const [bulkDefaults, setBulkDefaults] = useState({
    timeEstimate: 30,
    priority: 'Medium',
    date: new Date().toISOString().slice(0, 10)
  });
  const [formData, setFormData] = useState({
    name: '',
    timeEstimate: '',
    dependency: '',
    priority: 'Medium',
    status: 'Pending',
    onHoldReason: '',
    date: new Date().toISOString().slice(0, 10), // Default to today
    steps: [],
  });
  const [stepDescription, setStepDescription] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Pending, 2: In Progress, 3: Completed, 4: On Hold

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    
    // First apply date filtering
    if (activeFilter) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.date);
        const startDate = new Date(activeFilter.startDate);
        const endDate = new Date(activeFilter.endDate);
        endDate.setHours(23, 59, 59); // Include the entire end date
        
        return taskDate >= startDate && taskDate <= endDate;
      });
    } else {
      // Filter tasks for the selected date
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.date);
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return taskDate >= selectedDateObj && taskDate < nextDay;
      });
    }
    
    // Then apply status filtering based on active tab
    switch (activeTab) {
      case 1: // Pending
        filtered = filtered.filter(task => task.status === 'Pending');
        break;
      case 2: // In Progress
        filtered = filtered.filter(task => task.status === 'In Progress');
        break;
      case 3: // Completed
        filtered = filtered.filter(task => task.status === 'Completed');
        break;
      case 4: // On Hold
        filtered = filtered.filter(task => task.status === 'On Hold');
        break;
      default: // All (case 0)
        break;
    }
    
    setFilteredTasks(filtered);
  }, [tasks, activeFilter, selectedDate, activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      
      // Sort tasks by status priority: In Progress/Pending first, then On Hold, then Completed last
      const sortedData = data.sort((a, b) => {
        const statusPriority = {
          'In Progress': 1,
          'Pending': 1,
          'On Hold': 2,
          'Completed': 3
        };
        
        const priorityA = statusPriority[a.status] || 4;
        const priorityB = statusPriority[b.status] || 4;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same status, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setTasks(sortedData);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        status: task.status || 'Pending',
        onHoldReason: task.onHoldReason || '',
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
        status: 'Pending',
        onHoldReason: '',
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
      status: 'Pending',
      onHoldReason: '',
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

  const handleBulkCreate = async () => {
    try {
      if (bulkCreateDialog.mode === 'raw') {
        await tasksAPI.bulkCreate({
          rawText,
          defaultTimeEstimate: bulkDefaults.timeEstimate,
          defaultPriority: bulkDefaults.priority,
          defaultDate: bulkDefaults.date
        });
      } else {
        await tasksAPI.bulkCreate({
          tasks: bulkTasks,
          defaultTimeEstimate: bulkDefaults.timeEstimate,
          defaultPriority: bulkDefaults.priority,
          defaultDate: bulkDefaults.date
        });
      }
      setBulkCreateDialog({ open: false, mode: 'form' });
      setBulkTasks([]);
      setRawText('');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const addBulkTask = () => {
    setBulkTasks([...bulkTasks, { name: '', timeEstimate: bulkDefaults.timeEstimate, priority: bulkDefaults.priority }]);
  };

  const removeBulkTask = (index) => {
    setBulkTasks(bulkTasks.filter((_, i) => i !== index));
  };

  const updateBulkTask = (index, field, value) => {
    const updatedTasks = [...bulkTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setBulkTasks(updatedTasks);
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

  const handleOnHold = async (taskId, taskName, reason) => {
    try {
      await tasksAPI.update(taskId, { status: 'On Hold', onHoldReason: reason });
      fetchTasks();
      setOnHoldDialog({ open: false, taskId: null, taskName: '', reason: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const openOnHoldDialog = (taskId, taskName) => {
    setOnHoldDialog({ open: true, taskId, taskName, reason: '' });
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      case 'Completed':
        return 'Pending';
      case 'On Hold':
        return 'Pending';
      default:
        return 'Pending';
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
      case 'On Hold':
        return 'error';
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

  const calculateTotalTime = () => {
    return tasks.reduce((total, task) => total + (task.timeEstimate || 0), 0);
  };

  const calculatePendingTime = () => {
    return tasks
      .filter(task => task.status === 'Pending')
      .reduce((total, task) => total + (task.timeEstimate || 0), 0);
  };

  const formatTimeInHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
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
    <Container maxWidth={false} sx={{ px: { xs: 0.5, sm: 1, md: 2 }, maxWidth: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Task Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and organize your tasks efficiently
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<FileText size={16} />}
            onClick={() => setBulkCreateDialog({ open: true, mode: 'form' })}
            size="small"
          >
            Bulk Create
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Time Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-around', 
            alignItems: 'center', 
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatTimeInHours(calculateTotalTime())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Time Estimate
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {formatTimeInHours(calculatePendingTime())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Tasks Time
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Changer */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <IconButton 
              onClick={() => navigateDate('prev')}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            
            <Box sx={{ 
              textAlign: 'center', 
              minWidth: { xs: 150, sm: 200 },
              flex: 1,
              px: { xs: 1, sm: 0 }
            }}>
              <Typography variant="h6" fontWeight="bold" color={`${getDateColor(selectedDate)}.main`}>
                {getDateLabel(selectedDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                wordBreak: 'break-word'
              }}>
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

      {/* Status Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 80, sm: 100 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">All</Typography>
                  <Chip 
                    label={filteredTasks.length} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }} 
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Pending</Typography>
                  <Chip 
                    label={tasks.filter(task => {
                      const taskDate = new Date(task.date);
                      const selectedDateObj = new Date(selectedDate);
                      selectedDateObj.setHours(0, 0, 0, 0);
                      const nextDay = new Date(selectedDateObj);
                      nextDay.setDate(nextDay.getDate() + 1);
                      return taskDate >= selectedDateObj && taskDate < nextDay && task.status === 'Pending';
                    }).length} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      backgroundColor: 'info.main',
                      color: 'white'
                    }} 
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <Chip 
                    label={tasks.filter(task => {
                      const taskDate = new Date(task.date);
                      const selectedDateObj = new Date(selectedDate);
                      selectedDateObj.setHours(0, 0, 0, 0);
                      const nextDay = new Date(selectedDateObj);
                      nextDay.setDate(nextDay.getDate() + 1);
                      return taskDate >= selectedDateObj && taskDate < nextDay && task.status === 'In Progress';
                    }).length} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      backgroundColor: 'warning.main',
                      color: 'white'
                    }} 
                  />
                </Box>
              }
            />
                         <Tab 
               label={
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Typography variant="body2">Completed</Typography>
                   <Chip 
                     label={tasks.filter(task => {
                       const taskDate = new Date(task.date);
                       const selectedDateObj = new Date(selectedDate);
                       selectedDateObj.setHours(0, 0, 0, 0);
                       const nextDay = new Date(selectedDateObj);
                       nextDay.setDate(nextDay.getDate() + 1);
                       return taskDate >= selectedDateObj && taskDate < nextDay && task.status === 'Completed';
                     }).length} 
                     size="small" 
                     sx={{ 
                       height: 20, 
                       fontSize: '0.7rem',
                       backgroundColor: 'success.main',
                       color: 'white'
                     }} 
                   />
                 </Box>
               }
             />
             <Tab 
               label={
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Typography variant="body2">On Hold</Typography>
                   <Chip 
                     label={tasks.filter(task => {
                       const taskDate = new Date(task.date);
                       const selectedDateObj = new Date(selectedDate);
                       selectedDateObj.setHours(0, 0, 0, 0);
                       const nextDay = new Date(selectedDateObj);
                       nextDay.setDate(nextDay.getDate() + 1);
                       return taskDate >= selectedDateObj && taskDate < nextDay && task.status === 'On Hold';
                     }).length} 
                     size="small" 
                     sx={{ 
                       height: 20, 
                       fontSize: '0.7rem',
                       backgroundColor: 'error.main',
                       color: 'white'
                     }} 
                   />
                 </Box>
               }
             />
          </Tabs>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                                 {(() => {
                   if (activeFilter) return 'No tasks found for the selected date range';
                   const tabLabels = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold'];
                   return `No ${tabLabels[activeTab].toLowerCase()} tasks for ${getDateLabel(selectedDate)}`;
                 })()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                 {(() => {
                   if (activeFilter) return 'Try adjusting your filter or create a new task';
                   const tabLabels = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold'];
                   return `No ${tabLabels[activeTab].toLowerCase()} tasks for ${getDateLabel(selectedDate).toLowerCase()}. Create a new task or navigate to a different date.`;
                 })()}
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
            <Box sx={{ overflow: 'auto', width: '100%', maxWidth: '100%' }}>
              <TableContainer component={Paper} elevation={0} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{ 
                  minWidth: { xs: 300, sm: 350, md: 400, lg: 500 },
                  width: '100%',
                  tableLayout: 'fixed',
                  '& .MuiTableCell-root': {
                    px: { xs: 0.5, sm: 1, md: 1.5 },
                    py: { xs: 0.75, sm: 1 }
                  }
                }}>
                   <TableHead>
                     <TableRow>
                       <TableCell sx={{ 
                         minWidth: { xs: 100, sm: 120, md: 150 },
                         maxWidth: { xs: 120, sm: 150, md: 'none' },
                         width: { xs: '50%', sm: '40%', md: '35%' }
                       }}>
                         Task Name
                       </TableCell>
                       <TableCell sx={{ 
                         minWidth: { xs: 60, sm: 80, md: 100 }, 
                         textAlign: 'center',
                         display: { xs: 'none', md: 'table-cell' },
                         width: { md: '10%', lg: '8%' }
                       }}>
                         Status
                       </TableCell>
                       {activeTab === 4 && (
                         <TableCell sx={{ 
                           minWidth: { xs: 120, sm: 150, md: 180 }, 
                           textAlign: 'left',
                           display: { xs: 'none', md: 'table-cell' },
                           width: { md: '15%', lg: '12%' }
                         }}>
                           On Hold Reason
                         </TableCell>
                       )}
                       <TableCell sx={{ 
                         minWidth: { xs: 60, sm: 80, md: 100 }, 
                         textAlign: 'center',
                         display: { xs: 'none', md: 'table-cell' },
                         width: { md: '10%', lg: '8%' }
                       }}>
                         Estimated Time
                       </TableCell>
                       <TableCell sx={{ 
                         minWidth: { xs: 60, sm: 70, md: 90 }, 
                         textAlign: 'center',
                         display: { xs: 'none', lg: 'table-cell' },
                         width: { lg: '8%', xl: '6%' }
                       }}>
                         Progress
                       </TableCell>
                       <TableCell sx={{ 
                         minWidth: { xs: 50, sm: 60, md: 70 }, 
                         textAlign: 'center',
                         display: { xs: 'none', xl: 'table-cell' },
                         width: { xl: '5%' }
                       }}>
                         Moves
                       </TableCell>
                       <TableCell sx={{ 
                         minWidth: { xs: 80, sm: 100, md: 120 }, 
                         textAlign: 'center',
                         width: { xs: '50%', sm: '30%', md: '15%' }
                       }}>
                         Actions
                       </TableCell>
                     </TableRow>
                   </TableHead>
                  <TableBody>
                                         {filteredTasks.map((task) => (
                       <React.Fragment key={task._id}>
                         <TableRow hover>
                                                    <TableCell>
                           <Box sx={{ minWidth: 0 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                               <Typography 
                                 variant="body1" 
                                 fontWeight="medium"
                                 sx={{
                                   wordBreak: 'break-word',
                                   lineHeight: 1.4,
                                   fontSize: { xs: '0.875rem', sm: '1rem' }
                                 }}
                               >
                                 {task.name}
                               </Typography>
                               <Chip
                                 label={task.priority}
                                 color={getPriorityColor(task.priority)}
                                 size="small"
                                 sx={{ fontSize: '0.7rem', height: 20 }}
                               />
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
                             {task.dependency && (
                               <Typography 
                                 variant="body2" 
                                 color="text.secondary"
                                 sx={{
                                   wordBreak: 'break-word',
                                   lineHeight: 1.4,
                                   fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                 }}
                               >
                                 Depends on: {task.dependency}
                               </Typography>
                             )}
                             {task.status === 'On Hold' && task.onHoldReason && activeTab !== 4 && (
                               <Typography 
                                 variant="body2" 
                                 color="error.main"
                                 sx={{
                                   wordBreak: 'break-word',
                                   lineHeight: 1.4,
                                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                   fontStyle: 'italic'
                                 }}
                               >
                                 On Hold: {task.onHoldReason}
                               </Typography>
                             )}
                             {/* Show status on mobile */}
                             <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 1, flexWrap: 'wrap' }}>
                               <Chip
                                 label={task.status}
                                 color={getStatusColor(task.status)}
                                 size="small"
                                 sx={{ fontSize: '0.7rem', height: 20 }}
                               />
                             </Box>
                             {/* Show on hold reason on mobile when in on hold tab */}
                             {activeTab === 4 && task.onHoldReason && (
                               <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 1 }}>
                                 <Typography 
                                   variant="body2" 
                                   color="error.main"
                                   sx={{
                                     wordBreak: 'break-word',
                                     lineHeight: 1.4,
                                     fontSize: '0.75rem',
                                     fontStyle: 'italic'
                                   }}
                                 >
                                   <strong>On Hold:</strong> {task.onHoldReason}
                                 </Typography>
                               </Box>
                             )}
                           </Box>
                         </TableCell>

                         <TableCell sx={{ 
                           textAlign: 'center',
                           display: { xs: 'none', md: 'table-cell' }
                         }}>
                           <Chip
                             label={task.status}
                             color={getStatusColor(task.status)}
                             size="small"
                           />
                         </TableCell>
                         {activeTab === 4 && (
                           <TableCell sx={{ 
                             textAlign: 'left',
                             display: { xs: 'none', md: 'table-cell' }
                           }}>
                             {task.onHoldReason ? (
                               <Typography 
                                 variant="body2" 
                                 color="error.main"
                                 sx={{
                                   wordBreak: 'break-word',
                                   lineHeight: 1.4,
                                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                   fontStyle: 'italic'
                                 }}
                               >
                                 {task.onHoldReason}
                               </Typography>
                             ) : (
                               <Typography 
                                 variant="body2" 
                                 color="text.secondary"
                                 sx={{
                                   fontStyle: 'italic'
                                 }}
                               >
                                 No reason provided
                               </Typography>
                             )}
                           </TableCell>
                         )}

                         <TableCell sx={{ 
                           textAlign: 'center',
                           display: { xs: 'none', md: 'table-cell' }
                         }}>
                           <Typography variant="body2">
                             {task.timeEstimate} min
                           </Typography>
                         </TableCell>

                         <TableCell sx={{ 
                           textAlign: 'center',
                           display: { xs: 'none', lg: 'table-cell' }
                         }}>
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
                         <TableCell sx={{ 
                           textAlign: 'center',
                           display: { xs: 'none', xl: 'table-cell' }
                         }}>
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
                           <Box sx={{ 
                             display: 'flex', 
                             gap: { xs: 0.5, sm: 0.75, md: 1 }, 
                             justifyContent: 'center',
                             flexWrap: 'wrap'
                           }}>
                               <IconButton
                                 size="small"
                                 onClick={() => handleOpenDialog(task)}
                                 color="primary"
                                 sx={{ 
                                   p: { xs: 0.5, sm: 0.75, md: 1 },
                                   '& .MuiSvgIcon-root': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }
                                 }}
                               >
                                 <Edit size={16} />
                               </IconButton>
                               <IconButton
                                 size="small"
                                 onClick={() => handleStatusChange(task._id, getNextStatus(task.status))}
                                 color={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : task.status === 'On Hold' ? 'error' : 'default'}
                                 sx={{ 
                                   p: { xs: 0.5, sm: 0.75, md: 1 },
                                   '& .MuiSvgIcon-root': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }
                                 }}
                                 title={`Mark as ${getNextStatus(task.status)}`}
                               >
                                 {task.status === 'Completed' ? (
                                   <CheckCircle size={16} />
                                 ) : task.status === 'In Progress' ? (
                                   <Circle size={16} />
                                 ) : task.status === 'On Hold' ? (
                                   <Circle size={16} />
                                 ) : (
                                   <Circle size={16} />
                                 )}
                               </IconButton>
                               {task.status !== 'Completed' && task.status !== 'On Hold' && (
                                 <IconButton
                                   size="small"
                                   onClick={() => openOnHoldDialog(task._id, task.name)}
                                   color="error"
                                   title="Put on hold"
                                   sx={{ 
                                     p: { xs: 0.5, sm: 0.75, md: 1 },
                                     '& .MuiSvgIcon-root': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }
                                   }}
                                 >
                                   <Circle size={16} />
                                 </IconButton>
                               )}
                               {task.status !== 'Completed' && (
                                 <IconButton
                                   size="small"
                                   onClick={() => openMoveTaskDialog(task._id, task.name)}
                                   color="info"
                                   title="Move to next day"
                                   sx={{
                                     p: { xs: 0.5, sm: 0.75, md: 1 },
                                     '& .MuiSvgIcon-root': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } },
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
                                 sx={{ 
                                   p: { xs: 0.5, sm: 0.75, md: 1 },
                                   '& .MuiSvgIcon-root': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }
                                 }}
                               >
                                 <Trash2 size={16} />
                               </IconButton>
                             </Box>
                           </TableCell>
                         </TableRow>
                         
                         {/* Expanded Steps Row */}
                         {expandedTasks.has(task._id) && task.steps && task.steps.length > 0 && (
                           <TableRow>
                             <TableCell colSpan={activeTab === 4 ? 7 : 6} sx={{ p: 0, border: 0 }}>
                               <Box sx={{ 
                                 bgcolor: 'grey.50', 
                                 p: { xs: 1.5, sm: 2 }, 
                                 borderTop: 1, 
                                 borderColor: 'divider' 
                               }}>
                                 <Box sx={{ 
                                   display: 'flex', 
                                   flexDirection: { xs: 'column', sm: 'row' },
                                   justifyContent: 'space-between', 
                                   alignItems: { xs: 'stretch', sm: 'center' }, 
                                   gap: { xs: 1, sm: 2 },
                                   mb: 2 
                                 }}>
                                   <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                     Task Steps
                                   </Typography>
                                   <Box sx={{ 
                                     display: 'flex', 
                                     alignItems: 'center', 
                                     gap: { xs: 1, sm: 2 },
                                     flexWrap: 'wrap'
                                   }}>
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                       <LinearProgress 
                                         variant="determinate" 
                                         value={task.progressPercentage || 0} 
                                         sx={{ 
                                           width: { xs: 60, sm: 80 }, 
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

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                                 <Select
                   name="status"
                   value={formData.status}
                   onChange={handleInputChange}
                   label="Status"
                 >
                   <MenuItem value="Pending">Pending</MenuItem>
                   <MenuItem value="In Progress">In Progress</MenuItem>
                   <MenuItem value="Completed">Completed</MenuItem>
                   <MenuItem value="On Hold">On Hold</MenuItem>
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

             {formData.status === 'On Hold' && (
               <TextField
                 fullWidth
                 label="On Hold Reason"
                 name="onHoldReason"
                 value={formData.onHoldReason}
                 onChange={handleInputChange}
                 margin="normal"
                 multiline
                 rows={3}
                 placeholder="Explain why this task is on hold..."
                 helperText="Provide a reason for putting this task on hold"
               />
             )}
            
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

       {/* On Hold Dialog */}
       <Dialog 
         open={onHoldDialog.open} 
         onClose={() => setOnHoldDialog({ open: false, taskId: null, taskName: '', reason: '' })}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>
           Put Task On Hold
         </DialogTitle>
         <DialogContent>
           <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
             Please provide a reason for putting "{onHoldDialog.taskName}" on hold:
           </Typography>
           <TextField
             fullWidth
             label="On Hold Reason"
             value={onHoldDialog.reason}
             onChange={(e) => setOnHoldDialog({ ...onHoldDialog, reason: e.target.value })}
             multiline
             rows={3}
             placeholder="Explain why this task is being put on hold..."
             helperText="This reason will be displayed with the task"
           />
         </DialogContent>
         <DialogActions>
           <Button 
             onClick={() => setOnHoldDialog({ open: false, taskId: null, taskName: '', reason: '' })}
           >
             Cancel
           </Button>
           <Button
             variant="contained"
             onClick={() => handleOnHold(onHoldDialog.taskId, onHoldDialog.taskName, onHoldDialog.reason)}
             color="error"
             disabled={!onHoldDialog.reason.trim()}
           >
             Put On Hold
           </Button>
         </DialogActions>
       </Dialog>

       {/* Bulk Create Dialog */}
       <Dialog open={bulkCreateDialog.open} onClose={() => setBulkCreateDialog({ open: false, mode: 'form' })} maxWidth="md" fullWidth>
         <DialogTitle>
           Bulk Create Tasks
         </DialogTitle>
         <DialogContent>
           <Box sx={{ pt: 2 }}>
             {/* Mode Tabs */}
             <Tabs 
               value={bulkCreateDialog.mode} 
               onChange={(e, newValue) => setBulkCreateDialog({ ...bulkCreateDialog, mode: newValue })}
               sx={{ mb: 3 }}
             >
               <Tab label="Form Mode" value="form" />
               <Tab label="Raw Text Mode" value="raw" />
             </Tabs>

             {/* Default Settings */}
             <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
               <TextField
                 label="Default Time Estimate (minutes)"
                 type="number"
                 value={bulkDefaults.timeEstimate}
                 onChange={(e) => setBulkDefaults({ ...bulkDefaults, timeEstimate: parseInt(e.target.value) || 30 })}
                 sx={{ minWidth: 200 }}
               />
               <FormControl sx={{ minWidth: 200 }}>
                 <InputLabel>Default Priority</InputLabel>
                 <Select
                   value={bulkDefaults.priority}
                   onChange={(e) => setBulkDefaults({ ...bulkDefaults, priority: e.target.value })}
                   label="Default Priority"
                 >
                   <MenuItem value="Low">Low</MenuItem>
                   <MenuItem value="Medium">Medium</MenuItem>
                   <MenuItem value="High">High</MenuItem>
                 </Select>
               </FormControl>
               <TextField
                 label="Default Date"
                 type="date"
                 value={bulkDefaults.date}
                 onChange={(e) => setBulkDefaults({ ...bulkDefaults, date: e.target.value })}
                 InputLabelProps={{ shrink: true }}
                 sx={{ minWidth: 200 }}
               />
             </Box>

             {bulkCreateDialog.mode === 'form' ? (
               /* Form Mode */
               <Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6">Tasks</Typography>
                   <Button
                     variant="outlined"
                     startIcon={<Plus size={16} />}
                     onClick={addBulkTask}
                     size="small"
                   >
                     Add Task
                   </Button>
                 </Box>
                 
                 {bulkTasks.map((task, index) => (
                   <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                     <TextField
                       label="Task Name"
                       value={task.name}
                       onChange={(e) => updateBulkTask(index, 'name', e.target.value)}
                       sx={{ flex: 1, minWidth: 200 }}
                       required
                     />
                     <TextField
                       label="Time Estimate (minutes)"
                       type="number"
                       value={task.timeEstimate}
                       onChange={(e) => updateBulkTask(index, 'timeEstimate', parseInt(e.target.value) || 0)}
                       sx={{ minWidth: 120 }}
                     />
                     <FormControl sx={{ minWidth: 120 }}>
                       <InputLabel>Priority</InputLabel>
                       <Select
                         value={task.priority}
                         onChange={(e) => updateBulkTask(index, 'priority', e.target.value)}
                         label="Priority"
                       >
                         <MenuItem value="Low">Low</MenuItem>
                         <MenuItem value="Medium">Medium</MenuItem>
                         <MenuItem value="High">High</MenuItem>
                       </Select>
                     </FormControl>
                     <IconButton
                       onClick={() => removeBulkTask(index)}
                       color="error"
                       size="small"
                     >
                       <Trash2 size={16} />
                     </IconButton>
                   </Box>
                 ))}
                 
                 {bulkTasks.length === 0 && (
                   <Box sx={{ textAlign: 'center', py: 4 }}>
                     <Typography variant="body2" color="text.secondary">
                       Click "Add Task" to start creating tasks
                     </Typography>
                   </Box>
                 )}
               </Box>
             ) : (
               /* Raw Text Mode */
               <Box>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                   Enter your tasks, one per line. You can include time estimates and priorities in the format:
                   <br />
                   • Task name (30min) [HIGH]
                   <br />
                   • Task name - 45 [MEDIUM]
                   <br />
                   • Simple task name (will use defaults)
                 </Typography>
                 <TextField
                   fullWidth
                   multiline
                   rows={10}
                   label="Raw Task List"
                   value={rawText}
                   onChange={(e) => setRawText(e.target.value)}
                   placeholder="Enter your tasks here, one per line..."
                   helperText={`${rawText.split('\n').filter(line => line.trim()).length} tasks detected`}
                 />
               </Box>
             )}
           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setBulkCreateDialog({ open: false, mode: 'form' })}>
             Cancel
           </Button>
           <Button
             variant="contained"
             onClick={handleBulkCreate}
             disabled={
               (bulkCreateDialog.mode === 'form' && bulkTasks.length === 0) ||
               (bulkCreateDialog.mode === 'raw' && !rawText.trim()) ||
               (bulkCreateDialog.mode === 'form' && bulkTasks.some(task => !task.name.trim()))
             }
           >
             Create Tasks
           </Button>
         </DialogActions>
       </Dialog>
     </Container>
   );
 };

export default TaskManager; 