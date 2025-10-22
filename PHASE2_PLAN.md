# Phase 2: Android App Integration

## Overview

Phase 2 will add Android app integration with GPS tracking to automatically update Krishnaji's location.

## Architecture

```
Android App (GPS) → Backend API → Database → Website (Auto-update)
```

## Components Needed

### 1. Backend API (AWS)

**Option A: AWS API Gateway + Lambda + DynamoDB**
- API Gateway: REST endpoints
- Lambda: Process location updates
- DynamoDB: Store locations
- Cost: ~$0-5/month (free tier)

**Option B: AWS Amplify Backend**
- Amplify DataStore: Sync locations
- GraphQL API: Auto-generated
- Real-time updates via AppSync
- Cost: ~$0-10/month

### 2. Android App Features

**Core Features:**
- Background GPS tracking
- Manual location updates
- Location history
- Battery optimization

**Permissions Required:**
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- INTERNET

**Technology Stack:**
- Kotlin or Java
- Android Location Services
- AWS Amplify Android SDK
- WorkManager (background tasks)

### 3. Website Updates

**Changes Needed:**
- Replace JSON file with API calls
- Add real-time updates (WebSocket or polling)
- Add loading states
- Error handling for API calls

## Implementation Steps

### Step 1: Setup Backend (AWS Amplify)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add API with GraphQL
amplify add api
# - Select GraphQL
# - Authorization: API key (for now)
# - Schema: Location data model

# Add authentication (optional, for security)
amplify add auth

# Push to cloud
amplify push
```

### Step 2: Update Data Model

**GraphQL Schema:**
```graphql
type Location @model {
  id: ID!
  name: String!
  type: String! # planned or actual
  date: AWSDate!
  latitude: Float!
  longitude: Float!
  notes: String
  timestamp: AWSDateTime!
  source: String # manual, gps, android
}
```

### Step 3: Update Website

**Install Amplify libraries:**
```bash
npm install aws-amplify @aws-amplify/ui-react
```

**Update App.jsx to use API:**
```javascript
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import config from './amplifyconfiguration.json'

Amplify.configure(config)
const client = generateClient()

// Fetch locations from API
const fetchLocations = async () => {
  const result = await client.graphql({
    query: listLocations
  })
  return result.data.listLocations.items
}

// Subscribe to real-time updates
const subscription = client.graphql({
  query: onCreateLocation
}).subscribe({
  next: ({ data }) => {
    // Update UI with new location
  }
})
```

### Step 4: Create Android App

**Project Structure:**
```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/whereiskrishnaji/
│   │   │   ├── MainActivity.kt
│   │   │   ├── LocationService.kt
│   │   │   ├── LocationRepository.kt
│   │   │   └── models/
│   │   └── AndroidManifest.xml
│   └── build.gradle
└── build.gradle
```

**Key Classes:**

1. **LocationService.kt** - Background GPS tracking
2. **LocationRepository.kt** - API communication
3. **MainActivity.kt** - UI and controls

### Step 5: Android App Features

**Basic Features:**
- Start/Stop tracking button
- Current location display
- Manual location update
- View location history
- Battery usage indicator

**Advanced Features:**
- Geofencing (auto-update when entering/leaving areas)
- Smart tracking (only when moving)
- Offline support (sync when online)
- Push notifications

## Security Considerations

### Authentication
- Implement AWS Cognito
- Only Krishnaji can update locations
- Public can view locations

### API Security
- API key for read access
- JWT tokens for write access
- Rate limiting
- Input validation

### Privacy
- Option to disable tracking
- Delete location history
- Choose what to share publicly

## Cost Estimates

### AWS Services
- **DynamoDB:** Free tier (25GB storage)
- **Lambda:** Free tier (1M requests/month)
- **API Gateway:** $3.50 per million requests
- **AppSync (if using):** $4 per million requests
- **Data transfer:** $0.09 per GB

**Expected monthly cost:** $0-5 for low traffic

### Android App
- **Development:** Free (Android Studio)
- **Publishing (Google Play):** One-time $25 fee
- **Maintenance:** Free

## Timeline Estimate

- Week 1: Backend setup (API, Database)
- Week 2: Website API integration
- Week 3-4: Android app development
- Week 5: Testing and bug fixes
- Week 6: Deployment and documentation

## Testing Plan

### Backend Testing
- Unit tests for Lambda functions
- API endpoint testing
- Load testing

### Android Testing
- GPS accuracy testing
- Battery drain testing
- Background service testing
- Different Android versions

### Integration Testing
- End-to-end location update flow
- Real-time sync verification
- Offline/online transitions

## Future Enhancements (Phase 3?)

- iOS app
- Sharing trip photos
- Weather information at locations
- Travel statistics and insights
- Export trip data
- Social sharing features
- Multi-user support (track multiple people)

## Getting Started with Phase 2

When ready to start Phase 2, begin with:

1. Run `amplify init` in this project
2. Follow the Amplify setup wizard
3. Review and update the GraphQL schema
4. Test API endpoints before building Android app

## Resources

- **AWS Amplify Docs:** https://docs.amplify.aws/
- **Android Location Guide:** https://developer.android.com/training/location
- **GraphQL Tutorial:** https://graphql.org/learn/
- **AWS Amplify Android:** https://docs.amplify.aws/android/

## Questions to Consider

Before starting Phase 2:

1. How often should GPS update? (every minute? every 10 minutes?)
2. Should tracking be always-on or manual start/stop?
3. Battery life vs accuracy trade-off?
4. Show all historical locations or just recent ones?
5. Public access or password protected?
6. Need trip/journey grouping?
