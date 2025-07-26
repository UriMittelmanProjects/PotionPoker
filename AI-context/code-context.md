# PotionPoker - Code Context & Technical Specifications

## Technology Stack

### Frontend (Mobile App)
- **Framework**: Expo (React Native)
- **Language**: TypeScript for type safety
- **State Management**: Zustand with persistence
- **Navigation**: React Navigation v6
- **Maps**: React Native Maps with native map providers
- **Storage**: AsyncStorage for local data persistence
- **Forms**: React Hook Form with Zod validation
- **Styling**: StyleSheet with responsive design patterns
- **Testing**: Jest + React Native Testing Library

### Backend (API Server) - Recommended Stack
- **Runtime**: Node.js with Express.js (rapid development, excellent ecosystem)
- **Language**: TypeScript (type safety, shared types with frontend)
- **Database**: PostgreSQL with Prisma ORM (excellent TypeScript integration, migrations)
- **Authentication**: JWT (access + refresh tokens) with bcrypt hashing
- **Validation**: Zod schemas shared between frontend/backend
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston with structured logging
- **Real-time**: Socket.io for live status updates (optional for MVP)
- **Deployment**: Railway/Render for rapid deployment, or DigitalOcean for cost efficiency
- **Testing**: Jest + Supertest for API testing

**Alternative Backend Stack (if scaling concerns):**
- **Runtime**: Node.js with Fastify (higher performance than Express)
- **Database**: PostgreSQL with Drizzle ORM (better performance than Prisma)
- **Caching**: Redis for session storage and real-time features

### Shared Libraries
- **Types**: Shared TypeScript interfaces and types
- **Validation**: Zod schemas for API contracts
- **Constants**: Shared constants and configuration

## Project Structure

```
potionpoker/
├── frontend/                 # Expo React Native app
│   ├── src/
│   │   ├── modules/         # Feature-based modules
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── home/        # Home dashboard module
│   │   │   ├── sessions/    # Individual session tracking
│   │   │   ├── locations/   # Location/map module
│   │   │   ├── groups/      # Group management and group sessions
│   │   │   ├── profile/     # User profile module
│   │   │   ├── ranges/      # Range creator module
│   │   │   └── social/      # Social features module
│   │   ├── shared/          # Shared components & utilities
│   │   └── navigation/      # Tab and stack navigation
│   └── __tests__/           # Frontend tests
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── modules/         # Feature-based API modules
│   │   │   ├── auth/        # Auth routes, controllers, services
│   │   │   ├── sessions/    # Session API endpoints
│   │   │   ├── locations/   # Location API endpoints
│   │   │   ├── groups/      # Group management APIs
│   │   │   ├── users/       # User management
│   │   │   ├── ranges/      # Range creator APIs
│   │   │   └── social/      # Social feature APIs
│   │   ├── shared/          # Middleware, utilities, types
│   │   └── core/            # Server setup, database connection
│   ├── prisma/              # Database schema and migrations
│   └── tests/               # API tests and test utilities
├── shared/                  # Shared types and validation schemas
└── docs/                    # Documentation and setup guides
```

## Core Module Specifications

### Authentication Module (`auth/`)

**Frontend Components:**
- `LoginScreen.tsx` - Email/username + password login
- `RegisterScreen.tsx` - User registration with validation
- `ForgotPasswordScreen.tsx` - Password reset request
- `ProfileScreen.tsx` - View/edit user profile
- `useAuthStore.ts` - Zustand store for auth state
- `authService.ts` - API client for auth operations

**Backend Components:**
- `AuthController.ts` - Route handlers for auth endpoints
- `AuthService.ts` - Business logic for authentication
- `authRoutes.ts` - Express routes definition
- `authMiddleware.ts` - JWT verification middleware
- `authValidation.ts` - Zod schemas for auth requests

**API Endpoints:**
```typescript
POST /api/v1/auth/register    // User registration
POST /api/v1/auth/login       // User login
POST /api/v1/auth/logout      // User logout
POST /api/v1/auth/refresh     // Token refresh
GET  /api/v1/auth/me          // Get current user
PUT  /api/v1/auth/profile     // Update profile
POST /api/v1/auth/forgot      // Password reset request
POST /api/v1/auth/reset       // Password reset confirm
```

### Sessions Module (`sessions/`)

