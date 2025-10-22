# Admin Panel Guide

## Accessing the Admin Panel

### Default Credentials

**Username:** `admin`
**Password:** `krishnaji123`

**⚠️ Important:** Change these credentials before deploying to production!

### Login Steps

1. Visit your site: https://main.d6fzxseu4c8kk.amplifyapp.com
2. Click the "Admin Login" button in the header
3. Enter your username and password
4. Click "Login"

## Managing Locations

### Adding a New Location

1. Click the "+ Add Location" button
2. Fill in the required fields:
   - **City Name:** Name of the location (e.g., "Mumbai")
   - **Type:** Choose "Planned" or "Actual"
   - **Date:** Select the date (format: YYYY-MM-DD)
   - **Latitude:** Enter latitude coordinate
   - **Longitude:** Enter longitude coordinate
   - **Notes:** (Optional) Add any additional information

3. Click "Add Location"

**Finding Coordinates:**
- Visit https://www.latlong.net/
- Search for your city
- Copy the latitude and longitude values

### Updating Location Type

- Use the dropdown next to each location to change between "Planned" and "Actual"
- Changes are saved automatically

### Deleting a Location

1. Find the location you want to delete
2. Click the "Delete" button
3. Confirm the deletion

### Downloading Your Data

Click the "Download Data" button to save a backup JSON file of all your locations.

## How the Admin Panel Works

### Data Storage

- Locations are stored in your browser's **localStorage**
- Data persists across sessions on the same browser
- Data is private to your browser only
- When you visit from a different browser or device, you'll see the default data

### Public View

- The public site (homepage) automatically loads and displays your updated locations
- Visitors see the same locations you've added in the admin panel
- The map updates dynamically when clicking on calendar dates

## Changing Admin Credentials

### Method 1: Environment Variables (Recommended)

1. **Edit the .env file:**
   ```bash
   nano .env
   ```

2. **Update credentials:**
   ```
   VITE_ADMIN_USERNAME=your_username
   VITE_ADMIN_PASSWORD=your_secure_password
   ```

3. **Rebuild and deploy:**
   ```bash
   npm run build
   ./update-and-deploy.sh
   ```

### Method 2: AWS Amplify Environment Variables

1. Go to AWS Amplify Console
2. Select your app
3. Go to "App settings" → "Environment variables"
4. Add these variables:
   - `VITE_ADMIN_USERNAME` = your_username
   - `VITE_ADMIN_PASSWORD` = your_secure_password
5. Redeploy your app

## Features

### Calendar View (Public)
- Color-coded dates:
  - **Blue** = Planned location
  - **Green** = Actual location
- Click any date to see location details
- Map updates to show selected date's location

### Map View (Public)
- Shows all locations by default
- When you click a date, shows only that date's locations
- Blue markers = Planned locations
- Green markers = Actual locations
- Dashed line shows travel route in chronological order
- Click markers to see location details

### Admin Panel Features
- Add unlimited locations
- Update location type (planned ↔ actual)
- Delete locations
- Download backup
- View total location count
- Sorted by date (newest first)

## Tips

### Best Practices

1. **Regular Backups:** Download your data regularly using the "Download Data" button
2. **Update Status:** Change "Planned" to "Actual" when you arrive at a location
3. **Accurate Coordinates:** Use latlong.net for precise coordinates
4. **Clear Notes:** Add helpful notes to remember trip purposes

### Coordinate Tips

**Popular Indian Cities:**

| City | Latitude | Longitude |
|------|----------|-----------|
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.6139 | 77.2090 |
| Bangalore | 12.9716 | 77.5946 |
| Pune | 18.5204 | 73.8567 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |
| Hyderabad | 17.3850 | 78.4867 |
| Ahmedabad | 23.0225 | 72.5714 |
| Jaipur | 26.9124 | 75.7873 |
| Goa | 15.2993 | 74.1240 |

## Troubleshooting

### Can't Log In
- Check your username and password (case-sensitive)
- Default: admin / krishnaji123
- Clear browser cache and try again

### Changes Not Showing
- Click "View Site" to see your updates on the homepage
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)

### Lost Your Data
- Data is stored in browser localStorage
- If you cleared browser data, it's gone
- Always download backups regularly
- Consider setting up the backend API (Phase 2) for persistent storage

### Map Not Showing
- Check internet connection (map tiles load from OpenStreetMap)
- Verify coordinates are correct (latitude: -90 to 90, longitude: -180 to 180)
- Check browser console for errors

## Security Notes

### Current Implementation (Phase 1)
- Simple username/password authentication
- Session-based (stays logged in during browser session)
- Data stored locally in browser
- **Not suitable for sensitive data**

### For Production Use
- Change default credentials immediately
- Use environment variables for credentials
- Consider implementing AWS Cognito for better security (Phase 2)
- Don't share your admin credentials

## Phase 2 Enhancements

Future improvements will include:
- AWS backend database (persistent storage)
- Better authentication with AWS Cognito
- Android app integration
- Automatic GPS location updates
- Multi-device synchronization
- User roles and permissions

## Need Help?

- Check the main README.md for project documentation
- Review QUICKSTART.md for basic operations
- See PHASE2_PLAN.md for future features
- Open an issue on GitHub: https://github.com/ashmanpan/whereiskrisshnaji/issues
