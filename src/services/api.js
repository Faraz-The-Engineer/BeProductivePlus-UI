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
  
  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
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

export default api; 