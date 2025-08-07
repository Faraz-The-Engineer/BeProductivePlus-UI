import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Timer,
  Coffee,
  Psychology as Brain,
  TrackChanges as Target,
  TrendingUp,
  Notifications,
  NotificationsOff,
  VolumeUp,
  VolumeOff,
  ExpandMore,
  Analytics,
  EmojiEvents,
  Lightbulb,
  Block,
  CheckCircle,
  Star,
  Whatshot as Fire,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { premiumAPI } from '../services/api';

const FocusMode = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro'); // pomodoro, break, long-break
  const [completedSessions, setCompletedSessions] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionEndDialog, setSessionEndDialog] = useState(false);
  const [productivity, setProductivity] = useState(5);
  const [todayStats, setTodayStats] = useState({
    focusTime: 0,
    sessionsCompleted: 0,
    distractionsBlocked: 0,
    productivity: 0
  });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [settings, setSettings] = useState({
    pomodoroLength: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
    strictMode: false, // Prevents switching tabs
    distractionBlocking: true
  });
  const [activeTab, setActiveTab] = useState(0);
  const [distractionsBlocked, setDistractionsBlocked] = useState(0);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadTodayStats();
    loadWeeklyStats();
    loadAchievements();
    setMotivationalQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Focus mode strict mode - detect tab switching
  useEffect(() => {
    if (isRunning && settings.strictMode) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setDistractionsBlocked(prev => prev + 1);
          if (settings.notificationsEnabled) {
            showNotification('Stay focused!', 'You switched tabs. Come back to your focus session.');
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isRunning, settings.strictMode, settings.notificationsEnabled]);

  const loadTodayStats = async () => {
    try {
      const stats = await premiumAPI.getTodayStats();
      setTodayStats(stats);
      setStreakCount(stats.currentStreak || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      const stats = await premiumAPI.getWeeklyStats();
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const achievementData = await premiumAPI.getAchievements();
      setAchievements(achievementData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const startSession = async () => {
    try {
      const duration = sessionType === 'pomodoro' ? settings.pomodoroLength : 
                     sessionType === 'break' ? settings.shortBreak : settings.longBreak;
      
      const session = await premiumAPI.startFocusSession({
        duration: duration,
        type: sessionType
      });
      
      setCurrentSession(session);
      setTimeLeft(duration * 60);
      setIsRunning(true);
      setDistractionsBlocked(0);
      
      if (settings.notificationsEnabled) {
        showNotification('Focus session started!', `${duration} minute ${sessionType} session beginning now.`);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const stopSession = () => {
    setIsRunning(false);
    setTimeLeft(settings.pomodoroLength * 60);
    setCurrentSession(null);
    setDistractionsBlocked(0);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (settings.soundEnabled) {
      playCompletionSound();
    }
    
    if (sessionType === 'pomodoro') {
      setSessionEndDialog(true);
    } else {
      // Auto transition from break
      if (settings.autoStartPomodoros) {
        setSessionType('pomodoro');
        setTimeout(() => startSession(), 2000);
      } else {
        setSessionType('pomodoro');
        setTimeLeft(settings.pomodoroLength * 60);
      }
    }
    
    setCompletedSessions(prev => prev + 1);
    
    if (settings.notificationsEnabled) {
      const message = sessionType === 'pomodoro' ? 
        'Great work! Time for a break.' : 
        'Break over! Ready to focus again?';
      showNotification('Session Complete!', message);
    }
  };

  const completeSession = async () => {
    try {
      await premiumAPI.completeFocusSession(currentSession.sessionId, {
        productivity,
        distractionsBlocked,
        tasksCompleted: [] // You could integrate with task selection
      });
      
      setSessionEndDialog(false);
      setCurrentSession(null);
      
      // Transition to break
      const nextBreakType = completedSessions % 4 === 3 ? 'long-break' : 'break';
      setSessionType(nextBreakType);
      setTimeLeft((nextBreakType === 'long-break' ? settings.longBreak : settings.shortBreak) * 60);
      
      if (settings.autoStartBreaks) {
        setTimeout(() => startSession(), 1000);
      }
      
      // Update stats
      loadTodayStats();
      checkAchievements();
      
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    // First session achievement
    if (completedSessions === 1) {
      newAchievements.push({
        title: 'First Focus!',
        description: 'Completed your first focus session',
        icon: '🎯'
      });
    }
    
    // Streak achievements
    if (streakCount === 7) {
      newAchievements.push({
        title: 'Week Warrior',
        description: '7-day focus streak!',
        icon: '🔥'
      });
    }
    
    // Daily goal achievement
    if (completedSessions >= dailyGoal) {
      newAchievements.push({
        title: 'Daily Goal Crusher',
        description: 'Met your daily focus goal!',
        icon: '🏆'
      });
    }
    
    // Show achievement notifications
    newAchievements.forEach(achievement => {
      if (settings.notificationsEnabled) {
        showNotification(`Achievement Unlocked! ${achievement.icon}`, achievement.title);
      }
    });
  };

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = sessionType === 'pomodoro' ? settings.pomodoroLength * 60 :
                     sessionType === 'break' ? settings.shortBreak * 60 : settings.longBreak * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getRandomQuote = () => {
    const quotes = [
      'Focus is the key to achieving anything you want in life.',
      'The successful warrior is the average person with laser-like focus.',
      'Where focus goes, energy flows and results show.',
      'Concentrate all your thoughts upon the work at hand.',
      'Focus on being productive instead of busy.',
      'Your focus determines your reality.',
      'The art of being wise is knowing what to overlook.',
      'Focus is not about saying yes, but about saying no.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getSessionTypeColor = () => {
    switch (sessionType) {
      case 'pomodoro': return '#e53e3e';
      case 'break': return '#38a169';
      case 'long-break': return '#3182ce';
      default: return '#e53e3e';
    }
  };

  const getSessionTypeIcon = () => {
    switch (sessionType) {
      case 'pomodoro': return <Timer />;
      case 'break': return <Coffee />;
      case 'long-break': return <Coffee />;
      default: return <Timer />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: getSessionTypeColor() }}>
          🧠 Focus Mode
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {motivationalQuote}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Timer */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            minHeight: 500, 
            background: `linear-gradient(135deg, ${getSessionTypeColor()}15, ${getSessionTypeColor()}05)`,
            border: `2px solid ${getSessionTypeColor()}30`
          }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              {/* Session Type Indicator */}
              <Box sx={{ mb: 3 }}>
                <Chip 
                  icon={getSessionTypeIcon()}
                  label={sessionType.replace('-', ' ').toUpperCase()}
                  sx={{ 
                    fontSize: '1.1rem',
                    p: 2,
                    backgroundColor: getSessionTypeColor(),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              {/* Timer Display */}
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                <CircularProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  size={250}
                  thickness={8}
                  sx={{ 
                    color: getSessionTypeColor(),
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {formatTime(timeLeft)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {sessionType === 'pomodoro' ? 'Focus Time' : 'Break Time'}
                  </Typography>
                </Box>
              </Box>

              {/* Control Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                {!isRunning ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={startSession}
                    sx={{ 
                      minWidth: 120,
                      backgroundColor: getSessionTypeColor(),
                      '&:hover': {
                        backgroundColor: getSessionTypeColor(),
                        opacity: 0.8
                      }
                    }}
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Pause />}
                    onClick={pauseSession}
                    sx={{ minWidth: 120 }}
                  >
                    Pause
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Stop />}
                  onClick={stopSession}
                  disabled={!currentSession}
                  sx={{ minWidth: 120 }}
                >
                  Stop
                </Button>

                <IconButton
                  onClick={() => setSettingsOpen(true)}
                  sx={{ ml: 1 }}
                >
                  <Settings />
                </IconButton>
              </Box>

              {/* Session Stats */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {completedSessions}
                    </Typography>
                    <Typography variant="caption">Sessions Today</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {Math.round((completedSessions / dailyGoal) * 100)}%
                    </Typography>
                    <Typography variant="caption">Daily Goal</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Badge badgeContent={distractionsBlocked} color="error">
                      <Block />
                    </Badge>
                    <Typography variant="caption" display="block">Distractions</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Daily Progress */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Daily Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Sessions</Typography>
                    <Typography variant="body2">{completedSessions}/{dailyGoal}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(completedSessions / dailyGoal) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {streakCount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Fire sx={{ color: 'orange', mr: 1 }} />
                    <Typography variant="body2">
                      {streakCount} day streak!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Today's Stats
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Timer fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Focus Time" 
                      secondary={`${Math.round(todayStats.focusTime / 60)} hours`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Productivity" 
                      secondary={
                        <Rating 
                          value={todayStats.productivity} 
                          readOnly 
                          size="small"
                          max={5}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Block fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Distractions Blocked" 
                      secondary={todayStats.distractionsBlocked}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Recent Achievements
                  </Typography>
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <Chip
                      key={index}
                      label={achievement.title}
                      size="small"
                      sx={{ m: 0.5 }}
                      color="primary"
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Focus Tips */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Focus Tip
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Turn off notifications and put your phone in another room for maximum focus.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Focus Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Pomodoro Length (minutes)</Typography>
            <Slider
              value={settings.pomodoroLength}
              onChange={(e, value) => setSettings(prev => ({ ...prev, pomodoroLength: value }))}
              min={15}
              max={60}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Short Break (minutes)</Typography>
            <Slider
              value={settings.shortBreak}
              onChange={(e, value) => setSettings(prev => ({ ...prev, shortBreak: value }))}
              min={3}
              max={15}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Long Break (minutes)</Typography>
            <Slider
              value={settings.longBreak}
              onChange={(e, value) => setSettings(prev => ({ ...prev, longBreak: value }))}
              min={10}
              max={30}
              marks
              valueLabelDisplay="auto"
            />

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  />
                }
                label="Auto-start breaks"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartPomodoros: e.target.checked }))}
                  />
                }
                label="Auto-start pomodoros"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  />
                }
                label="Sound notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationsEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                  />
                }
                label="Browser notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.strictMode}
                    onChange={(e) => setSettings(prev => ({ ...prev, strictMode: e.target.checked }))}
                  />
                }
                label="Strict mode (track tab switching)"
              />
            </Box>

            <TextField
              fullWidth
              label="Daily Goal (sessions)"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              sx={{ mt: 3 }}
              inputProps={{ min: 1, max: 20 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            setSettingsOpen(false);
            if (settings.notificationsEnabled) {
              requestNotificationPermission();
            }
          }} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session End Dialog */}
      <Dialog open={sessionEndDialog} onClose={() => setSessionEndDialog(false)}>
        <DialogTitle>Session Complete! 🎉</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Great work! How productive was this session?
          </Typography>
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <Typography component="legend">Productivity Rating</Typography>
            <Rating
              value={productivity}
              onChange={(event, newValue) => setProductivity(newValue)}
              size="large"
              max={10}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSessionEndDialog(false);
            setCurrentSession(null);
          }}>
            Skip
          </Button>
          <Button onClick={completeSession} variant="contained">
            Complete Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H1wm8gCUCHy/Dchj8LG2ixZmgKBeV1TKgOXrCr7K1CdCJ0FQBXAQABAAEAbZCuq2YlFkahGQAAzAMAALIBAACCCAAAiggcAgAA" type="audio/wav" />
      </audio>
    </Box>
  );
};

export default FocusMode;