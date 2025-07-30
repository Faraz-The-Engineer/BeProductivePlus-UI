import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Layout = () => {
  const { loading, user } = useAuth();

  console.log('Layout render:', { loading, user });

  if (loading) {
    console.log('Showing loading spinner');
    return <LoadingSpinner />;
  }

  console.log('Rendering main layout');
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { xs: '100%', sm: `calc(100% - 280px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          overflowX: 'auto',
          maxWidth: { xs: '100%', sm: `calc(100% - 280px)` },
          ml: { xs: 0, sm: '280px' },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 