**Frontend Components:**
- `CreateSessionScreen.tsx` - Start new poker session interface with location auto-suggestions
- `ActiveSessionScreen.tsx` - Active session management and end session
- `SessionHistoryScreen.tsx` - List of past sessions with filtering
- `SessionDetailScreen.tsx` - Individual session details and edit
- `LocationSuggestionsComponent.tsx` - Display top 3 frequent locations for quick selection
- `useSessionStore.ts` - Session state management
- `sessionService.ts` - Session API client

**Backend Components:**
- `SessionController.ts` - Session API handlers
- `SessionService.ts` - Session business logic and calculations
- `sessionRoutes.ts` - Session API routes

**API Endpoints:**
```typescript
POST   /api/v1/sessions              // Create new session
GET    /api/v1/sessions              // Get user's sessions
GET    /api/v1/sessions/:id          // Get session details
PUT    /api/v1/sessions/:id          // Update session
DELETE /api/v1/sessions/:id          // Delete session
POST   /api/v1/sessions/:id/end      // End active session
GET    /api/v1/sessions/suggestions  // Get top 3 frequent locations for auto-fill
```

### Locations Module (`locations/`)

**Frontend Components:**
- `MapScreen.tsx` - Interactive map showing session locations
- `LocationDetailScreen.tsx` - Sessions at specific location
- `LocationListScreen.tsx` - List view of session locations
- `useLocationStore.ts` - Location state management
- `locationService.ts` - Location API client

**Backend Components:**
- `LocationController.ts` - Location API handlers
- `LocationService.ts` - Location business logic
- `locationRoutes.ts` - Location API routes

**API Endpoints:**
```typescript
GET    /api/v1/locations              // Get user's session locations
GET    /api/v1/locations/:id/sessions // Get sessions at location
POST   /api/v1/locations              // Create/geocode location
```

### User Profile Module (`profile/`)

**Frontend Components:**
- `ProfileScreen.tsx` - User profile display with poker stats
- `EditProfileScreen.tsx` - Profile editing interface  
- `StatsScreen.tsx` - Detailed poker statistics and charts
- `SettingsScreen.tsx` - App settings and privacy controls

**Backend Components:**
- `UserController.ts` - User management API
- `UserService.ts` - User business logic
- `StatsService.ts` - Poker statistics calculation

### Social Module (`social/`)

**Frontend Components:**
- `ActivityFeedScreen.tsx` - Friends' poker activities
- `MessagingScreen.tsx` - Direct messages interface
- `UserStatusComponent.tsx` - Playing status display/controls
- `FriendsListScreen.tsx` - Friends management
- `useSocialStore.ts` - Social state management

**Backend Components:**
- `SocialController.ts` - Social features API
- `MessagingService.ts` - Direct messaging functionality
- `ActivityService.ts` - Activity feed generation
- `StatusService.ts` - Playing status management

**API Endpoints:**
```typescript
GET    /api/v1/social/feed            // Get activity feed
POST   /api/v1/social/status          // Update playing status
GET    /api/v1/social/messages        // Get messages
POST   /api/v1/social/messages        // Send message
GET    /api/v1/social/friends         // Get friends list
POST   /api/v1/social/friends/:id     // Add friend
POST   /api/v1/social/invite-links    // Generate invite links for groups/friends
GET    /api/v1/social/invite/:token   // Process invite link redemption
```

### Groups Module (`groups/`)

**Frontend Components:**
- `GroupsScreen.tsx` - List of user's groups and group discovery
- `GroupDetailScreen.tsx` - Individual group overview and management
- `CreateGroupScreen.tsx` - Group creation interface
- `GroupSessionScreen.tsx` - Multi-player group session management
- `GroupStatsScreen.tsx` - Group performance charts and tables
- `useGroupStore.ts` - Group state management

**Backend Components:**
- `GroupController.ts` - Group management API
- `GroupSessionController.ts` - Group session API
- `GroupService.ts` - Group business logic
- `GroupSessionService.ts` - Multi-player session logic

**API Endpoints:**
```typescript
GET    /api/v1/groups                    // Get user's groups
POST   /api/v1/groups                    // Create new group
GET    /api/v1/groups/:id                // Get group details
PUT    /api/v1/groups/:id                // Update group
DELETE /api/v1/groups/:id                // Delete group
POST   /api/v1/groups/:id/members        // Add member to group
GET    /api/v1/groups/:id/sessions       // Get group sessions
POST   /api/v1/groups/:id/sessions       // Create group session
PUT    /api/v1/groups/sessions/:id       // Update group session
```

### Range Creator Module (`ranges/`)

