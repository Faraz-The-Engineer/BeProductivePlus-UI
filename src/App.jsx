import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import AllTasks from './pages/AllTasks';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import Calendar from './pages/Calendar';
import Kanban from './pages/Kanban';
import TimeTracking from './pages/TimeTracking';

// Premium Pages
import FocusMode from './pages/FocusMode';
import Goals from './pages/Goals';
import AIScheduler from './pages/AIScheduler';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import PremiumSubscription from './pages/PremiumSubscription';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="all-tasks" element={<AllTasks />} />
              <Route path="kanban" element={<Kanban />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="templates" element={<Templates />} />
              
              {/* Premium Routes */}
              <Route path="focus-mode" element={<FocusMode />} />
              <Route path="goals" element={<Goals />} />
              <Route path="ai-scheduler" element={<AIScheduler />} />
              <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
              <Route path="premium" element={<PremiumSubscription />} />
              
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
