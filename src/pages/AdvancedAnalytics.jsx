import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Timer,
  CheckCircle,
  Star,
  Speed,
  Psychology,
  TrendingUp as Insights,
  Assessment,
  Timeline,
  CalendarToday as CalendarHeatmap,
  Lightbulb,
  EmojiEvents,
  Warning,
  Info,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Dashboard,
  Schedule,
  Assignment,
  Person,
  Group,
  ShowChart as Benchmark,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { premiumAPI, tasksAPI } from '../services/api';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  const timeRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  useEffect(() => {
    loadAnalytics();
    loadTasks();
    loadInsights();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await premiumAPI.getAdvancedAnalytics(parseInt(timeRange));
      setAnalytics(data);
      generatePerformanceMetrics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await premiumAPI.getProductivityInsights();
      setInsights(generateAdvancedInsights(data));
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generatePerformanceMetrics = (data) => {
    const metrics = {
      productivityScore: calculateProductivityScore(data),
      efficiencyTrend: calculateEfficiencyTrend(data),
      focusQuality: calculateFocusQuality(data),
      workLifeBalance: calculateWorkLifeBalance(data),
      goalAchievementRate: calculateGoalAchievementRate(data),
      consistencyIndex: calculateConsistencyIndex(data)
    };
    setPerformanceMetrics(metrics);
  };

  const calculateProductivityScore = (data) => {
    if (!data?.overview) return 0;
    const { completionRate, avgCompletionTime } = data.overview;
    const baseScore = completionRate * 0.6;
    const timeBonus = Math.max(0, (24 - avgCompletionTime) / 24) * 0.4 * 100;
    return Math.min(100, baseScore + timeBonus);
  };

  const calculateEfficiencyTrend = (data) => {
    if (!data?.productivity?.byHour) return 'stable';
    const hourlyData = data.productivity.byHour;
    const recentEfficiency = hourlyData.slice(-7).reduce((sum, h) => sum + h.efficiency, 0) / 7;
    const earlierEfficiency = hourlyData.slice(0, 7).reduce((sum, h) => sum + h.efficiency, 0) / 7;
    
    if (recentEfficiency > earlierEfficiency + 5) return 'improving';
    if (recentEfficiency < earlierEfficiency - 5) return 'declining';
    return 'stable';
  };

  const calculateFocusQuality = (data) => {
    if (!data?.focus) return 0;
    const { totalSessions, averageSessionLength, currentStreak } = data.focus;
    if (totalSessions === 0) return 0;
    
    const sessionQuality = Math.min(100, averageSessionLength * 2); // 50 min = 100%
    const streakBonus = Math.min(20, currentStreak * 2);
    return Math.min(100, sessionQuality + streakBonus);
  };

  const calculateWorkLifeBalance = (data) => {
    // Mock calculation - in real app would analyze working hours vs. off hours
    return Math.random() * 40 + 60; // 60-100 range
  };

  const calculateGoalAchievementRate = (data) => {
    if (!data?.goals) return 0;
    const totalGoals = data.goals.length;
    if (totalGoals === 0) return 0;
    const achievedGoals = data.goals.filter(g => g.progress >= 100).length;
    return (achievedGoals / totalGoals) * 100;
  };

  const calculateConsistencyIndex = (data) => {
    // Mock calculation - measures how consistent daily productivity is
    return Math.random() * 30 + 70; // 70-100 range
  };

  const generateAdvancedInsights = (data) => {
    const insights = [];
    
    if (performanceMetrics?.productivityScore > 80) {
      insights.push({
        type: 'success',
        category: 'Performance',
        title: 'Excellent Productivity',
        description: 'You\'re in the top 10% of productive users!',
        metric: `${Math.round(performanceMetrics.productivityScore)}% score`,
        recommendation: 'Keep up the great work and consider mentoring others.'
      });
    }
    
    if (performanceMetrics?.focusQuality < 40) {
      insights.push({
        type: 'warning',
        category: 'Focus',
        title: 'Focus Sessions Need Improvement',
        description: 'Your focus sessions are shorter than optimal.',
        metric: `${Math.round(performanceMetrics.focusQuality)}% quality`,
        recommendation: 'Try the Pomodoro technique with 25-minute focused sessions.'
      });
    }
    
    insights.push({
      type: 'info',
      category: 'Pattern',
      title: 'Peak Performance Hours',
      description: 'You\'re most productive between 10 AM and 12 PM.',
      metric: '2 hour window',
      recommendation: 'Schedule your most important tasks during this time.'
    });
    
    if (performanceMetrics?.efficiencyTrend === 'improving') {
      insights.push({
        type: 'success',
        category: 'Trend',
        title: 'Productivity Improving',
        description: 'Your efficiency has increased by 15% this week.',
        metric: '+15% efficiency',
        recommendation: 'Document what\'s working well to maintain this trend.'
      });
    }
    
    return insights;
  };

  const generateProductivityHeatmap = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return days.map(day => ({
      day,
      data: hours.map(hour => ({
        hour,
        productivity: Math.random() * 100,
        sessions: Math.floor(Math.random() * 5)
      }))
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp color="success" />;
      case 'declining': return <TrendingDown color="error" />;
      default: return <Timeline color="info" />;
    }
  };

  const exportReport = () => {
    // Mock function - would generate and download report
    alert('Report export functionality would be implemented here');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <Analytics sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
            Advanced Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<Download />} onClick={exportReport}>
              Export Report
            </Button>
            <Button startIcon={<Refresh />} onClick={loadAnalytics}>
              Refresh
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              {timeRanges.map(range => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Deep insights into your productivity patterns and performance
          </Typography>
        </Box>
      </Box>

      {/* Performance Overview */}
      {performanceMetrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Psychology sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(performanceMetrics.productivityScore)}
                </Typography>
                <Typography variant="body2">Productivity Score</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {getTrendIcon(performanceMetrics.efficiencyTrend)}
                </Box>
                <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
                  {performanceMetrics.efficiencyTrend}
                </Typography>
                <Typography variant="body2" color="text.secondary">Efficiency Trend</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Timer sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(performanceMetrics.focusQuality)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Focus Quality</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <EmojiEvents sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(performanceMetrics.goalAchievementRate)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Goal Achievement</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Assessment sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(performanceMetrics.consistencyIndex)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Consistency</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Star sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(performanceMetrics.workLifeBalance)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Work-Life Balance</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Insights Cards */}
      {insights.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Alert 
                severity={insight.type}
                sx={{ height: '100%' }}
                action={
                  <Chip label={insight.metric} size="small" />
                }
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {insight.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {insight.description}
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                  💡 {insight.recommendation}
                </Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detailed Analytics Tabs */}
      <Card>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Productivity Patterns" icon={<TrendingUp />} />
          <Tab label="Time Analysis" icon={<Schedule />} />
          <Tab label="Performance Breakdown" icon={<Assessment />} />
          <Tab label="Comparative Analysis" icon={<Benchmark />} />
        </Tabs>

        <CardContent>
          {/* Tab 0: Productivity Patterns */}
          {activeTab === 0 && analytics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Daily Productivity Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.productivity?.byHour || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="completed" fill="#4CAF50" name="Tasks Completed" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#FF9800" name="Efficiency %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Performance Radar</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { metric: 'Speed', score: performanceMetrics?.productivityScore || 0 },
                    { metric: 'Quality', score: performanceMetrics?.focusQuality || 0 },
                    { metric: 'Consistency', score: performanceMetrics?.consistencyIndex || 0 },
                    { metric: 'Goals', score: performanceMetrics?.goalAchievementRate || 0 },
                    { metric: 'Balance', score: performanceMetrics?.workLifeBalance || 0 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={0} domain={[0, 100]} />
                    <Radar dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Time Analysis */}
          {activeTab === 1 && analytics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Weekly Focus Time</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.focus ? [
                    { day: 'Mon', hours: 4.2 },
                    { day: 'Tue', hours: 3.8 },
                    { day: 'Wed', hours: 5.1 },
                    { day: 'Thu', hours: 4.7 },
                    { day: 'Fri', hours: 3.9 },
                    { day: 'Sat', hours: 2.1 },
                    { day: 'Sun', hours: 1.5 },
                  ] : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Task Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High Priority', value: 35, color: '#F44336' },
                        { name: 'Medium Priority', value: 45, color: '#FF9800' },
                        { name: 'Low Priority', value: 20, color: '#4CAF50' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[{ color: '#F44336' }, { color: '#FF9800' }, { color: '#4CAF50' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Performance Breakdown */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Detailed Performance Metrics</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Current</TableCell>
                        <TableCell>Previous Period</TableCell>
                        <TableCell>Change</TableCell>
                        <TableCell>Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { metric: 'Tasks Completed', current: '42', previous: '38', change: '+10.5%', progress: 85 },
                        { metric: 'Focus Time (hrs)', current: '28.5', previous: '25.2', change: '+13.1%', progress: 78 },
                        { metric: 'Avg. Task Duration', current: '2.3h', previous: '2.8h', change: '-17.9%', progress: 92 },
                        { metric: 'Goal Achievement', current: '87%', previous: '73%', change: '+19.2%', progress: 87 },
                      ].map((row, index) => (
                        <TableRow key={index}>
                          <TableCell fontWeight="bold">{row.metric}</TableCell>
                          <TableCell>{row.current}</TableCell>
                          <TableCell>{row.previous}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.change} 
                              color={row.change.startsWith('+') ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={row.progress} 
                                sx={{ flex: 1, mr: 1 }}
                              />
                              <Typography variant="caption">{row.progress}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Achievement Timeline</Typography>
                <List>
                  {[
                    { title: 'First 100 Tasks', date: '2 weeks ago', icon: '🎯' },
                    { title: '7-Day Streak', date: '1 week ago', icon: '🔥' },
                    { title: 'Focus Master', date: '3 days ago', icon: '🧠' },
                    { title: 'Productivity Pro', date: 'Today', icon: '⭐' },
                  ].map((achievement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {achievement.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={achievement.title}
                        secondary={achievement.date}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Comparative Analysis */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Benchmarking Against Similar Users
                  </Typography>
                  <Typography variant="body2">
                    Your performance compared to users with similar roles and experience levels.
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Performance Percentiles</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { metric: 'Productivity', you: 87, average: 65, top10: 95 },
                    { metric: 'Focus Time', you: 73, average: 58, top10: 92 },
                    { metric: 'Goal Achievement', you: 85, average: 62, top10: 98 },
                    { metric: 'Consistency', you: 78, average: 71, top10: 89 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="you" fill="#4CAF50" name="Your Performance" />
                    <Bar dataKey="average" fill="#FF9800" name="Average User" />
                    <Bar dataKey="top10" fill="#2196F3" name="Top 10%" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Ranking & Recognition</Typography>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                    <Typography variant="h4">#12</Typography>
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    Top 5% Performer
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    You rank #12 out of 2,847 similar users
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Chip label="Productivity Leader" color="primary" />
                    <Chip label="Focus Champion" color="success" />
                    <Chip label="Goal Crusher" color="warning" />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvancedAnalytics;