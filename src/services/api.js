import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://be-productive-plus-linux-evaxd8fjbfekaghp.southeastasia-01.azurewebsites.net/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', 
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (name, email, password, apiKey) => {
    const response = await api.post('/auth/signup', 
      { name, email, password },
      { 
        headers: {
          'x-api-key': apiKey
        }
      }
    );
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  bulkCreate: async (bulkData) => {
    const response = await api.post('/tasks/bulk', bulkData);
    return response.data;
  },
  
  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  addStep: async (taskId, stepData) => {
    const response = await api.post(`/tasks/${taskId}/steps`, stepData);
    return response.data;
  },
  
  updateStep: async (taskId, stepIndex, stepData) => {
    const response = await api.put(`/tasks/${taskId}/steps/${stepIndex}`, stepData);
    return response.data;
  },
  
  deleteStep: async (taskId, stepIndex) => {
    const response = await api.delete(`/tasks/${taskId}/steps/${stepIndex}`);
    return response.data;
  },

  // Time tracking endpoints
  startTimer: async (taskId) => {
    const response = await api.post(`/tasks/${taskId}/timer/start`);
    return response.data;
  },

  stopTimer: async (taskId, description = '') => {
    const response = await api.post(`/tasks/${taskId}/timer/stop`, { description });
    return response.data;
  },

  getTimeReport: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/time-report`);
    return response.data;
  },

  addTimeLog: async (taskId, timeLogData) => {
    const response = await api.post(`/tasks/${taskId}/time-log`, timeLogData);
    return response.data;
  },

  getTimeTrackingSummary: async (startDate = '', endDate = '') => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/tasks/time-tracking/summary?${params.toString()}`);
    return response.data;
  },
};

// Templates API
export const templatesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/templates?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },
  
  create: async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response.data;
  },
  
  update: async (id, templateData) => {
    const response = await api.put(`/templates/${id}`, templateData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
  
  use: async (id) => {
    const response = await api.post(`/templates/${id}/use`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/templates/categories/list');
    return response.data;
  },
  
  getPopular: async () => {
    const response = await api.get('/templates/popular/list');
    return response.data;
  },
};

// Premium API
export const premiumAPI = {
  // Subscription management
  getFeatures: async () => {
    const response = await api.get('/premium/features');
    return response.data;
  },

  updateSubscription: async (tier) => {
    const response = await api.put('/premium/subscription', { tier });
    return response.data;
  },

  // Advanced Analytics
  getAdvancedAnalytics: async (days = 30) => {
    const response = await api.get(`/premium/analytics/advanced?days=${days}`);
    return response.data;
  },

  // Focus Sessions
  startFocusSession: async (sessionData) => {
    const response = await api.post('/premium/focus-session/start', sessionData);
    return response.data;
  },

  completeFocusSession: async (sessionId, completionData) => {
    const response = await api.put(`/premium/focus-session/${sessionId}/end`, completionData);
    return response.data;
  },

  getFocusSessions: async (days = 7) => {
    const response = await api.get(`/premium/focus-sessions?days=${days}`);
    return response.data;
  },

  // Goals Management
  getGoals: async () => {
    const response = await api.get('/premium/goals');
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await api.post('/premium/goals', goalData);
    return response.data;
  },

  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/premium/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (goalId) => {
    const response = await api.delete(`/premium/goals/${goalId}`);
    return response.data;
  },

  // AI Features
  getAISchedule: async () => {
    const response = await api.post('/premium/ai-schedule');
    return response.data;
  },

  getAIRecommendations: async () => {
    const response = await api.get('/premium/ai-coach');
    return response.data;
  },

  // Productivity Insights
  getProductivityInsights: async () => {
    const response = await api.get('/premium/insights');
    return response.data;
  },

  // Stats and analytics (mock functions for now)
  getTodayStats: async () => {
    // Mock data - in real app this would come from backend
    return {
      focusTime: 120, // minutes
      sessionsCompleted: 4,
      distractionsBlocked: 8,
      productivity: 4.2,
      currentStreak: 5
    };
  },

  getWeeklyStats: async () => {
    // Mock data - generate week stats
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      focusTime: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
      sessions: Math.floor(Math.random() * 8) + 2, // 2-10 sessions
      productivity: Math.random() * 3 + 2 // 2-5 rating
    }));
  },

  getAchievements: async () => {
    // Mock achievements
    return [
      { title: 'First Focus', description: 'Completed first session', icon: '🎯' },
      { title: 'Week Warrior', description: '7-day streak', icon: '🔥' },
      { title: 'Focus Master', description: '100 sessions completed', icon: '🏆' }
    ];
  },

  // Workspace/Team features
  getWorkspaces: async () => {
    const response = await api.get('/premium/workspaces');
    return response.data;
  },

  createWorkspace: async (workspaceData) => {
    const response = await api.post('/premium/workspaces', workspaceData);
    return response.data;
  },

  joinWorkspace: async (workspaceId, joinData) => {
    const response = await api.post(`/premium/workspaces/${workspaceId}/join`, joinData);
    return response.data;
  },

  // Automation
  createAutomation: async (automationData) => {
    const response = await api.post('/premium/automations', automationData);
    return response.data;
  },

  getAutomations: async () => {
    const response = await api.get('/premium/automations');
    return response.data;
  },

  // Custom Reports
  generateReport: async (reportConfig) => {
    const response = await api.post('/premium/reports/generate', reportConfig);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/premium/reports');
    return response.data;
  },

  // Integrations
  getIntegrations: async () => {
    const response = await api.get('/premium/integrations');
    return response.data;
  },

  connectIntegration: async (integrationData) => {
    const response = await api.post('/premium/integrations/connect', integrationData);
    return response.data;
  },

  // AI Smart Suggestions
  getSmartSuggestions: async () => {
    const response = await api.get('/premium/suggestions');
    return response.data;
  },

  applySmartSuggestion: async (suggestionId) => {
    const response = await api.post(`/premium/suggestions/${suggestionId}/apply`);
    return response.data;
  }
};

export default api; 