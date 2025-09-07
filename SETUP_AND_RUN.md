# Parking Management System - Setup and Run Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server (with nodemon for auto-restart)
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:5000`

## 🔧 Development Scripts

### Backend Scripts

- `npm run dev` - Start with nodemon (auto-restart on changes)
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## 🌐 Access Points

### Frontend Application

- **Main App**: http://localhost:5000
- **Gate Screen**: http://localhost:5000/gate/gate_1
- **Checkpoint**: http://localhost:5000/checkpoint
- **Admin Dashboard**: http://localhost:5000/admin
- **Login**: http://localhost:5000/login

### Backend API

- **Base URL**: http://localhost:3000/api/v1
- **WebSocket**: ws://localhost:3000/api/v1/ws
- **API Documentation**: See `backend/API_DOC.md`

## 🗄️ Database

The backend uses an in-memory database that resets on each restart. Seed data is loaded from `backend/seed.json`.

## 🔐 Authentication

### Default Users (from seed data)

- **Admin**: username: `admin`, password: `admin123`
- **Employee**: username: `employee`, password: `employee123`

### Role-based Access

- **Admin**: Full access to all features including admin dashboard
- **Employee**: Access to checkpoint and gate screens only
- **Visitors**: Public access to gate screens for check-in

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:gate          # Test gate functionality
npm run test:checkpoint    # Test checkpoint functionality
npm run test:admin         # Test admin functionality
```

### Frontend Tests

```bash
cd frontend
npm test                   # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Kill processes using port 3000 or 3001
# Windows
netstat -ano | findstr :3000
taskkill //f //pid <PID>

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### 2. localStorage SSR Error

This has been fixed by adding proper browser environment checks in the Redux store.

#### 3. WebSocket Connection Issues

- Ensure backend is running on port 3000
- Check browser console for WebSocket errors
- Verify CORS settings in backend

#### 4. API Connection Issues

- Verify backend is running on http://localhost:3000
- Check network tab in browser dev tools
- Ensure API endpoints are accessible

### Debug Mode

#### Backend Debug

```bash
cd backend
DEBUG=* npm run dev
```

#### Frontend Debug

```bash
cd frontend
NODE_ENV=development npm run dev
```

## 📁 Project Structure

```
wenet/
├── backend/                 # Express.js backend
│   ├── server.js           # Main server file
│   ├── seed.json           # Seed data
│   ├── tests/              # Backend tests
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and WebSocket services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── __tests__/          # Frontend tests
│   └── package.json        # Frontend dependencies
├── start-servers.bat       # Windows startup script
├── start-servers.sh        # Unix startup script
└── README.md              # Main documentation
```

## 🚀 Production Deployment

### Backend Deployment

```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment

```bash
cd frontend
npm run build
npm start
```

### Environment Variables

Create `.env.local` in frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/v1/ws
```

## 📊 Features Overview

### ✅ Completed Features

- [x] Next.js 14 with TypeScript
- [x] Redux Toolkit state management
- [x] React Query for data fetching
- [x] WebSocket real-time updates
- [x] JWT authentication with role-based access
- [x] Responsive design with Tailwind CSS
- [x] Gate screen with visitor/subscriber check-in
- [x] Checkpoint screen with employee checkout
- [x] Admin dashboard with zone management
- [x] Real-time zone updates
- [x] Printable tickets
- [x] Comprehensive error handling
- [x] Unit tests for key components
- [x] Server-side rendering fixes
- [x] Complete documentation

### 🔄 Real-time Features

- Live zone availability updates
- Admin action notifications
- Connection status indicators
- Automatic reconnection

### 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Accessible design

## 🎯 Next Steps

1. **Start both servers** using the commands above
2. **Open the frontend** at http://localhost:5000
3. **Test the gate screen** by navigating to a gate
4. **Login as admin** to access the admin dashboard
5. **Test the checkpoint** by logging in as an employee

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs in browser dev tools
3. Check the backend terminal for error messages
4. Ensure all dependencies are installed correctly

## 🎉 Success!

Once both servers are running, you should see:

- Backend: "Server running on port 3000"
- Frontend: "Ready - started server on 0.0.0.0:5000"

The parking management system is now ready for use! 🚗
