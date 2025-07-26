# PotionPoker - Conceptual Description

## Project Overview
PotionPoker is a mobile-first poker session tracking application that allows poker players to log, analyze, and visualize their poker sessions across different venues and game types. The core concept revolves around comprehensive session tracking with location-based data visualization and social elements.

## High-Level Vision
Create a mobile application that serves as the ultimate poker session tracker, allowing users to:
- Log poker sessions with detailed statistics (buy-in, cash-out, duration, location)
- Track sessions across different venue types (Live Casino, Home Game, Online, Other)
- Visualize session data by location on an interactive map
- Share their poker activity status with friends and the community
- Analyze their poker performance over time with detailed statistics
- Connect with other poker players through messaging and activity feeds

## Core User Journey
1. **Onboarding**: User registers/logs in to create their poker tracking profile
2. **Home Dashboard**: Central hub showing recent activity, active sessions, and quick access to all features
3. **Session Management**: User creates, tracks, and analyzes individual poker sessions
4. **Location Discovery**: User visualizes session data on interactive maps by venue
5. **Group Participation**: User joins home game groups, participates in group sessions, views collective data
6. **Profile Customization**: User manages their poker identity, stats display, and social settings
7. **Range Building**: User creates and maintains opponent player ranges based on observed hands
8. **Social Interaction**: User connects with other players through messaging and group activities

## App Navigation Structure

### Home Tab 🏠
- **Central Dashboard**: Finance/stock app aesthetic (Robinhood-style homepage)
- **Recent Sessions**: Last 3 completed sessions with quick stats
- **Pending Group Sessions**: Group sessions awaiting user's buy-in/participation
- **Friend Activity**: Notifications like "Join player X at location Y"
- **Performance Summary**: Simple charts and key performance data
- **Quick Actions**: Fast access to start session, join group session, view notifications

### Sessions Tab 📊
- **Individual Session Tracking**: Create, manage, and analyze personal poker sessions
- **Session Types**: Live Casino, Home Game, Online, Other
- **Financial Tracking**: Buy-ins, cash-outs, profit/loss calculations
- **Data Visualization**: Charts and analytics for session performance

### Locations Tab 🗺️
- **Interactive Map**: Color-coded pins showing session venues
- **Location Analytics**: Performance data by specific venues
- **Venue Discovery**: Find new poker rooms and casinos (future feature)

### Groups Tab 👥
- **Home Game Management**: Multi-player session tracking for regular games
- **Session Permissions**: Only admins and permitted members can create group sessions
- **Flexible Participation**: Sessions start when 2+ players join, non-group members can be added
- **Player Assignment**: Admins assign group members to session players for data persistence
- **Buy-in Management**: Admins set standard sizes, players add their own buy-ins and cash-outs
- **Historical Tracking**: Add past players (not in group) to sessions for long-term data analysis
- **Data Visualization**: Comprehensive charts and tables (profit over time, player comparisons, session frequency)
- **Session Notes**: @ mention other players in session notes

### Profile Tab 👤
- **Personal Statistics**: Instagram-style layout with profile picture, stats, followers/following
- **Session History**: List of personal sessions (can be hidden for privacy)
- **Status Management**: Custom playing status, location settings, privacy controls
- **Social Features**: DM button, add to group functionality
- **Sessions Mentioned**: View sessions where you were @ mentioned by others

### Range Creator Tab 🃏
- **Standard 13x13 Grid**: Traditional poker hand matrix (AA top-left, 23o bottom-right)
- **Visual Design**: Fully highlighted selected hands with customizable color selection
- **Suited/Unsuited Display**: Clear distinction between suited and offsuit combinations
- **Equalize Range**: Button + hand click to auto-select equal/better hands (QQ+ includes QQ, KK, AA, AKo, AKs)
- **Player Management**: Searchable dropdown with new player creation, generic ranges supported
- **Round & Labels**: Dropdown for preflop/flop/turn/river with custom labeling
- **Organization**: iPhone contacts-style alphabetical list with letter navigation and search
- **Auto-Save Logic**: Manual save required, auto-saves on exit, maintains local context while on screen

## Technical Architecture Philosophy

### Mobile-First Design
- Primary platform: iOS and Android via React Native/Expo
- Progressive Web App support for broader accessibility
- Responsive design optimized for mobile interaction
- Offline-first approach with data synchronization

### Modular Architecture
- Feature-based code organization (auth, locations, gaming, social)
- Shared components and utilities across modules
- Clean separation of concerns between frontend and backend
- Microservices-ready backend architecture

### Security & Privacy
- JWT-based authentication with refresh tokens
- Rate limiting and abuse prevention
- Privacy controls for location data
- Secure API communication with proper error handling

### Developer Experience
- Comprehensive testing suite with mocking capabilities
- Hot reload development environment
- Automated CI/CD pipeline
- Detailed documentation and setup guides

## Success Metrics
- User engagement: Daily/monthly active users
- Location interaction: Check-ins per user, unique locations discovered
- Social engagement: Profile views, connections made
- Technical performance: App load times, API response times, crash rates

## Future Expansion Opportunities (Post-MVP)
- Partnership with casinos for promotional events and bounties
- Poker puzzles and skill challenges
- Achievement and badge system
- XP and progression mechanics  
- Location-specific promotional content
- Advanced analytics and AI-powered insights
- Integration with poker tournament platforms
- Group challenges and competitions
- Enhanced social features (groups, forums)
- Casino directory and rating system for discovering new venues

## Design Principles
- **User-Centric**: Every feature serves a clear user need
- **Privacy-Focused**: Users control their data and visibility
- **Performance-Optimized**: Fast, responsive experience on all devices
- **Scalable**: Architecture supports growth in users and features
- **Accessible**: Inclusive design for users of all abilities
- **Community-Driven**: Features that encourage positive social interaction