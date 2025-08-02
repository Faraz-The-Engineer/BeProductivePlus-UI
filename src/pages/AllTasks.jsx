import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Container,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
} from '@mui/material';
import {
  Edit,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Circle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

const AllTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Pending, 2: In Progress, 3: Completed, 4: On Hold

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    
    // Apply status filtering based on active tab
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
  }, [tasks, activeTab]);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
            All Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all your tasks across all dates
          </Typography>
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
                    label={tasks.length} 
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
                    label={tasks.filter(task => task.status === 'Pending').length} 
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
                    label={tasks.filter(task => task.status === 'In Progress').length} 
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
                    label={tasks.filter(task => task.status === 'Completed').length} 
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
                    label={tasks.filter(task => task.status === 'On Hold').length} 
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
                  const tabLabels = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold'];
                  return `No ${tabLabels[activeTab].toLowerCase()} tasks found`;
                })()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {(() => {
                  const tabLabels = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold'];
                  return `No ${tabLabels[activeTab].toLowerCase()} tasks available.`;
                })()}
              </Typography>
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
                        width: { xs: '40%', sm: '35%', md: '30%' }
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
                      <TableCell sx={{ 
                        minWidth: { xs: 80, sm: 100, md: 120 }, 
                        textAlign: 'center',
                        display: { xs: 'none', lg: 'table-cell' },
                        width: { lg: '10%', xl: '8%' }
                      }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ 
                        minWidth: { xs: 60, sm: 80, md: 100 }, 
                        textAlign: 'center',
                        display: { xs: 'none', md: 'table-cell' },
                        width: { md: '10%', lg: '8%' }
                      }}>
                        Time
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
                        minWidth: { xs: 80, sm: 100, md: 120 }, 
                        textAlign: 'center',
                        width: { xs: '60%', sm: '45%', md: '25%' }
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
                              {task.status === 'On Hold' && task.onHoldReason && (
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
                                <Chip
                                  label={formatDate(task.date)}
                                  color={getTaskDateColor(task.date)}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
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

                          <TableCell sx={{ 
                            textAlign: 'center',
                            display: { xs: 'none', lg: 'table-cell' }
                          }}>
                            <Chip
                              label={formatDate(task.date)}
                              color={getTaskDateColor(task.date)}
                              size="small"
                            />
                          </TableCell>

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

                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: { xs: 0.5, sm: 0.75, md: 1 }, 
                              justifyContent: 'center',
                              flexWrap: 'wrap'
                            }}>
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
                                ) : (
                                  <Circle size={16} />
                                )}
                              </IconButton>
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
                            <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
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
    </Container>
  );
};

export default AllTasks; 