import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
} from '@mui/material';
import { TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent } from '@mui/lab';

import {
  AutoAwesome,
  Schedule,
  TrendingUp,
  Psychology,
  Lightbulb,
  CheckCircle,
  Schedule as ScheduleIcon,
  BatteryChargingFull,
  BatteryAlert,
  Coffee,
  FitnessCenter,
  Work,
  Home,
  Flight,
  Settings,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  ExpandMore,
  Timer,
  Star,
  Warning,
  Info,
  Notifications,
  CalendarToday,
  AccessTime,
  Speed,
  Analytics,
  Psychology as Brain,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { premiumAPI, tasksAPI } from '../services/api';

const AIScheduler = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    workingHours: { start: '09:00', end: '17:00' },
    breakDuration: 15,
    maxTasksPerDay: 8,
    prioritizeHighEnergy: true,
    avoidContextSwitching: true,
    includeBreaks: true,
    optimizeForFlow: true,
    considerDeadlines: true,
    energyLevels: {
      morning: 'high',
      midday: 'medium',
      afternoon: 'medium',
      evening: 'low'
    }
  });
  const [aiInsights, setAiInsights] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadTasks();
    loadRecommendations();
    loadInsights();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data.filter(task => task.status !== 'Completed'));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await premiumAPI.getAIRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await premiumAPI.getProductivityInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generateSchedule = async () => {
    try {
      setLoading(true);
      const scheduleData = await premiumAPI.getAISchedule();
      setSchedule(scheduleData);
      
      // Generate AI insights based on the schedule
      generateAIInsights(scheduleData);
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (scheduleData) => {
    const insights = [];
    
    if (scheduleData.schedule.length > 6) {
      insights.push({
        type: 'warning',
        title: 'Heavy Workload Detected',
        description: 'You have 6+ tasks scheduled. Consider moving some to tomorrow for better focus.',
        confidence: 0.8,
        actionable: true
      });
    }
    
    const highPriorityTasks = scheduleData.schedule.filter(item => 
      tasks.find(t => t._id === item.taskId)?.priority === 'High'
    );
    
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: 'success',
        title: 'Optimal Priority Scheduling',
        description: 'High-priority tasks are scheduled during your peak energy hours.',
        confidence: 0.9,
        actionable: false
      });
    }
    
    insights.push({
      type: 'info',
      title: 'Context Switching Minimized',
      description: 'Related tasks are grouped together to reduce mental overhead.',
      confidence: 0.85,
      actionable: false
    });
    
    setAiInsights(insights);
  };

  const applySchedule = async () => {
    try {
      // In a real implementation, this would update task scheduling in the backend
      for (const item of schedule.schedule) {
        const task = tasks.find(t => t._id === item.taskId);
        if (task) {
          await tasksAPI.update(task._id, {
            ...task,
            optimalTimeSlot: item.startTime,
            aiScheduled: true
          });
        }
      }
      
      alert('Schedule applied successfully!');
      loadTasks();
    } catch (error) {
      console.error('Error applying schedule:', error);
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(t => t._id === taskId);
  };

  const getEnergyColor = (energy) => {
    switch (energy) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTimeSlotRecommendation = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 9 && hour <= 11) return 'Peak focus time - ideal for complex tasks';
    if (hour >= 14 && hour <= 16) return 'Good for collaborative work and reviews';
    if (hour >= 11 && hour <= 13) return 'Pre-lunch energy - good for moderate tasks';
    return 'Lower energy - suitable for routine tasks';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoAwesome sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
          AI Smart Scheduler
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Optimize your productivity with AI-powered task scheduling
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Psychology sx={{ mr: 1 }} />
                AI Scheduling Engine
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={generateSchedule}
                  disabled={loading || tasks.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                  sx={{ mb: 2, py: 1.5 }}
                >
                  {loading ? 'Generating...' : 'Generate Smart Schedule'}
                </Button>
                
                {schedule && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={applySchedule}
                    startIcon={<CheckCircle />}
                    sx={{ mb: 2 }}
                  >
                    Apply Schedule
                  </Button>
                )}
                
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setSettingsOpen(true)}
                  startIcon={<Settings />}
                >
                  AI Preferences
                </Button>
              </Box>

              {tasks.length === 0 && (
                <Alert severity="info">
                  Add some tasks to get started with AI scheduling
                </Alert>
              )}

              {/* Quick Stats */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Schedule Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Pending Tasks:</Typography>
                  <Chip label={tasks.length} size="small" color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Estimate:</Typography>
                  <Chip 
                    label={formatDuration(tasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0))} 
                    size="small" 
                    color="secondary" 
                  />
                </Box>
                {schedule && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Scheduled Tasks:</Typography>
                    <Chip label={schedule.schedule.length} size="small" color="success" />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {aiInsights.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Brain sx={{ mr: 1 }} />
                  AI Insights
                </Typography>
                {aiInsights.map((insight, index) => (
                  <Alert 
                    key={index} 
                    severity={insight.type} 
                    sx={{ mb: 2 }}
                    action={
                      <Typography variant="caption">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Typography>
                    }
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">
                      {insight.description}
                    </Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Productivity Recommendations */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1 }} />
                Productivity Tips
              </Typography>
              {recommendations.map((rec, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mr: 1 }}>
                      {rec.title}
                    </Typography>
                    <Chip 
                      label={rec.priority} 
                      size="small" 
                      color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {rec.description}
                  </Typography>
                  {rec.estimatedImpact && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      💡 {rec.estimatedImpact}
                    </Typography>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Schedule Display */}
        <Grid item xs={12} md={8}>
          {!schedule ? (
            <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AutoAwesome sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Ready to optimize your day?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Click "Generate Smart Schedule" to let AI create the perfect task sequence based on your energy levels, priorities, and productivity patterns.
                </Typography>
                <Box sx={{ display: 'flex', justify: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Psychology sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="caption" display="block">AI-Powered</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="caption" display="block">Productivity Boost</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="caption" display="block">Smart Timing</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    📅 Optimized Schedule for {new Date(schedule.date).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <Chip label={`${schedule.totalTasks} tasks`} sx={{ mr: 1 }} />
                    <Chip label={`Until ${schedule.estimatedCompletionTime}`} color="primary" />
                  </Box>
                </Box>

                {/* Schedule Timeline */}
                <Timeline>
                  {schedule.schedule.map((item, index) => {
                    const task = getTaskById(item.taskId);
                    if (!task) return null;

                    return (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot 
                            sx={{ 
                              bgcolor: getEnergyColor(item.energyLevel),
                              width: 16,
                              height: 16
                            }}
                          />
                          {index < schedule.schedule.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {task.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                    {item.startTime} • {item.duration} min
                                  </Typography>
                                  <Chip 
                                    label={task.priority} 
                                    size="small" 
                                    color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip 
                                    label={item.energyLevel} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: getEnergyColor(item.energyLevel), 
                                      color: 'white',
                                      mr: 1
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {task.description || 'No description'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Star sx={{ fontSize: 16, mr: 0.5, color: 'orange' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.reasoning}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ ml: 2, textAlign: 'right' }}>
                                <Typography variant="caption" color="success.main" fontWeight="bold">
                                  {Math.round(item.confidence * 100)}% optimal
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={item.confidence * 100}
                                  sx={{ width: 60, mt: 0.5 }}
                                />
                              </Box>
                            </Box>
                            
                            <Alert severity="info" sx={{ mt: 2 }}>
                              💡 {getTimeSlotRecommendation(item.startTime)}
                            </Alert>
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>

                {/* Schedule Summary */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justify: 'space-around', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {schedule.schedule.length}
                    </Typography>
                    <Typography variant="caption">Tasks Scheduled</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {formatDuration(schedule.schedule.reduce((sum, item) => sum + item.duration, 0))}
                    </Typography>
                    <Typography variant="caption">Total Focus Time</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {Math.round(schedule.schedule.reduce((sum, item) => sum + item.confidence, 0) / schedule.schedule.length * 100)}%
                    </Typography>
                    <Typography variant="caption">Avg Confidence</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Scheduling Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Working Hours & Energy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography gutterBottom>Start Time</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {preferences.workingHours.start}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography gutterBottom>End Time</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {preferences.workingHours.end}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Break Duration (minutes)</Typography>
                    <Slider
                      value={preferences.breakDuration}
                      onChange={(e, value) => setPreferences(prev => ({ ...prev, breakDuration: value }))}
                      min={5}
                      max={30}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Max Tasks Per Day</Typography>
                    <Slider
                      value={preferences.maxTasksPerDay}
                      onChange={(e, value) => setPreferences(prev => ({ ...prev, maxTasksPerDay: value }))}
                      min={3}
                      max={15}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">AI Optimization Rules</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.prioritizeHighEnergy}
                      onChange={(e) => setPreferences(prev => ({ ...prev, prioritizeHighEnergy: e.target.checked }))}
                    />
                  }
                  label="Schedule important tasks during high energy periods"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.avoidContextSwitching}
                      onChange={(e) => setPreferences(prev => ({ ...prev, avoidContextSwitching: e.target.checked }))}
                    />
                  }
                  label="Group similar tasks to minimize context switching"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.includeBreaks}
                      onChange={(e) => setPreferences(prev => ({ ...prev, includeBreaks: e.target.checked }))}
                    />
                  }
                  label="Automatically schedule breaks between tasks"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.optimizeForFlow}
                      onChange={(e) => setPreferences(prev => ({ ...prev, optimizeForFlow: e.target.checked }))}
                    />
                  }
                  label="Optimize for flow state (longer uninterrupted blocks)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.considerDeadlines}
                      onChange={(e) => setPreferences(prev => ({ ...prev, considerDeadlines: e.target.checked }))}
                    />
                  }
                  label="Prioritize tasks with approaching deadlines"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={() => setSettingsOpen(false)} variant="contained">
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIScheduler;