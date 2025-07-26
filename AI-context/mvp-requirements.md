# PotionPoker MVP Requirements

## Core Functionality Summary

PotionPoker is a **poker session tracking app** with location visualization and social features. It is NOT a poker game - it's a tool for poker players to track their sessions, analyze performance, and share their poker activities with friends.

## Critical MVP Features

### 1. Session Tracking ✅ **ESSENTIAL**
- **Create Session Flow**: "Start Session" button → Form with location type, name, address, initial buy-in (all optional during creation)
- **Location Auto-Suggestions**: After creating a session, show top 3 most frequently used locations to auto-fill location fields (name, address, type). Show fewer if user has less than 3 previous locations.
- **Two User Flows Supported**:
  - **Flow 1 (Most Common)**: Create session at end with total buy-in and cash-out
  - **Flow 2**: Create session at start, add buy-ins during play, end with cash-out
- **Session Management**: 
  - Can increase buy-ins during active session or at end
  - **Required to end**: Total collective buy-ins + total cash-out (both mandatory)
  - Sessions <2 minutes excluded from hourly rate calculations (assumes Flow 1)
  - Sessions ≥2 minutes included in all statistics and charts
- **Status Controls**: Checkboxes for "Update playing status?" and "Notify friends?" on session creation
- **Auto-Reset**: Playing status automatically resets after 24 hours if session not ended
- **Incomplete Sessions**: If new session created before ending previous, old session marked incomplete and excluded from data/charts
- **Session Management**: Full edit/delete capabilities for all sessions

### 2. Location & Map Features ✅ **ESSENTIAL**
- **Address Input**: When creating sessions, users can add address for venue
- **Map View**: Interactive map with color-coded pins:
  - **Green pins**: Live casinos user has played at
  - **Blue pins**: Home games user has played at  
  - **Red pins**: Other nearby casinos/poker rooms user hasn't played at
- **Pin Interaction**: Click pin → Location summary with all session data + list of specific sessions at that location
- **Location-based Analysis**: View session performance by specific venues
- **Geocoding**: Convert addresses to coordinates for map display

### 3. Social Features ✅ **ESSENTIAL**
- **Playing Status**: Real-time status showing "Playing at [Location]" when session active
- **Privacy Controls**: 
  - Can hide location and just show "Playing" status
  - Can turn off status sharing completely
  - Can set custom status
- **Direct Messaging**: Simple chat between users
- **Activity Feed**: Friends can see each other's session activities (when notifications enabled)
- **Friend System**: Add/remove friends

### 4. Statistics & Analytics ✅ **ESSENTIAL**
- **Currency**: USD format for MVP
- **Visual Design**: Colors and charts are important for data visualization
- **Chart Types**:
  - **Location-based charts**: Performance by venue
  - **Time-period charts**: Performance over time periods
  - **Hourly rate calculations**: Only includes sessions ≥2 minutes duration
- **Key Metrics**: 
  - Total sessions, total hands, win/loss ratio, total winnings
  - Money per hour (excluding <2min sessions)
  - Location performance analysis
  - Biggest wins/losses, average session length

### 5. User Management ✅ **ESSENTIAL**
- **Authentication**: Register, login, password recovery
- **Profile Management**: Edit personal information, privacy settings
- **Account Settings**: Status visibility controls, notification preferences

## Technical Requirements

### Development Speed Priority
- **Timeline**: Days to proof of concept, rapid iteration
- **Technology**: Proven, well-documented stacks
- **Architecture**: Simple, modular, easy to extend

### Recommended MVP Tech Stack
- **Frontend**: Expo (React Native) - fastest mobile development
- **Backend**: Node.js + Express + TypeScript - rapid API development
- **Database**: PostgreSQL + Prisma - excellent TypeScript integration
- **Deployment**: Railway or Render - quick deployment with minimal config

## MVP Data Model Core

```typescript
// Essential entities for MVP
User {
  id, email, username, firstName, lastName
  playingStatus, currentLocation, statusVisibility
  totalSessions, totalWinnings
}

PokerSession {
  id, userId, sessionType, venue, address
  buyIn, cashOut, profit
  startTime, endTime, duration
  gameType, stakes, handsPlayed, notes
  latitude, longitude // for map
}

Message {
  id, senderId, receiverId, content, isRead
}

Friendship {
  id, userId, friendId, status
}
```

## User Flow Priority

### High Priority (MVP Day 1)
1. User Registration/Login
2. Create First Session
3. End Session with profit/loss
4. View Session History
5. Basic Profile/Settings

### Medium Priority (MVP Week 1)
1. Map view of session locations
2. Friend system and messaging
3. Playing status visibility
4. Session editing and deletion
5. Basic statistics display
6. Groups tab - basic group creation and group sessions
7. Profile tab - Instagram-style layout with session mentions
8. Range Creator tab - basic range tracking for opponents

### Lower Priority (Post-MVP)
1. Advanced analytics and charts
2. Activity feed optimization
3. Push notifications
4. Hand posts and social feed features
5. User verification system
6. Advanced group features (detailed charts, complex permissions)

## Success Criteria for MVP

### User Validation
- Users can successfully track poker sessions end-to-end
- Location-based session visualization works correctly
- Basic social features enable user connection
- App provides value as session tracking tool

### Technical Validation
- App loads quickly on mobile devices
- Session creation/editing is intuitive and fast
- Map integration works reliably
- Database handles concurrent users effectively

## Post-MVP Expansion Path

### Phase 2 (Future Development)
- Partnership integrations with casinos
- Poker puzzles and challenges
- Achievement/badge system
- Enhanced analytics with AI insights
- Tournament tracking integration
- Advanced social features (groups, forums)

### Monetization (Future)
- Premium analytics features
- Casino partnership revenue
- Advanced social features subscription
- Data export/backup services

## Development Notes

- **No poker gameplay** - this is purely a tracking and social app
- **Mobile-first** - iOS and Android are primary platforms
- **6-tab navigation** - Home, Sessions, Locations, Groups, Profile, Range Creator
- **Social emphasis** - users want to share their poker activities and group play
- **Privacy important** - users must control their status visibility
- **Performance matters** - session creation/editing must be fast and reliable
- **Group functionality** - Essential for home game tracking and multi-player sessions
- **Range tracking** - Key feature for serious players to track opponents
- **@ mentions** - Users can mention others in session notes for social interaction
- **Instagram-style profile** - Familiar social media UX for user profiles

## MVP Scope Clarification

**Include in MVP:**
- All 6 tabs with basic functionality
- Individual and group session tracking
- Location auto-suggestions based on user's session history (top 3 most frequent venues)
- Range creator with standard 13x13 grid, equalize function, and iPhone contacts-style organization
- Group invite links shareable via messages
- Add friends via links in messages
- @ mentions in session notes
- Privacy controls for session visibility
- Direct messaging between users

**Exclude from MVP:**
- Hand posts and social feed
- User verification badges
- Advanced group permissions/roles beyond admin/member
- Push notifications
- Advanced analytics beyond basic charts
- Tournament integration

This MVP focuses on comprehensive poker session tracking across individual and group play, with essential social features and opponent analysis tools, providing immediate value to poker players while establishing the foundation for future social and competitive enhancements.