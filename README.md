# 🚗 ParkFlow - Complete Parking Management System
screen shots 
<img width="2560" height="1612" alt="screencapture-192-168-1-3-5000-dashboard-2025-09-11-23_15_49" src="https://github.com/user-attachments/assets/7304fb41-d36c-46ff-865d-e987482c7dd6" />
<img width="2560" height="1351" alt="screencapture-192-168-1-3-5000-login-2025-09-11-23_50_33" src="https://github.com/user-attachments/assets/b26eb1c3-586c-4992-bba3-bf8c7a807b4f" />
<img width="2560" height="1612" alt="screencapture-192-168-1-3-5000-dashboard-2025-09-11-23_15_49" src="https://github.com/user-attachments/assets/8c419fc3-f632-4068-a652-a6672a37a219" />
<img width="414" height="2185" alt="screencapture-192-168-1-3-5000-dashboard-2025-09-11-23_16_10" src="https://github.com/user-attachments/assets/5f85b503-55e3-4351-8a35-31c93fd848ad" />
<img width="2560" height="1428" alt="screencapture-192-168-1-3-5000-gates-2025-09-11-23_20_49" src="https://github.com/user-attachments/assets/bede1b13-388f-402c-abde-d4ca52c22b5c" />
<img width="2560" height="2249" alt="screencapture-192-168-1-3-5000-admin-2025-09-11-23_21_31" src="https://github.com/user-attachments/assets/66fbdaf7-76cd-40ca-8cdf-cc5e1e7ba554" />
<img width="2560" height="2479" alt="screencapture-192-168-1-3-5000-zones-2025-09-11-23_21_48" src="https://github.com/user-attachments/assets/888dd943-31d2-4a60-b2b0-30628b9aab2f" />
<img width="2560" height="1428" alt="screencapture-192-168-1-3-5000-admin-2025-09-11-23_22_10" src="https://github.com/user-attachments/assets/85db38c6-11b1-47d0-ba5c-525f9edd3edf" />
<img width="2560" height="1428" alt="screencapture-192-168-1-3-5000-gate-gate-1-2025-09-11-23_22_52" src="https://github.com/user-attachments/assets/8695c1f0-a56b-4ba9-a6ec-5ab23dfa973f" />
<img width="2560" height="1722" alt="screencapture-192-168-1-3-5000-checkpoint-2025-09-11-23_23_34" src="https://github.com/user-attachments/assets/32cf1de5-1312-4b0f-94c8-88a2b202eb60" />
<img width="2560" height="1428" alt="screencapture-192-168-1-3-5000-checkpoint-2025-09-11-23_46_48" src="https://github.com/user-attachments/assets/11568ec4-2160-4f7e-ba8d-6e227f1875d3" />
<img width="2560" height="1428" alt="screencapture-192-168-1-3-5000-gate-gate-1-2025-09-11-23_48_41" src="https://github.com/user-attachments/assets/c0e98730-1a60-4180-bd4e-9eeca9342d30" />
<img width="950" height="1145" alt="print ticket" src="https://github.com/user-attachments/assets/1f779246-ec4b-417b-afa0-d329b71c5b92" />


