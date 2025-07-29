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
};

export default api; 