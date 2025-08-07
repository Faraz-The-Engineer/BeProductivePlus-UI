import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  BarChart3,
  CheckSquare,
  List as ListIcon,
  LogOut,
  User,
  Menu,
  TrendingUp,
  FileText,
  Calendar,
  Columns,
  Timer,
  Brain,
  Target,
  Zap,
  BarChart,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const drawerWidth = { xs: 280, sm: 280, md: 280 };

const menuItems = [
  {
    text: 'Dashboard',
    icon: <BarChart3 size={18} />,
    path: '/dashboard',
  },
  {
    text: 'Task Manager',
    icon: <CheckSquare size={18} />,
    path: '/tasks',
  },
  {
    text: 'All Tasks',
    icon: <ListIcon size={18} />,
    path: '/all-tasks',
  },
  {
    text: 'Kanban Board',
    icon: <Columns size={18} />,
    path: '/kanban',
  },
  {
    text: 'Calendar',
    icon: <Calendar size={18} />,
    path: '/calendar',
  },
  {
    text: 'Time Tracking',
    icon: <Timer size={18} />,
    path: '/time-tracking',
  },
  {
    text: 'Templates',
    icon: <FileText size={18} />,
    path: '/templates',
  },
  {
    text: 'Analytics',
    icon: <TrendingUp size={18} />,
    path: '/analytics',
  },
];

const premiumMenuItems = [
  {
    text: 'Focus Mode',
    icon: <Brain size={18} />,
    path: '/focus-mode',
    premium: true,
  },
  {
    text: 'Goals & Achievements',
    icon: <Target size={18} />,
    path: '/goals',
    premium: true,
  },
  {
    text: 'AI Smart Scheduler',
    icon: <Zap size={18} />,
    path: '/ai-scheduler',
    premium: true,
  },
  {
    text: 'Advanced Analytics',
    icon: <BarChart size={18} />,
    path: '/advanced-analytics',
    premium: true,
  },
  {
    text: 'Premium Subscription',
    icon: <Crown size={18} />,
    path: '/premium',
    premium: true,
  },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #1A73E8 0%, #1662C4 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Task Manager
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
          Manage your tasks efficiently
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <User size={16} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Premium Features Section */}
        <Divider sx={{ my: 1, mx: 2 }} />
        <ListItem sx={{ py: 0, px: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Crown size={14} />
            PREMIUM FEATURES
          </Typography>
        </ListItem>
        
        {premiumMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF5252 0%, #FF7B7B 100%)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'orange',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium'
                  }
                }}
                secondary={
                  location.pathname !== item.path && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Sparkles size={12} color="orange" />
                      <Typography variant="caption" sx={{ color: 'orange', fontWeight: 'bold' }}>
                        PREMIUM
                      </Typography>
                    </Box>
                  )
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 0.75,
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile menu button */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          mr: 2,
          display: { sm: 'none' },
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1200,
          bgcolor: 'background.paper',
          boxShadow: 2,
          width: 36,
          height: 36,
        }}
      >
        <Menu size={18} />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: 280, sm: 280 },
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { sm: 280, md: 280 },
            zIndex: 1200,
            position: 'fixed',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar; 