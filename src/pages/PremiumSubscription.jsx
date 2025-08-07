import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Crown,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Target,
  BarChart,
  Users,
  Cog,
  Download,
  Share,
  Sparkles,
  TrendingUp,
  Shield,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { premiumAPI } from '../services/api';

const PremiumSubscription = () => {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState('premium');

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with task management',
      color: '#9E9E9E',
      features: [
        'Basic task management',
        'Simple analytics',
        'Up to 3 projects',
        'Mobile app access',
        'Email support'
      ],
      limitations: [
        'Limited to 50 tasks',
        'Basic reporting only',
        'No AI features',
        'No team collaboration'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For individuals who want to maximize their productivity',
      color: '#FF6B6B',
      popular: true,
      features: [
        '🧠 AI Smart Scheduling',
        '📊 Advanced Analytics',
        '🎯 Goal Setting & Tracking',
        '⏱️ Focus Mode with Pomodoro',
        '🤖 AI Productivity Coach',
        '📈 Custom Reports',
        '🔄 Task Automation',
        '📱 Priority support',
        '☁️ Unlimited cloud storage',
        '🚀 Early access to new features'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$29.99',
      period: 'per user/month',
      description: 'For teams that need advanced collaboration',
      color: '#4CAF50',
      features: [
        '👥 Team Collaboration',
        '🏢 Multiple Workspaces',
        '🔐 Advanced Security',
        '📊 Team Analytics',
        '🎛️ Admin Dashboard',
        '🔗 API Access',
        '📞 24/7 Phone Support',
        '🎓 Team Training Sessions',
        '⚙️ Custom Integrations',
        '📋 Advanced Workflows',
        '🏆 Team Leaderboards',
        '📈 Executive Dashboards'
      ]
    }
  ];

  const premiumFeatures = [
    {
      name: 'AI Smart Scheduling',
      description: 'Intelligent task scheduling based on your productivity patterns',
      icon: <Brain size={20} />,
      enabled: true,
      usage: '87% efficiency boost'
    },
    {
      name: 'Advanced Analytics',
      description: 'Deep insights into your productivity trends and patterns',
      icon: <BarChart size={20} />,
      enabled: true,
      usage: '45 reports generated'
    },
    {
      name: 'Focus Mode',
      description: 'Pomodoro timer with distraction blocking',
      icon: <Zap size={20} />,
      enabled: true,
      usage: '127 sessions completed'
    },
    {
      name: 'Goal Tracking',
      description: 'Set and achieve your most important objectives',
      icon: <Target size={20} />,
      enabled: true,
      usage: '12 goals achieved'
    },
    {
      name: 'Team Collaboration',
      description: 'Work together on projects and share insights',
      icon: <Users size={20} />,
      enabled: false,
      available: 'Enterprise only'
    }
  ];

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const data = await premiumAPI.getFeatures();
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      await premiumAPI.updateSubscription(selectedTier);
      setUpgradeDialog(false);
      loadSubscriptionInfo();
      
      // Show success message
      alert(`Successfully upgraded to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}!`);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  const getCurrentTier = () => {
    return tiers.find(tier => tier.id === (subscriptionInfo?.subscriptionTier || 'free'));
  };

  const getUsagePercentage = () => {
    // Mock usage calculation
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress />
      </Box>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Crown sx={{ mr: 2, fontSize: 'inherit', color: 'warning.main' }} />
          Premium Subscription
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Unlock the full potential of your productivity
        </Typography>
      </Box>

      {/* Current Subscription Status */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${currentTier?.color}15, ${currentTier?.color}05)` }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: currentTier?.color, mr: 2, width: 56, height: 56 }}>
                  <Crown size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {currentTier?.name} Plan
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {currentTier?.description}
                  </Typography>
                  {subscriptionInfo?.subscriptionExpiry && (
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(subscriptionInfo.subscriptionExpiry).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {currentTier?.id !== 'free' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    This month's usage
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getUsagePercentage()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getUsagePercentage()}% of premium features utilized
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color={currentTier?.color}>
                {currentTier?.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTier?.period}
              </Typography>
              {currentTier?.id === 'free' && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setUpgradeDialog(true)}
                  sx={{ mt: 2, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                  startIcon={<Sparkles size={20} />}
                >
                  Upgrade Now
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Feature Usage */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Premium Features
              </Typography>
              <List>
                {premiumFeatures.map((feature, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <Badge 
                          badgeContent={feature.enabled ? <CheckCircle size={12} /> : null}
                          color="success"
                        >
                          {feature.icon}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {feature.name}
                            </Typography>
                            {feature.enabled ? (
                              <Chip label="Active" color="success" size="small" />
                            ) : (
                              <Chip 
                                label={feature.available || "Upgrade Required"} 
                                color="warning" 
                                size="small" 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {feature.description}
                            </Typography>
                            {feature.usage && (
                              <Typography variant="caption" color="primary.main" fontWeight="bold">
                                📈 {feature.usage}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < premiumFeatures.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upgrade Options */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Upgrade Options
              </Typography>
              
              {tiers.filter(tier => tier.id !== 'free').map((tier) => (
                <Paper 
                  key={tier.id}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: tier.popular ? 2 : 1,
                    borderColor: tier.popular ? 'warning.main' : 'divider',
                    position: 'relative'
                  }}
                >
                  {tier.popular && (
                    <Chip 
                      label="Most Popular" 
                      color="warning" 
                      size="small"
                      sx={{ position: 'absolute', top: -10, right: 10 }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {tier.name}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight="bold" color={tier.color}>
                        {tier.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tier.period}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tier.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Key Features:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {tier.features.slice(0, 4).map((feature, index) => (
                      <Chip 
                        key={index}
                        label={feature}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                        variant="outlined"
                      />
                    ))}
                    {tier.features.length > 4 && (
                      <Chip 
                        label={`+${tier.features.length - 4} more`}
                        size="small"
                        color="primary"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setUpgradeDialog(true);
                    }}
                    sx={{ 
                      bgcolor: tier.color,
                      '&:hover': { bgcolor: tier.color, opacity: 0.8 }
                    }}
                    disabled={currentTier?.id === tier.id}
                  >
                    {currentTier?.id === tier.id ? 'Current Plan' : `Upgrade to ${tier.name}`}
                  </Button>
                </Paper>
              ))}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Why upgrade?
                </Typography>
                <Typography variant="body2">
                  Premium users see an average of 40% increase in productivity and 60% better goal achievement rates.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialog} onClose={() => setUpgradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upgrade to {selectedTier?.charAt(0).toUpperCase() + selectedTier?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a demo upgrade. In a real application, this would integrate with a payment processor like Stripe.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            What you'll get:
          </Typography>
          <List dense>
            {tiers.find(t => t.id === selectedTier)?.features.map((feature, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle size={16} color="green" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>Cancel</Button>
          <Button onClick={handleUpgrade} variant="contained">
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PremiumSubscription;