A comprehensive, real-time parking reservation and management system built with modern web technologies. This system provides complete functionality for managing parking zones, check-ins, checkouts, and administrative controls with real-time updates and PWA capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Known Issues & Limitations](#known-issues--limitations)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

ParkFlow is a complete parking management solution designed for WeLink Cargo company's hiring and training program. It demonstrates full-stack development capabilities with real-time features, comprehensive testing, and production-ready architecture.

### Key Highlights

- **Real-time Updates**: WebSocket-powered live zone status and admin notifications
- **Role-based Access**: Admin, Employee, and Visitor access levels
- **PWA Support**: Installable app with offline capabilities
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Comprehensive Testing**: Unit tests, integration tests, and E2E scenarios
- **Modern Architecture**: Next.js 15, TypeScript, Redux Toolkit, React Query

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │    │   (In-Memory)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • Seeded Data   │
│ • TypeScript    │    │ • WebSocket     │    │ • JSON Storage  │
│ • Redux Toolkit │    │ • CORS Enabled  │    │ • Auto-reset    │
│ • React Query   │    │ • JWT Auth      │    │                 │
│ • PWA Support   │    │ • Business Logic│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Features

### 🚪 Gate Screen (`/gate/[gateId]`)
- **Visitor Check-in**: Simple check-in process with real-time zone availability
- **Subscriber Check-in**: Subscription verification and category-based access
- **Real-time Updates**: Live zone status via WebSocket connection
- **Zone Management**: Visual zone cards with availability, rates, and status
- **Ticket Generation**: Printable tickets with QR codes and essential information

### 🏢 Checkpoint Screen (`/checkpoint`)
- **Employee Authentication**: Secure login for checkout staff
- **Ticket Processing**: Scan/enter ticket IDs for checkout
- **Rate Calculation**: Server-computed pricing with detailed breakdowns
- **Subscription Verification**: Visual car plate matching for subscribers
- **Force Convert**: Convert subscriber tickets to visitor tickets when needed

### ⚙️ Admin Dashboard (`/admin`)
- **Parking State Report**: Real-time overview of all zones and occupancy
- **Zone Control**: Open/close zones and manage availability
- **Category Management**: Update parking rates and category settings
- **User Management**: Create and manage system users
- **Subscription Management**: Handle parking subscriptions
- **Reports & Analytics**: Comprehensive reporting and data visualization
- **Live Updates**: Real-time admin action notifications

### 🚀 Performance & PWA Features
- **Lazy Loading**: Component-level lazy loading for optimal performance
- **Offline Support**: PWA capabilities with service worker caching
- **Background Sync**: Automatic data synchronization when connection returns
- **Push Notifications**: Real-time system notifications
- **Installable**: Add to home screen on mobile devices
- **Connection Management**: Smart WebSocket reconnection and message queuing

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS + Custom Design System
- **State Management**: Redux Toolkit with optimized slices
- **Data Fetching**: React Query (TanStack Query) with intelligent caching
- **WebSocket**: Optimized WebSocket with reconnection and offline queuing
- **PWA**: Service Worker, offline caching, and background sync
- **UI Components**: Custom components with Lucide React icons
- **Authentication**: JWT-based with role-based access control

### Backend
- **Runtime**: Node.js with Express.js
- **WebSocket**: Native WebSocket support for real-time updates
- **Authentication**: Simple JWT-based token system
- **CORS**: Configured for cross-origin requests
- **Data Storage**: In-memory with seeded data (resets on restart)

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For cloning the repository

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eng-MustafaMasoud/wenet.git
   cd wenet
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm start
   ```
   Backend will be available at: `http://localhost:3000`

5. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```
   Frontend will be available at: `http://localhost:3001`

### Environment Configuration

#### Frontend Environment Variables
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/v1/ws
```

#### Backend Environment Variables
Create `backend/.env` (optional):
```env
PORT=3000
NODE_ENV=development
```

### Verification

1. **Backend Health Check**: Visit `http://localhost:3000/api/v1/health`
2. **Frontend Application**: Visit `http://localhost:3001`
3. **Test Login**: Use credentials from [Test Credentials](#test-credentials)

## 📖 Usage Guide

### Test Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | `admin` | `admin123` | Full system access |
| Employee | `emp1` | `pass1` | Checkpoint operations |
sometime is employee role need to remove the space after username ,i havvn't trim the spaces
### User Workflows

#### 1. Gate Screen (Visitor Check-in)
1. Navigate to `/gate/gate_1` (or any gate ID)
2. Select a zone from available zones
3. Choose "Visitor" check-in
4. Enter vehicle details
5. Complete check-in and print ticket

#### 2. Gate Screen (Subscriber Check-in)
1. Navigate to `/gate/gate_1`
2. Select a zone from available zones
3. Choose "Subscriber" check-in
4. Enter subscription ID
5. Verify car plate matches
6. Complete check-in

#### 3. Checkpoint Screen (Checkout)
1. Navigate to `/checkpoint`
2. Login with employee credentials
3. Enter ticket ID or scan QR code
4. Review checkout details
5. Process payment and complete checkout

#### 4. Admin Dashboard
1. Navigate to `/admin`
2. Login with admin credentials
3. Access various management sections:
   - **Dashboard**: Overview and reports
   - **Zones**: Zone management and control
   - **Categories**: Rate management
   - **Users**: User management
   - **Subscriptions**: Subscription management
   - **Tickets**: Ticket history and management

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/health` - Health check (no auth required)

### Master Data
- `GET /api/v1/master/gates` - Get all gates
- `GET /api/v1/master/zones?gateId={id}` - Get zones for a gate
- `GET /api/v1/master/categories` - Get all categories

### Ticket Operations
- `POST /api/v1/tickets/checkin` - Check-in a vehicle
- `POST /api/v1/tickets/checkout` - Check-out a vehicle
- `GET /api/v1/tickets/{id}` - Get ticket details

### Admin Operations
- `GET /api/v1/admin/reports/parking-state` - Get parking state report
- `PUT /api/v1/admin/categories/{id}` - Update category rates
- `PUT /api/v1/admin/zones/{id}/open` - Open/close zones
- `GET /api/v1/admin/subscriptions` - Get all subscriptions
- `GET /api/v1/admin/users` - Get all users

### WebSocket Events
- **Connection**: `ws://localhost:3000/api/v1/ws`
- **Subscribe**: `{"type":"subscribe","payload":{"gateId":"gate_1"}}`
- **Unsubscribe**: `{"type":"unsubscribe","payload":{"gateId":"gate_1"}}`
- **Zone Update**: `{"type":"zone-update","payload":{...}}`
- **Admin Update**: `{"type":"admin-update","payload":{...}}`

## ⚠️ Known Issues & Limitations

### Current Limitations
1. **Data Persistence**: All data is stored in-memory and resets on server restart
2. **Authentication**: Simple token-based system (not production-ready)
3. **Database**: No persistent database (uses seeded JSON data)
4. **File Storage**: No file upload/storage capabilities
5. **Email/SMS**: No notification services integrated

### Known Issues
1. **WebSocket Reconnection**: May require manual refresh in some network conditions
2. **Mobile Safari**: Some PWA features may not work on older iOS versions
3. **Print Functionality**: May not work in all browsers without proper print settings
4. **Large Datasets**: Performance may degrade with very large numbers of tickets

### Workarounds
- **Data Loss**: Restart backend to reset to clean state
- **Connection Issues**: Refresh the page to re-establish WebSocket connection
- **Print Issues**: Use browser's print preview and adjust settings

## 🧪 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

#### Backend
```bash
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Quality
- **TypeScript**: Strict typing enabled
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Standardized commit messages

### Project Structure
```
wenet/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and WebSocket services
│   │   ├── store/           # Redux store and slices
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express.js backend application
│   ├── tests/               # Test files
│   ├── server.js            # Main server file
│   ├── seed.json            # Seeded data
│   └── package.json
└── README.md
```

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report
```

#### Frontend Tests
```bash
cd frontend
npm test                   # Run all tests
npm run test:watch        # Run tests in watch mode
```

### Code Standards
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### Common Solutions
- **Port Conflicts**: Change ports in environment variables
- **CORS Issues**: Ensure backend is running and CORS is configured
- **WebSocket Issues**: Check network connectivity and firewall settings
- **Build Errors**: Clear node_modules and reinstall dependencies


---
