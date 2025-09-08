# ParkFlow - Parking Management System Frontend

A modern, responsive, and high-performance React/Next.js frontend application for managing parking reservations, check-ins, checkouts, and administrative controls with PWA capabilities and offline support.

## Features

### 🚗 Gate Screen (`/gate/[gateId]`)

- **Visitor Check-in**: Easy check-in process with real-time zone availability
- **Subscriber Check-in**: Subscription verification and category-based access
- **Real-time Updates**: Live zone status updates via WebSocket
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
- **Live Updates**: Real-time admin action notifications
- **System Monitoring**: Connection status and activity tracking

### 🚀 Performance & PWA Features

- **Lazy Loading**: Component-level lazy loading for optimal performance
- **Offline Support**: PWA capabilities with service worker caching
- **Background Sync**: Automatic data synchronization when connection returns
- **Push Notifications**: Real-time system notifications
- **Installable**: Add to home screen on mobile devices
- **Responsive Navigation**: Collapsible sidebar with role-based access
- **Connection Management**: Smart WebSocket reconnection and message queuing
- **Design System**: Custom CSS variables and polished UI components

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS + Custom Design System
- **State Management**: Redux Toolkit with optimized slices
- **Data Fetching**: React Query (TanStack Query) with intelligent caching
- **WebSocket**: Optimized WebSocket with reconnection and offline queuing
- **PWA**: Service Worker, offline caching, and background sync
- **UI Components**: Custom components with Lucide React icons
- **Authentication**: JWT-based with role-based access control
- **Performance**: Lazy loading, code splitting, and optimization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5000](http://localhost:5000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/v1/ws
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── gate/[gateId]/     # Gate screen pages
│   ├── checkpoint/         # Checkout station
│   ├── admin/             # Admin dashboard
│   └── login/             # Authentication
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── gate/             # Gate screen components
│   ├── checkpoint/       # Checkout components
│   ├── admin/            # Admin dashboard components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── services/             # API and WebSocket services
├── store/                # Redux store and slices
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Key Features

### Real-time Updates

- WebSocket connection for live zone updates
- Automatic reconnection on connection loss
- Real-time admin action notifications

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes

### Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms
- Offline state handling

## API Integration

The frontend integrates with the backend API following these principles:

- **Server Authority**: All business logic resides on the server
- **No Client Calculations**: Frontend displays server-provided values only
- **Real-time Sync**: WebSocket updates for live data
- **Error Handling**: Consistent error response handling
- **Authentication**: JWT-based with automatic token refresh

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Conventional commits

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Configuration

Ensure the following environment variables are set:

- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
