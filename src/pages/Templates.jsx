import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Paper,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Fab,
  Autocomplete,
  Switch,
  FormControlLabel,
  CardActions,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Search,
  FilterList,
  Star,
  Public,
  Lock,
  Category,
  Timer,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { templatesAPI, tasksAPI } from '../services/api';

const Templates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    timeEstimate: 30,
    priority: 'Medium',
    steps: [],
    isPublic: false,
    tags: [],
  });
  const [stepDescription, setStepDescription] = useState('');

  // Available tags for autocomplete
  const [availableTags, setAvailableTags] = useState([
    'Development', 'Design', 'Marketing', 'Planning', 'Research',
    'Meeting', 'Review', 'Testing', 'Documentation', 'Analysis'
  ]);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchPopularTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedTags]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedTags.length > 0) filters.tags = selectedTags.join(',');
      if (searchQuery) filters.search = searchQuery;

      const response = await templatesAPI.getAll(filters);
      setTemplates(response);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await templatesAPI.getCategories();
      setCategories(['All', ...response]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPopularTemplates = async () => {
    try {
      const response = await templatesAPI.getPopular();
      setPopularTemplates(response);
    } catch (err) {
      console.error('Error fetching popular templates:', err);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(tag => template.tags.includes(tag))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async () => {
    try {
      await templatesAPI.create(formData);
      setSuccessMessage('Template created successfully!');
      setCreateDialog(false);
      resetForm();
      fetchTemplates();
      fetchPopularTemplates();
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      await templatesAPI.update(editingTemplate._id, formData);
      setSuccessMessage('Template updated successfully!');
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError('Failed to update template');
      console.error('Error updating template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templatesAPI.delete(templateId);
        setSuccessMessage('Template deleted successfully!');
        fetchTemplates();
        fetchPopularTemplates();
      } catch (err) {
        setError('Failed to delete template');
        console.error('Error deleting template:', err);
      }
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const templateData = await templatesAPI.use(templateId);
      
      // Create a task from the template
      const taskData = {
        ...templateData,
        date: new Date().toISOString().slice(0, 10)
      };
      
      await tasksAPI.create(taskData);
      setSuccessMessage('Task created from template successfully!');
      fetchPopularTemplates(); // Refresh to update usage counts
    } catch (err) {
      setError('Failed to create task from template');
      console.error('Error using template:', err);
    }
  };

  const addStep = () => {
    if (stepDescription.trim()) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, { description: stepDescription.trim() }]
      }));
      setStepDescription('');
    }
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'General',
      timeEstimate: 30,
      priority: 'Medium',
      steps: [],
      isPublic: false,
      tags: [],
    });
    setStepDescription('');
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      timeEstimate: template.timeEstimate,
      priority: template.priority,
      steps: template.steps || [],
      isPublic: template.isPublic,
      tags: template.tags || [],
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const TemplateCard = ({ template }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" component="h2" noWrap>
            {template.name}
          </Typography>
          {template.isPublic ? (
            <Tooltip title="Public template">
              <Public fontSize="small" color="primary" />
            </Tooltip>
          ) : (
            <Tooltip title="Private template">
              <Lock fontSize="small" color="action" />
            </Tooltip>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {template.description || 'No description'}
        </Typography>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            size="small"
            label={template.category}
            icon={<Category />}
            variant="outlined"
          />
          <Chip
            size="small"
            label={template.priority}
            color={getPriorityColor(template.priority)}
          />
          <Chip
            size="small"
            label={`${template.timeEstimate}m`}
            icon={<Timer />}
            variant="outlined"
          />
        </Box>

        {template.tags.length > 0 && (
          <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
            {template.tags.map((tag, index) => (
              <Chip key={index} size="small" label={tag} variant="outlined" />
            ))}
          </Box>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Used {template.usageCount} times
          </Typography>
          {template.user && template.user.name && (
            <Typography variant="caption" color="text.secondary">
              by {template.user.name}
            </Typography>
          )}
        </Box>

        {template.steps.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {template.steps.length} steps included
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<PlayArrow />}
          onClick={() => handleUseTemplate(template._id)}
          variant="contained"
          fullWidth
        >
          Use Template
        </Button>
        {template.user && template.user._id === user?.id && (
          <>
            <IconButton size="small" onClick={() => openEditDialog(template)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteTemplate(template._id)}>
              <Delete />
            </IconButton>
          </>
        )}
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading templates...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📋 Task Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage reusable task templates for faster workflow setup
        </Typography>
      </Box>

      {/* Popular Templates Section */}
      {popularTemplates.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <TrendingUp /> Popular Templates
          </Typography>
          <Grid container spacing={2}>
            {popularTemplates.slice(0, 3).map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template._id}>
                <TemplateCard template={template} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={4}>
            <Autocomplete
              multiple
              options={availableTags}
              value={selectedTags}
              onChange={(event, newValue) => setSelectedTags(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={fetchTemplates}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={template._id}>
            <TemplateCard template={template} />
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No templates found
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {searchQuery || selectedCategory !== 'All' || selectedTags.length > 0
              ? 'Try adjusting your filters or create a new template.'
              : 'Create your first template to get started!'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialog(true)}
            sx={{ mt: 2 }}
          >
            Create Template
          </Button>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add template"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialog(true)}
      >
        <Add />
      </Fab>

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={createDialog || !!editingTemplate}
        onClose={() => {
          setCreateDialog(false);
          setEditingTemplate(null);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Time Estimate (minutes)"
                type="number"
                value={formData.timeEstimate}
                onChange={(e) => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                }
                label="Make Public"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={formData.tags}
                onChange={(event, newValue) => setFormData({ ...formData, tags: newValue })}
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

            {/* Steps Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Template Steps
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  placeholder="Add a step..."
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStep()}
                />
                <Button variant="outlined" onClick={addStep}>
                  Add
                </Button>
              </Box>
              <List dense>
                {formData.steps.map((step, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={step.description} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeStep(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialog(false);
              setEditingTemplate(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Templates;