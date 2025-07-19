# 🚀 Prepstech Task Manager

A modern, full-stack task management application built with **React**, **Node.js**, **Express**, and **MongoDB Atlas**.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user registration and login
- 📝 **Task Management** - Create, edit, delete, and organize tasks
- 🏷️ **Advanced Filtering** - Filter by status, priority, tags, and due dates
- 🤖 **AI Insights** - Get productivity recommendations powered by Google Gemini
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ☁️ **Cloud Database** - MongoDB Atlas integration for reliable data storage

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Markdown** for rich text rendering

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **Google Generative AI** for insights

### Database
- **MongoDB Atlas** (Cloud Database)
- Optimized indexes for performance
- Secure user data management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key (optional, for AI insights)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
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
   VITE_API_URL=http://localhost:10000
   ```
   
   **Backend (server/.env):**
   ```env
   NODE_ENV=development
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-manager?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173
   GOOGLE_GENAI_API_KEY=your-google-ai-api-key
   ```

4. **Initialize MongoDB**
   ```bash
   cd server
   npm run setup:mongodb
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start separately:
   npm run server:dev  # Backend on :10000
   npm run dev         # Frontend on :5173
   ```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variable: `VITE_API_URL=your-backend-url`

### Backend (Railway/Render/Heroku)
1. Set environment variables in your hosting platform
2. Use `npm run build && npm start` as start command
3. Set PORT environment variable (usually automatic)

### Database
- MongoDB Atlas is already cloud-ready
- No additional setup needed for database deployment

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/insights` - Get AI insights

### System
- `GET /api/health` - Basic health check
- `GET /api/system/health` - Database health check

## 🔒 Security Features

- **Password Hashing** with bcrypt
- **JWT Authentication** with 7-day expiration
- **Rate Limiting** on API endpoints
- **CORS** protection
- **Helmet.js** security headers
- **Input Validation** with Joi schemas

## 🧪 Development Commands

```bash
# Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
npm run server:dev       # Start with hot reload
npm run server:build     # Build TypeScript
npm run server:start     # Start production server
npm run setup:mongodb    # Initialize database

# Full Stack
npm run dev:full         # Start both frontend and backend
npm run install:all      # Install all dependencies
```

## 📁 Project Structure

```
prepstech-task-manager/
├── components/          # React components
├── services/           # API services
├── server/            # Backend application
│   ├── src/
│   │   ├── database/  # MongoDB models and services
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/# Authentication & error handling
│   │   └── types.ts   # TypeScript definitions
│   └── package.json
├── types.ts           # Shared TypeScript types
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies
