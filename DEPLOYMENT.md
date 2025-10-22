# AWS Amplify Deployment Guide

## Quick Deployment Steps

### 1. Initialize Git and Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Where is Krishna travel tracker"

# Add remote repository (using your provided GitHub URL)
git remote add origin https://github.com/ashmanpan/whereiskrisshnaji.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 2. Deploy to AWS Amplify Console

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Use your default AWS account profile

2. **Navigate to AWS Amplify**
   - Search for "Amplify" in the AWS Console
   - Click on "AWS Amplify"

3. **Create New App**
   - Click "New app" → "Host web app"
   - Select "GitHub" as your repository service
   - Authorize AWS Amplify to access your GitHub account

4. **Configure Repository**
   - Select repository: `ashmanpan/whereiskrisshnaji`
   - Select branch: `main`
   - Click "Next"

5. **Build Settings**
   - App name: `whereiskrishnaji`
   - Amplify will auto-detect the `amplify.yml` file
   - No changes needed (uses default configuration)
   - Click "Next"

6. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"

7. **Wait for Deployment**
   - Provision (1-2 minutes)
   - Build (2-3 minutes)
   - Deploy (1 minute)
   - Verify (30 seconds)

8. **Access Your Site**
   - Once complete, you'll get a URL like: `https://main.xxxxx.amplifyapp.com`
   - Click the URL to view your live site

### 3. Updating Travel Data

To update locations after deployment:

1. **Edit the data file**
   ```bash
   # Edit src/data/travelData.json with your new locations
   nano src/data/travelData.json
   ```

2. **Commit and push changes**
   ```bash
   git add src/data/travelData.json
   git commit -m "Update travel locations for [date]"
   git push
   ```

3. **Automatic rebuild**
   - AWS Amplify will automatically detect the push
   - It will rebuild and redeploy your site
   - Takes about 2-4 minutes

### 4. Example Data Update

```json
{
  "locations": [
    {
      "id": 1,
      "name": "Delhi",
      "type": "actual",
      "date": "2025-10-23",
      "coordinates": {
        "lat": 28.6139,
        "lng": 77.2090
      },
      "notes": "Currently in Delhi"
    },
    {
      "id": 2,
      "name": "Jaipur",
      "type": "planned",
      "date": "2025-10-25",
      "coordinates": {
        "lat": 26.9124,
        "lng": 75.7873
      },
      "notes": "Planning to visit Jaipur"
    }
  ]
}
```

## Using AWS CLI (Alternative Method)

If you prefer command line:

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Configure with default profile
amplify configure

# Initialize Amplify
amplify init
# - Enter a name for the project: whereiskrishnaji
# - Enter a name for the environment: prod
# - Choose your default editor: (your choice)
# - Choose the type of app: javascript
# - Framework: react
# - Source directory path: src
# - Distribution directory path: dist
# - Build command: npm run build
# - Start command: npm run dev
# - Use AWS profile: default

# Add hosting
amplify add hosting
# - Select: Hosting with Amplify Console
# - Choose: Manual deployment

# Publish
amplify publish
```

## Continuous Deployment (Recommended)

AWS Amplify supports automatic deployments:

1. **Main branch**: Auto-deploys to production
2. **Feature branches**: Can create preview environments

To enable branch previews:
- Go to Amplify Console
- App settings → Branch deployments
- Enable preview for feature branches

## Custom Domain (Optional)

1. Go to Amplify Console
2. Select your app
3. Click "Domain management"
4. Click "Add domain"
5. Enter your custom domain
6. Follow DNS configuration instructions

## Environment Variables (For Phase 2)

When adding Android app integration:

1. Go to Amplify Console
2. App settings → Environment variables
3. Add variables like:
   - `REACT_APP_API_ENDPOINT`
   - `REACT_APP_AUTH_TOKEN`

## Monitoring

- **Build history**: View all deployments
- **Logs**: Check build and deploy logs
- **Metrics**: Monitor traffic and performance
- **Alerts**: Set up notifications for build failures

## Troubleshooting

### Build Fails
- Check build logs in Amplify Console
- Verify `amplify.yml` configuration
- Ensure all dependencies in `package.json`

### Site Not Updating
- Check GitHub push was successful
- Verify webhook in GitHub settings
- Manually trigger rebuild in Amplify Console

### Data Not Showing
- Check JSON syntax in `travelData.json`
- Verify file path is correct
- Check browser console for errors

## Cost Estimate

AWS Amplify Free Tier:
- 1000 build minutes per month
- 15 GB data storage
- 5 GB served per month

Typical monthly cost: $0 (within free tier for small apps)

## Support

For issues:
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- GitHub Issues: https://github.com/ashmanpan/whereiskrisshnaji/issues
