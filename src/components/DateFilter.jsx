import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import {
  Filter,
  X,
} from 'lucide-react';

const DateFilter = ({ onFilterChange, onClearFilter }) => {
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;
    setFilterType(newFilterType);
    
    if (newFilterType === 'all') {
      onClearFilter();
    } else if (newFilterType === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      onFilterChange({ type: 'today', startDate: today, endDate: today });
    } else if (newFilterType === 'thisWeek') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      onFilterChange({
        type: 'thisWeek',
        startDate: startOfWeek.toISOString().slice(0, 10),
        endDate: endOfWeek.toISOString().slice(0, 10)
      });
    } else if (newFilterType === 'thisMonth') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      onFilterChange({
        type: 'thisMonth',
        startDate: startOfMonth.toISOString().slice(0, 10),
        endDate: endOfMonth.toISOString().slice(0, 10)
      });
    } else if (newFilterType === 'future') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1); // One year from now
      
      onFilterChange({
        type: 'future',
        startDate: tomorrow.toISOString().slice(0, 10),
        endDate: futureDate.toISOString().slice(0, 10)
      });
    } else if (newFilterType === 'custom') {
      // Don't apply filter yet, wait for user to select dates
    }
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      onFilterChange({
        type: 'custom',
        startDate,
        endDate
      });
    }
  };

  const handleClearFilter = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    onClearFilter();
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'today':
        return 'Today';
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'future':
        return 'Future Tasks';
      case 'custom':
        return startDate && endDate ? `${startDate} to ${endDate}` : 'Custom Range';
      default:
        return 'All Tasks';
    }
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Filter size={18} color="primary" />
        <Typography variant="h6">Filter Tasks</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={filterType}
            onChange={handleFilterTypeChange}
            label="Filter Type"
            size="small"
          >
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="thisWeek">This Week</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="future">Future Tasks</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        {filterType === 'custom' && (
          <>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={handleCustomFilter}
              disabled={!startDate || !endDate}
              size="small"
            >
              Apply Filter
            </Button>
          </>
        )}

        {filterType !== 'all' && (
          <Button
            variant="outlined"
            startIcon={<X size={16} />}
            onClick={handleClearFilter}
            size="small"
          >
            Clear Filter
          </Button>
        )}
      </Box>

      {filterType !== 'all' && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Showing: ${getFilterLabel()}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

export default DateFilter; 