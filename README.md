# Where is Krishnaji?

A travel tracking application showing Krishnaji's planned and actual locations on a calendar and map.

## Features

- **Interactive Calendar**: View travel schedule with color-coded dates
  - Blue: Planned locations
  - Green: Actual locations
- **Travel Map**: Visual representation of all locations with route lines
- **Location Details**: Click on calendar dates to see location information

## Phase 1 (Current)
- Manual updates via JSON file
- Calendar view with color coding
- Interactive map with markers
- Planned vs Actual location tracking

## Phase 2 (Future)
- Android app integration
- GPS-based location updates
- Real-time location tracking
- Automatic location updates

## Manual Data Update

To update travel locations, edit the file: `src/data/travelData.json`

### Data Format:
```json
{
  "locations": [
    {
      "id": 1,
      "name": "City Name",
      "type": "planned" or "actual",
      "date": "YYYY-MM-DD",
      "coordinates": {
        "lat": 12.3456,
        "lng": 78.9012
      },
      "notes": "Optional notes"
    }
  ]
}
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## AWS Amplify Deployment

### Prerequisites
- AWS Account
- AWS Amplify CLI installed
- Git repository

### Deployment Steps

1. Initialize Git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub:
```bash
git remote add origin https://github.com/ashmanpan/whereiskrisshnaji.git
git branch -M main
git push -u origin main
```

3. Deploy with AWS Amplify:

#### Option A: Using AWS Console
1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect your GitHub repository
4. Select the repository and branch
5. Amplify will auto-detect build settings from `amplify.yml`
6. Click "Save and deploy"

#### Option B: Using Amplify CLI
```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Configure Amplify with default profile
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Publish the app
amplify publish
```

### Updating Data in Production

After deployment, to update travel locations:

1. Edit `src/data/travelData.json`
2. Commit and push changes:
```bash
git add src/data/travelData.json
git commit -m "Update travel locations"
git push
```

3. Amplify will automatically rebuild and deploy

## Color Coding

- **Blue markers/dates**: Planned locations
- **Green markers/dates**: Actual locations
- **Dashed line**: Travel route connecting locations in chronological order

## Technology Stack

- React 18
- Vite
- React Calendar
- Leaflet (OpenStreetMap)
- React Leaflet
- AWS Amplify

## License

MIT

