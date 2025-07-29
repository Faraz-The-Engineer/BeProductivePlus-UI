import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <Loader2 size={32} className="animate-spin" />
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 