# Task Manager App

A modern, responsive task management application built with React + Vite and Material-UI, featuring user authentication and comprehensive task management capabilities.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Persistent login state

### 📊 Dashboard
- Overview statistics (total, completed, in-progress, pending tasks)
- Progress visualization
- Recent tasks list
- Welcome message with user info

### ✅ Task Management
- Create, read, update, and delete tasks
- Task priority levels (Low, Medium, High)
- Task status tracking (Pending, In Progress, Completed)
- Time estimates for tasks
- Task dependencies
- Step-by-step task breakdown
- Bulk operations

### 🎨 UI/UX
- Modern Material-UI design
- Responsive layout (mobile-friendly)
- Sidebar navigation
- Beautiful gradients and animations
- Intuitive user interface

## Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: Material-UI theming system

## Backend Integration

This frontend connects to a Node.js/Express backend with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/steps` - Add step to task
- `PUT /api/tasks/:id/steps/:stepIdx` - Update step
- `DELETE /api/tasks/:id/steps/:stepIdx` - Delete step

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout with sidebar
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── ProtectedRoute.jsx # Route protection
├── context/            # React context
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Signup.jsx      # Registration page
│   ├── Dashboard.jsx   # Dashboard overview
│   └── TaskManager.jsx # Task management page
├── services/           # API services
│   └── api.js         # API client and endpoints
├── theme/              # Material-UI theme
│   └── index.js       # Theme configuration
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Usage

### Authentication
1. Navigate to `/signup` to create a new account
2. Or go to `/login` if you already have an account
3. After successful authentication, you'll be redirected to the dashboard

### Managing Tasks
1. **Dashboard**: View overview statistics and recent tasks
2. **Task Manager**: Full CRUD operations for tasks
   - Click "Add Task" to create a new task
   - Use the action buttons to edit, complete, or delete tasks
   - Add steps to break down complex tasks
   - Set priorities and dependencies

### Navigation
- Use the sidebar to navigate between Dashboard and Task Manager
- The sidebar is collapsible on mobile devices
- User information and logout option are available in the sidebar

## Customization

### Theme
The application uses a custom Material-UI theme defined in `src/theme/index.js`. You can modify colors, typography, and component styles there.

### API Configuration
Update the `API_BASE_URL` in `src/services/api.js` to point to your backend server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