**Frontend Components:**
- `RangeCreatorScreen.tsx` - Main interface with iPhone contacts-style player list
- `RangeGridComponent.tsx` - Standard 13x13 poker hand matrix with color customization
- `PlayerRangeScreen.tsx` - Individual player range management with round/label dropdowns
- `EqualizeRangeComponent.tsx` - "Equalize range" functionality for automatic hand selection
- `PlayerSearchComponent.tsx` - Searchable dropdown with new player creation
- `useRangeStore.ts` - Range data state management with local context persistence

**Backend Components:**
- `RangeController.ts` - Range management API
- `RangeService.ts` - Range calculation and storage logic

**API Endpoints:**
```typescript
GET    /api/v1/ranges                    // Get user's player ranges
POST   /api/v1/ranges                    // Create new player range
GET    /api/v1/ranges/:playerId          // Get specific player range
PUT    /api/v1/ranges/:playerId          // Update player range
POST   /api/v1/ranges/:playerId/hands    // Add observed hand
DELETE /api/v1/ranges/:playerId/hands/:id // Remove hand
```

### Home Dashboard Module (`home/`)

**Frontend Components:**
- `HomeScreen.tsx` - Main dashboard with activity overview
- `ActivityFeedComponent.tsx` - Recent activities widget
- `ActiveSessionsComponent.tsx` - Currently running sessions
- `QuickActionsComponent.tsx` - Fast access to common actions
- `useHomeStore.ts` - Dashboard state management

## Data Models (Prisma Schema)

```prisma
model User {
  id                String        @id @default(cuid())
  email             String        @unique
  username          String        @unique
  passwordHash      String
  firstName         String
  lastName          String
  displayName       String?
  isVerified        Boolean       @default(false)
  playingStatus     PlayingStatus @default(OFFLINE)
  currentLocation   String?       // Current playing location
  statusVisibility  StatusVisibility @default(PUBLIC)
  showPlayingStatus Boolean       @default(true)
  totalHands        Int           @default(0)
  totalSessions     Int           @default(0)
  totalWinnings     Decimal       @default(0) @db.Decimal(10,2)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  sessions          PokerSession[]
  sentMessages      Message[]     @relation("MessageSender")
  receivedMessages  Message[]     @relation("MessageReceiver")
  friends           Friendship[]  @relation("UserFriends")
  friendOf          Friendship[]  @relation("FriendOfUser")
  activities        Activity[]
  groupMemberships  GroupMember[]
  groupSessions     GroupSessionPlayer[]
  playerRanges      PlayerRange[]
  adminOfGroups     Group[]       @relation("GroupAdmin")
}

model PokerSession {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  // Session Details
  sessionType   SessionType // LIVE_CASINO, HOME_GAME, ONLINE, OTHER
  venue         String?     // Venue name or description (optional during creation)
  address       String?     // Physical address if applicable (optional)
  latitude      Float?      // For map display
  longitude     Float?      // For map display
  
  // Financial Tracking
  initialBuyIn  Decimal?    @db.Decimal(8,2) // Initial buy-in (optional during creation)
  totalBuyIn    Decimal     @db.Decimal(8,2) // Total collective buy-ins (required to end)
  cashOut       Decimal?    @db.Decimal(8,2) // Total cash-out (required to end)
  profit        Decimal?    @db.Decimal(8,2) // Calculated: cashOut - totalBuyIn
  
  // Session Timing
  startTime     DateTime    @default(now())
  endTime       DateTime?
  duration      Int?        // Duration in minutes (can be user-specified)
  
  // Game Details
  gameType      String?     // Hold'em, Omaha, etc.
  stakes        String?     // 1/2, 2/5, etc.
  handsPlayed   Int?
  notes         String?
  
  // Status & Controls
  isActive      Boolean     @default(true)
  isComplete    Boolean     @default(false) // False if session not properly ended
  updateStatus  Boolean     @default(true)  // User choice to update playing status
  notifyFriends Boolean     @default(true)  // User choice to notify friends
  includeInStats Boolean    @default(true) // False for <2min sessions or incomplete sessions
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Message {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  sender      User     @relation("MessageSender", fields: [senderId], references: [id])
  receiver    User     @relation("MessageReceiver", fields: [receiverId], references: [id])
}

model Friendship {
  id        String   @id @default(cuid())
  userId    String
  friendId  String
  status    FriendshipStatus @default(PENDING)
  createdAt DateTime @default(now())
  
  user      User     @relation("UserFriends", fields: [userId], references: [id])
  friend    User     @relation("FriendOfUser", fields: [friendId], references: [id])
  
  @@unique([userId, friendId])
}

model Activity {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  type      ActivityType // SESSION_START, SESSION_END, STATUS_CHANGE
  content   String       // Activity description
  metadata  Json?        // Additional data (session info, etc.)
  createdAt DateTime     @default(now())
}

enum SessionType {
  LIVE_CASINO
  HOME_GAME
  ONLINE
  OTHER
}

enum PlayingStatus {
  OFFLINE
  ONLINE
  PLAYING
}

enum StatusVisibility {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

enum ActivityType {
  SESSION_START
  SESSION_END
  STATUS_CHANGE
  BIG_WIN
  BIG_LOSS
}

model Group {
  id          String      @id @default(cuid())
  name        String
  description String?
  isPrivate   Boolean     @default(false)
  adminId     String
  admin       User        @relation("GroupAdmin", fields: [adminId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  members     GroupMember[]
  sessions    GroupSession[]
}

model GroupMember {
  id       String   @id @default(cuid())
  groupId  String
  userId   String
  role     GroupRole @default(MEMBER)
  joinedAt DateTime @default(now())
  
  group    Group    @relation(fields: [groupId], references: [id])
  user     User     @relation(fields: [userId], references: [id])
  
  @@unique([groupId, userId])
}

model GroupSession {
  id          String      @id @default(cuid())
  groupId     String
  group       Group       @relation(fields: [groupId], references: [id])
  sessionType SessionType
  venue       String
  address     String?
  startTime   DateTime    @default(now())
  endTime     DateTime?
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  players     GroupSessionPlayer[]
}

model GroupSessionPlayer {
  id              String       @id @default(cuid())
  groupSessionId  String
  userId          String
  buyIn           Decimal      @db.Decimal(8,2)
  cashOut         Decimal?     @db.Decimal(8,2)
  profit          Decimal?     @db.Decimal(8,2)
  notes           String?
  
  groupSession    GroupSession @relation(fields: [groupSessionId], references: [id])
  user            User         @relation(fields: [userId], references: [id])
  
  @@unique([groupSessionId, userId])
}

model PlayerRange {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  playerName  String?   // Name/identifier for opponent (null for generic ranges)
  round       String    // Round: preflop, flop, turn, river
  label       String?   // Custom label for this range
  hands       String    // JSON array of hand combinations (e.g., ["AA", "KK", "AKs"])
  color       String?   // Selected color for range visualization
  notes       String?   // Additional notes about this range
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([userId, playerName, round, label])
}

enum GroupRole {
  ADMIN
  MEMBER
}
```

