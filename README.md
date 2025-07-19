# 🚀 Prepstech Task Manager

A modern, full-stack task management application with AI-powered insights and flexible JSON-based task metadata storage.

## � Deployed Application

**Live Demo**: [https://prepstech-task-manager.vercel.app](https://prepstech-task-manager.vercel.app)
- **Frontend**: Deployed on Vercel
- **Backend API**: [https://prepstech-task-manager.onrender.com](https://prepstech-task-manager.onrender.com)
- **Database**: MongoDB Atlas (Cloud)

## �️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key (optional, for AI insights)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/walker-ziro/prepstech-task-manager.git
   cd prepstech-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:server
   ```

3. **Set up environment variables**
   
   **Frontend (.env):**
   ```env
   # For local development
   VITE_API_URL=http://localhost:10000
   
   # For production
   # VITE_API_URL=https://prepstech-task-manager.onrender.com
   ```
   
   **Backend (server/.env):**
   ```env
   NODE_ENV=development
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task-manager?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173
   GOOGLE_GENAI_API_KEY=your-google-ai-api-key
   ```

4. **Start the application**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In a new terminal, start frontend
   cd ..
   npm run dev
   ```
   
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:10000

### Production Deployment

**Frontend (Vercel):**
1. Update `.env`: `VITE_API_URL=https://prepstech-task-manager.onrender.com`
2. Build: `npm run build`
3. Deploy `dist/` folder or connect GitHub repo to Vercel

**Backend (Render):**
1. Update `server/.env`: `NODE_ENV=production`
2. Set environment variables in Render dashboard
3. Deploy using GitHub integration

## 📊 Database Schema Description

### Task Schema (MongoDB)
```javascript
{
  _id: ObjectId,
  title: String,           // Task title
  description: String,     // Task description
  status: String,          // "pending" | "in_progress" | "completed"
  userId: ObjectId,        // Reference to user who created the task
  createdAt: Date,         // Auto-generated creation timestamp
  updatedAt: Date,         // Auto-generated update timestamp
  extras: {                // JSON object for flexible metadata
    priority: String,      // "low" | "medium" | "high" | "urgent"
    dueDate: String|null,  // ISO date string or null
    tags: [String],        // Array of tag strings
    // ... any additional custom fields
  }
}
```

### User Schema (MongoDB)
```javascript
{
  _id: ObjectId,
  email: String,           // Unique user email
  password: String,        // Bcrypt hashed password
  createdAt: Date,         // Auto-generated creation timestamp
  updatedAt: Date          // Auto-generated update timestamp
}
```

### Key Features:
- **Flexible Metadata**: The `extras` field stores priority, due dates, tags, and any future custom fields as JSON
- **Type Safety**: TypeScript interfaces ensure consistent data structure across frontend/backend
- **Backward Compatibility**: Database mapping handles both legacy and new task formats
- **Indexed Fields**: MongoDB indexes on `userId`, `status`, and `extras.priority` for fast queries

## � What I'd Build Next

If I had more time, here are the key features I would implement:

### 🔄 Real-time Collaboration
- **WebSocket Integration**: Live task updates when multiple users collaborate
- **Shared Workspaces**: Team-based task management with role permissions
- **Activity Feed**: Real-time notifications for task changes and comments

### � Advanced Analytics & Insights
- **Productivity Dashboard**: Time tracking, completion rates, and performance metrics
- **Advanced AI Features**: Smart due date suggestions, workload optimization recommendations
- **Data Visualization**: Charts for task completion trends, time allocation, and productivity patterns

### 🎨 Enhanced User Experience
- **Drag & Drop Interface**: Kanban-style board for visual task management
- **Bulk Operations**: Select and modify multiple tasks simultaneously
- **Advanced Search**: Full-text search with filters, saved searches, and quick actions
- **Custom Task Templates**: Reusable task structures for common workflows

### 🔧 Technical Improvements
- **Offline Support**: PWA with service workers for offline task management
- **Data Export**: Export tasks to CSV, PDF, or integrate with external tools
- **API Rate Limiting**: More sophisticated rate limiting with user-based quotas
- **Comprehensive Testing**: Unit tests, integration tests, and E2E testing with Cypress

### 🔐 Enterprise Features
- **SSO Integration**: Support for Google, Microsoft, and SAML authentication
- **Advanced Permissions**: Fine-grained access control and audit logs
- **API Documentation**: Swagger/OpenAPI documentation for third-party integrations
- **Webhook Support**: External service integrations and automation triggers

The current architecture with JSON-based extras field makes these extensions particularly feasible, as new metadata can be added without schema migrations.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user registration and login
- 📝 **Task Management** - Create, edit, delete, and organize tasks with flexible JSON metadata
- 🏷️ **Advanced Filtering** - Filter by status, priority, tags, and due dates
- 🤖 **AI Insights** - Get productivity recommendations powered by Google Gemini
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ☁️ **Cloud Database** - MongoDB Atlas integration with flexible schema design

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: Google Generative AI for insights
- **Database**: MongoDB Atlas with JSON-based metadata storage
- **Deployment**: Vercel (Frontend) + Render (Backend)

---

**Built with ❤️ using modern web technologies**
