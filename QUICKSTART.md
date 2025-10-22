# Quick Start Guide

## Test Locally First

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - The terminal will show a URL like: `http://localhost:5173`
   - Open this URL in your browser

3. **Test the features:**
   - View the calendar with color-coded dates
   - Click on dates to see location details
   - Check the map with markers
   - Verify planned (blue) vs actual (green) locations

## Deploy to AWS Amplify

### Step 1: Push to GitHub

```bash
# Add the remote repository
git remote add origin https://github.com/ashmanpan/whereiskrisshnaji.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy via AWS Console

1. **Login to AWS:** https://console.aws.amazon.com/
2. **Go to AWS Amplify service**
3. **Click "New app" → "Host web app"**
4. **Select "GitHub"** and authorize
5. **Choose repository:** `ashmanpan/whereiskrisshnaji`
6. **Choose branch:** `main`
7. **Click "Next"** (build settings auto-detected)
8. **Click "Save and deploy"**
9. **Wait ~5 minutes** for deployment
10. **Access your live site!**

## Update Travel Locations

### Edit the data file:

**File location:** `src/data/travelData.json`

**Add a new location:**
```json
{
  "id": 4,
  "name": "Goa",
  "type": "planned",
  "date": "2025-11-01",
  "coordinates": {
    "lat": 15.2993,
    "lng": 74.1240
  },
  "notes": "Beach vacation"
}
```

### Update location type:

Change `"type": "planned"` to `"type": "actual"` when you arrive at a location.

### Deploy updates:

```bash
git add src/data/travelData.json
git commit -m "Update Krishnaji's location"
git push
```

AWS Amplify will automatically rebuild and deploy in ~3 minutes.

## Tips for Finding Coordinates

1. **Google Maps:**
   - Right-click on a location
   - Click the coordinates to copy them
   - Format: `lat, lng`

2. **Online tools:**
   - https://www.latlong.net/
   - Enter city name to get coordinates

## Color Coding Reference

- **Blue (Planned):** Future locations or planned visits
- **Green (Actual):** Current or past locations where Krishnaji actually was

## Phase 2 Features (Coming Soon)

- Android app for GPS tracking
- Automatic location updates
- Real-time position tracking
- Integration with Google Maps Timeline

## Troubleshooting

**Can't see the map?**
- Check browser console for errors
- Ensure internet connection (map tiles load from internet)

**Dates not showing colors?**
- Verify date format is `YYYY-MM-DD`
- Check JSON syntax is valid

**Local dev server not starting?**
- Run `npm install` again
- Check Node.js version (should be 16+)

## Need Help?

- Check `DEPLOYMENT.md` for detailed deployment guide
- Check `README.md` for full documentation