## Development Patterns

### Error Handling
```typescript
// Custom error classes with proper HTTP status codes
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

// Consistent API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
```

### State Management Pattern
```typescript
// Zustand store with persistence
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### API Service Pattern
```typescript
// Consistent API client with error handling
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    // Automatic token refresh, error handling, retry logic
  }
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Individual component testing with React Native Testing Library
- **Integration Tests**: Module-level testing with mocked API responses
- **E2E Tests**: Critical user flows with Detox (optional for MVP)

### Backend Testing
- **Unit Tests**: Service layer testing with mocked dependencies
- **Integration Tests**: API endpoint testing with test database
- **Rate Limiting Tests**: Bypass mechanisms for reliable test execution

### Test Utilities
```typescript
// Test database setup with cleanup
export const setupTestDb = async () => {
  await testDb.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  // Setup test data
};

// Mock API responses for frontend tests
export const mockApiSuccess = <T>(data: T) => ({
  success: true,
  data,
});
```

## Performance Considerations

### Frontend Optimization
- Image lazy loading and caching
- List virtualization for large datasets
- Debounced search and API calls
- Offline-first data architecture

### Backend Optimization
- Database query optimization with proper indexes
- API response caching for location data
- Rate limiting to prevent abuse
- Connection pooling for database

## Security Implementation

### Authentication Security
- Bcrypt password hashing (12 rounds)
- JWT access tokens (15min) + refresh tokens (7d)
- Secure HTTP-only cookie storage (web)
- AsyncStorage encryption (mobile)

### API Security
- Helmet.js security headers
- CORS configuration
- Request validation with Zod
- Rate limiting per endpoint type
- SQL injection prevention via Prisma

## Deployment Strategy

### Development Environment
- Docker containers for consistent development
- Hot reload for both frontend and backend
- Shared environment variables
- Local PostgreSQL instance

### Production Considerations
- Separate staging and production environments
- Environment-specific configuration
- Database migration strategy
- API versioning for backward compatibility
- Monitoring and logging setup

This technical specification provides the foundation for building a scalable, maintainable PotionPoker application with modern best practices and clear architectural patterns.