import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  FilterList,
  Clear,
  Save,
  Star,
  History,
  Tune,
  LocalOffer,
  Category,
  Schedule,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import { tasksAPI } from '../services/api';

const AdvancedSearch = ({ tasks = [], onFilterChange, onSaveFilter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: [],
    priority: [],
    tags: [],
    category: '',
    project: '',
    difficulty: [],
    dateRange: {
      start: '',
      end: '',
    },
    dueDate: {
      start: '',
      end: '',
    },
    timeEstimate: {
      min: 0,
      max: 480, // 8 hours
    },
    completionPercentage: {
      min: 0,
      max: 100,
    },
    hasSteps: null,
    isOverdue: false,
    hasTimeTracking: false,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filterName, setFilterName] = useState('');

  // Extract unique values from tasks for autocomplete
  const [availableOptions, setAvailableOptions] = useState({
    tags: [],
    categories: [],
    projects: [],
    assignedTo: [],
  });

  useEffect(() => {
    extractAvailableOptions();
    loadSavedFilters();
    loadRecentSearches();
  }, [tasks]);

  useEffect(() => {
    applyFilters();
    generateSuggestions();
  }, [filters, tasks]);

  const extractAvailableOptions = () => {
    const tags = new Set();
    const categories = new Set();
    const projects = new Set();
    const assignedTo = new Set();

    tasks.forEach(task => {
      if (task.tags) task.tags.forEach(tag => tags.add(tag));
      if (task.category) categories.add(task.category);
      if (task.project) projects.add(task.project);
      if (task.assignedTo) assignedTo.add(task.assignedTo);
    });

    setAvailableOptions({
      tags: Array.from(tags),
      categories: Array.from(categories),
      projects: Array.from(projects),
      assignedTo: Array.from(assignedTo),
    });
  };

  const applyFilters = () => {
    let filteredTasks = [...tasks];

    // Text search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.name.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status.includes(task.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority.includes(task.priority));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.tags && filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    // Category filter
    if (filters.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    // Project filter
    if (filters.project) {
      filteredTasks = filteredTasks.filter(task => task.project === filters.project);
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.difficulty.includes(task.difficulty));
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    // Due date filter
    if (filters.dueDate.start && filters.dueDate.end) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const startDate = new Date(filters.dueDate.start);
        const endDate = new Date(filters.dueDate.end);
        return dueDate >= startDate && dueDate <= endDate;
      });
    }

    // Time estimate filter
    filteredTasks = filteredTasks.filter(task =>
      task.timeEstimate >= filters.timeEstimate.min &&
      task.timeEstimate <= filters.timeEstimate.max
    );

    // Completion percentage filter
    filteredTasks = filteredTasks.filter(task => {
      const completion = task.progressPercentage || 0;
      return completion >= filters.completionPercentage.min &&
             completion <= filters.completionPercentage.max;
    });

    // Has steps filter
    if (filters.hasSteps !== null) {
      filteredTasks = filteredTasks.filter(task =>
        filters.hasSteps ? (task.steps && task.steps.length > 0) : (!task.steps || task.steps.length === 0)
      );
    }

    // Overdue filter
    if (filters.isOverdue) {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task =>
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed'
      );
    }

    // Has time tracking filter
    if (filters.hasTimeTracking) {
      filteredTasks = filteredTasks.filter(task =>
        task.totalTimeSpent && task.totalTimeSpent > 0
      );
    }

    // Sort results
    filteredTasks.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'timeEstimate':
          aValue = a.timeEstimate || 0;
          bValue = b.timeEstimate || 0;
          break;
        case 'progress':
          aValue = a.progressPercentage || 0;
          bValue = b.progressPercentage || 0;
          break;
        default:
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    onFilterChange(filteredTasks);
  };

  const generateSuggestions = () => {
    const suggestions = [];

    // Suggest popular tags
    if (availableOptions.tags.length > 0) {
      suggestions.push({
        type: 'tag',
        label: 'Popular Tags',
        items: availableOptions.tags.slice(0, 5),
      });
    }

    // Suggest overdue tasks
    const overdueTasks = tasks.filter(task =>
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'
    );
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'filter',
        label: 'Overdue Tasks',
        count: overdueTasks.length,
        action: () => setFilters(prev => ({ ...prev, isOverdue: true })),
      });
    }

    // Suggest high priority tasks
    const highPriorityTasks = tasks.filter(task => task.priority === 'High' && task.status !== 'Completed');
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        type: 'filter',
        label: 'High Priority Tasks',
        count: highPriorityTasks.length,
        action: () => setFilters(prev => ({ ...prev, priority: ['High'] })),
      });
    }

    setSuggestions(suggestions);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      status: [],
      priority: [],
      tags: [],
      category: '',
      project: '',
      difficulty: [],
      dateRange: { start: '', end: '' },
      dueDate: { start: '', end: '' },
      timeEstimate: { min: 0, max: 480 },
      completionPercentage: { min: 0, max: 100 },
      hasSteps: null,
      isOverdue: false,
      hasTimeTracking: false,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const savedFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, savedFilter];
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
    setFilterName('');
    
    if (onSaveFilter) {
      onSaveFilter(savedFilter);
    }
  };

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const applySavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const deleteSavedFilter = (filterId) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.category) count++;
    if (filters.project) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.dueDate.start || filters.dueDate.end) count++;
    if (filters.hasSteps !== null) count++;
    if (filters.isOverdue) count++;
    if (filters.hasTimeTracking) count++;
    return count;
  };

  return (
    <Paper sx={{ mb: 3 }}>
      {/* Search Bar */}
      <Box p={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} alignItems="center">
              <Button
                variant={isExpanded ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setIsExpanded(!isExpanded)}
                endIcon={
                  activeFiltersCount() > 0 && (
                    <Badge badgeContent={activeFiltersCount()} color="primary" />
                  )
                }
              >
                Advanced Filters
              </Button>
              <IconButton onClick={handleClearFilters} disabled={activeFiltersCount() === 0}>
                <Clear />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <Box px={2} pb={2}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Quick suggestions:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion.count ? `${suggestion.label} (${suggestion.count})` : suggestion.label}
                variant="outlined"
                size="small"
                onClick={suggestion.action}
                icon={suggestion.type === 'tag' ? <LocalOffer /> : <TrendingUp />}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Advanced Filters */}
      <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Advanced Search Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  multiple
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {availableOptions.categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Project Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {availableOptions.projects.map((project) => (
                    <MenuItem key={project} value={project}>
                      {project}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags Filter */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={availableOptions.tags}
                value={filters.tags}
                onChange={(event, newValue) => handleFilterChange('tags', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
              />
            </Grid>

            {/* Time Estimate Range */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Time Estimate: {filters.timeEstimate.min} - {filters.timeEstimate.max} minutes
              </Typography>
              <Slider
                value={[filters.timeEstimate.min, filters.timeEstimate.max]}
                onChange={(event, newValue) => 
                  handleFilterChange('timeEstimate', { min: newValue[0], max: newValue[1] })
                }
                valueLabelDisplay="auto"
                min={0}
                max={480}
                step={15}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Sort Options */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="updatedAt">Last Modified</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="timeEstimate">Time Estimate</MenuItem>
                  <MenuItem value="progress">Progress</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Boolean Filters */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.isOverdue}
                      onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
                    />
                  }
                  label="Show only overdue tasks"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.hasTimeTracking}
                      onChange={(e) => handleFilterChange('hasTimeTracking', e.target.checked)}
                    />
                  }
                  label="Has time tracking"
                />
              </Box>
            </Grid>

            {/* Save Filter */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Filter name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                >
                  Save Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <Box p={2} borderTop={1} borderColor="divider">
          <Typography variant="subtitle2" gutterBottom>
            Saved Filters:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {savedFilters.map((savedFilter) => (
              <Chip
                key={savedFilter.id}
                label={savedFilter.name}
                variant="outlined"
                icon={<Star />}
                onClick={() => applySavedFilter(savedFilter)}
                onDelete={() => deleteSavedFilter(savedFilter.id)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AdvancedSearch;