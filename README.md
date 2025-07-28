# PotionPoker

A mobile-first poker session tracking application that allows poker players to log, analyze, and visualize their poker sessions across different venues and game types.

## Project Structure

```
PotionPoker/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Authentication & validation
│   │   ├── routes/            # API route definitions
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Database & utility functions
│   ├── prisma/                # Database schema & migrations
│   └── package.json
├── frontend/                   # React Native/Expo mobile app
│   ├── src/
│   │   ├── navigation/        # App navigation structure
│   │   ├── screens/           # App screens/pages
│   │   └── shared/            # Shared components & utilities
│   └── package.json
└── AI-context/                # Project documentation & context
```

## Features

- **Session Tracking**: Log poker sessions with detailed statistics
- **Location Mapping**: Visualize sessions by venue on interactive maps
- **Group Management**: Track home game sessions with multiple players
- **Range Creator**: Build and manage opponent player ranges
- **Social Features**: Connect with other players through messaging
- **Performance Analytics**: Analyze poker performance over time

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (for mobile app development)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy .env.example to .env and configure your settings
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   FRONTEND_URL="http://localhost:8081"
   ```

4. Initialize the database:
   ```bash
   npm run db:generate    # Generate Prisma client
   npm run db:push        # Create database tables
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your mobile device to scan the QR code, or:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## Development

### Backend Development

- **Development server**: `npm run dev` (auto-restart on changes)
- **Build**: `npm run build`
- **Database operations**:
  - `npm run db:generate` - Generate Prisma client
  - `npm run db:push` - Push schema changes to database
  - `npm run db:migrate` - Create and apply migrations

### Frontend Development

- **Start development**: `npm start`
- **Platform-specific**:
  - `npm run android` - Start with Android focus
  - `npm run ios` - Start with iOS focus
  - `npm run web` - Start web version

### Testing

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test suites
npm run test:auth      # Authentication tests
npm run test:db        # Database tests
npm run test:jwt       # JWT utility tests
```

#### Frontend Tests

```bash
cd frontend

# Test API connection
node test-connection.js

# Test authentication flow
node test-logout.js
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Health Check

- `GET /health` - API health status

## Database Schema

The application uses SQLite with Prisma ORM. Key models:

- **User**: User accounts with authentication and profile data
- **Session**: Poker session tracking (planned)
- **Group**: Home game group management (planned)
- **Location**: Poker venues and locations (planned)

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Express Validator

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Forms**: React Hook Form with Yup validation
- **Storage**: AsyncStorage

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
FRONTEND_URL="http://localhost:8081"
NODE_ENV="development"
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything passes
5. Submit a pull request

## License

This project is private and proprietary.