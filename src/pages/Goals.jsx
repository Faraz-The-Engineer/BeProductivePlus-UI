import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrackChanges as Target,
  Flag,
  
  Timer,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  EmojiEvents,
  Star,
  Lightbulb,
  Assignment,
  Analytics,
  PlayArrow,
  Pause,
  Archive,
  Restore,
  Share,
  Group,
  EmojiEvents as Award,
  TrendingDown,
  Warning,
  Remove,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { premiumAPI } from '../services/api';
import { Timeline } from '@mui/lab';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [milestoneDialog, setMilestoneDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'custom',
    targetValue: '',
    unit: 'tasks',
    deadline: null,
    priority: 'Medium',
    milestones: []
  });
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    targetValue: ''
  });

  const categories = [
    { value: 'daily', label: 'Daily Goal' },
    { value: 'weekly', label: 'Weekly Goal' },
    { value: 'monthly', label: 'Monthly Goal' },
    { value: 'yearly', label: 'Yearly Goal' },
    { value: 'custom', label: 'Custom Goal' }
  ];

  const units = [
    { value: 'tasks', label: 'Tasks', icon: '✅' },
    { value: 'hours', label: 'Hours', icon: '⏰' },
    { value: 'projects', label: 'Projects', icon: '📋' },
    { value: 'sessions', label: 'Focus Sessions', icon: '🧠' },
    { value: 'habits', label: 'Habit Days', icon: '🔥' },
    { value: 'points', label: 'Points', icon: '⭐' },
    { value: 'percentage', label: 'Percentage', icon: '📊' },
    { value: 'custom', label: 'Custom', icon: '🎯' }
  ];

  useEffect(() => {
    loadGoals();
    loadAnalytics();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await premiumAPI.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await premiumAPI.getProductivityInsights();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const goalData = {
        ...formData,
        targetValue: Number(formData.targetValue),
        deadline: formData.deadline ? new Date(formData.deadline) : null
      };

      if (editingGoal) {
        await premiumAPI.updateGoal(editingGoal._id, goalData);
      } else {
        await premiumAPI.createGoal(goalData);
      }

      loadGoals();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: 'custom',
      targetValue: '',
      unit: 'tasks',
      deadline: null,
      priority: 'Medium',
      milestones: []
    });
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      deadline: goal.deadline ? new Date(goal.deadline) : null,
      priority: goal.priority,
      milestones: goal.milestones || []
    });
    setOpenDialog(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await premiumAPI.deleteGoal(goalId);
        loadGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleUpdateProgress = async (goalId, increment) => {
    try {
      const goal = goals.find(g => g._id === goalId);
      const newValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + increment));
      
      await premiumAPI.updateGoal(goalId, { 
        currentValue: newValue,
        status: newValue >= goal.targetValue ? 'completed' : 'active'
      });
      
      loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const addMilestone = () => {
    if (milestoneData.title && milestoneData.targetValue) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, {
          title: milestoneData.title,
          targetValue: Number(milestoneData.targetValue),
          completed: false
        }]
      }));
      setMilestoneData({ title: '', targetValue: '' });
    }
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const getProgressPercentage = (goal) => {
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const getGoalIcon = (unit) => {
    const unitObj = units.find(u => u.value === unit);
    return unitObj ? unitObj.icon : '🎯';
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getGoalsByStatus = (status) => {
    return goals.filter(goal => goal.status === status);
  };

  const getFilteredGoals = () => {
    switch (activeTab) {
      case 0: return goals.filter(g => g.status === 'active');
      case 1: return goals.filter(g => g.status === 'completed');
      case 2: return goals.filter(g => g.status === 'paused');
      case 3: return goals.filter(g => g.status === 'archived');
      default: return goals;
    }
  };

  const generateGoalAnalytics = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const categoryData = categories.map(cat => ({
      name: cat.label,
      value: goals.filter(g => g.category === cat.value).length
    })).filter(item => item.value > 0);

    const progressData = activeGoals.map(goal => ({
      name: goal.title.slice(0, 15) + (goal.title.length > 15 ? '...' : ''),
      progress: getProgressPercentage(goal),
      target: goal.targetValue,
      current: goal.currentValue
    }));

    return { categoryData, progressData, activeGoals: activeGoals.length, completedGoals: completedGoals.length };
  };

  const goalAnalytics = generateGoalAnalytics();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            🎯 Goals & Achievements
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Set, track, and achieve your most important objectives
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {goalAnalytics.activeGoals}
                    </Typography>
                    <Typography variant="body2">Active Goals</Typography>
                  </Box>
                  <Target size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {goalAnalytics.completedGoals}
                    </Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Box>
                  <EmojiEvents size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics?.achievements?.level || 1}
                    </Typography>
                    <Typography variant="body2">Achievement Level</Typography>
                  </Box>
                  <Star size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + getProgressPercentage(goal), 0) / goals.length) : 0}%
                    </Typography>
                    <Typography variant="body2">Avg Progress</Typography>
                  </Box>
                  <TrendingUp size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Goals List */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">My Goals</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Goal
                  </Button>
                </Box>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                  <Tab label={`Active (${getGoalsByStatus('active').length})`} />
                  <Tab label={`Completed (${getGoalsByStatus('completed').length})`} />
                  <Tab label={`Paused (${getGoalsByStatus('paused').length})`} />
                  <Tab label={`Archived (${getGoalsByStatus('archived').length})`} />
                </Tabs>

                {/* Goals List */}
                <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                  {getFilteredGoals().length === 0 ? (
                    <Alert severity="info" sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">No goals found</Typography>
                      <Typography>Start by creating your first goal to track your progress!</Typography>
                    </Alert>
                  ) : (
                    getFilteredGoals().map((goal) => (
                      <Card key={goal._id} sx={{ mb: 2, border: 1, borderColor: 'grey.200' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" sx={{ mr: 2, fontWeight: 'bold' }}>
                                  {getGoalIcon(goal.unit)} {goal.title}
                                </Typography>
                                <Chip 
                                  label={goal.category} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 1 }}
                                />
                                <Chip 
                                  label={goal.priority} 
                                  size="small" 
                                  color={goal.priority === 'High' ? 'error' : goal.priority === 'Medium' ? 'warning' : 'default'}
                                />
                                {goal.deadline && (
                                  <Chip 
                                    label={`${getDaysRemaining(goal.deadline)} days left`}
                                    size="small" 
                                    color={getDaysRemaining(goal.deadline) < 7 ? 'error' : 'info'}
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                              
                              {goal.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {goal.description}
                                </Typography>
                              )}

                              {/* Progress */}
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">
                                    Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {Math.round(getProgressPercentage(goal))}%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={getProgressPercentage(goal)}
                                  color={getProgressColor(getProgressPercentage(goal))}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>

                              {/* Milestones */}
                              {goal.milestones && goal.milestones.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    Milestones:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {goal.milestones.map((milestone, index) => (
                                      <Chip
                                        key={index}
                                        label={`${milestone.title} (${milestone.targetValue})`}
                                        size="small"
                                        color={milestone.completed ? 'success' : 'default'}
                                        icon={milestone.completed ? <CheckCircle /> : <RadioButtonUnchecked />}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>

                            <Box sx={{ ml: 2 }}>
                              <IconButton onClick={() => handleEditGoal(goal)} size="small">
                                <Edit />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteGoal(goal._id)} size="small" color="error">
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Quick Actions */}
                          {goal.status === 'active' && (
                            <CardActions sx={{ pt: 0 }}>
                              <Button
                                size="small"
                                onClick={() => handleUpdateProgress(goal._id, 1)}
                                startIcon={<Add />}
                                disabled={goal.currentValue >= goal.targetValue}
                              >
                                +1
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleUpdateProgress(goal._id, -1)}
                                startIcon={<Remove />}
                                disabled={goal.currentValue <= 0}
                              >
                                -1
                              </Button>
                              {goal.unit === 'tasks' && (
                                <Button
                                  size="small"
                                  onClick={() => handleUpdateProgress(goal._id, 5)}
                                  startIcon={<Add />}
                                  disabled={goal.currentValue >= goal.targetValue}
                                >
                                  +5
                                </Button>
                              )}
                            </CardActions>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Goal Distribution */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Goal Distribution
                  </Typography>
                  {goalAnalytics.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={goalAnalytics.categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {goalAnalytics.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      No goals to display
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Progress Overview
                  </Typography>
                  {goalAnalytics.progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={goalAnalytics.progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="progress" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      No active goals to display
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Achievement Status */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Award sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Achievement Status
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                      <Typography variant="h5">{analytics?.achievements?.level || 1}</Typography>
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Level {analytics?.achievements?.level || 1}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {analytics?.achievements?.experiencePoints || 0} XP
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={((analytics?.achievements?.experiencePoints || 0) % 1000) / 10}
                      sx={{ height: 8, borderRadius: 4, mt: 1 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {1000 - ((analytics?.achievements?.experiencePoints || 0) % 1000)} XP to next level
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Goal Setting Tips
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Make goals SMART"
                        secondary="Specific, Measurable, Achievable, Relevant, Time-bound"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Target color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Break into milestones"
                        secondary="Smaller targets are easier to achieve"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Track regularly"
                        secondary="Daily progress updates boost motivation"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Add/Edit Goal Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Goal Title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete 10 projects this month"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this goal means to you..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Target Value"
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="e.g., 10"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    >
                      {units.map(unit => (
                        <MenuItem key={unit.value} value={unit.value}>
                          {unit.icon} {unit.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <DatePicker
                    label="Deadline (optional)"
                    value={formData.deadline}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, deadline: newValue }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                {/* Milestones Section */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Milestones ({formData.milestones.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={5}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Milestone Title"
                              value={milestoneData.title}
                              onChange={(e) => setMilestoneData(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Target Value"
                              value={milestoneData.targetValue}
                              onChange={(e) => setMilestoneData(prev => ({ ...prev, targetValue: e.target.value }))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={addMilestone}
                              disabled={!milestoneData.title || !milestoneData.targetValue}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>

                      {formData.milestones.map((milestone, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={`${milestone.title} (${milestone.targetValue})`}
                            onDelete={() => removeMilestone(index)}
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.title || !formData.targetValue}
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Goals;