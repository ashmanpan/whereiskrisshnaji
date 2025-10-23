# GitHub Auto-Deploy Setup

## Overview

Your AWS Amplify app is ready for automatic deployments! Every time you push to GitHub, your site will automatically rebuild and deploy.

## Webhook Created

✅ AWS Amplify webhook has been created successfully!

**Webhook URL:**
```
https://webhooks.amplify.ap-south-1.amazonaws.com/prod/webhooks?id=bdeb7818-077e-4fe9-afea-9546a03d6125&token=k5pg9rVaEKrk4lSqfFnKvmGmgFSpfZbGmsPi2lWAdk
```

## Setup Instructions

### Step 1: Add Webhook to GitHub

1. **Go to your GitHub repository settings:**
   https://github.com/ashmanpan/whereiskrisshnaji/settings/hooks

2. **Click "Add webhook"**

3. **Fill in the form:**
   - **Payload URL:**
     ```
     https://webhooks.amplify.ap-south-1.amazonaws.com/prod/webhooks?id=bdeb7818-077e-4fe9-afea-9546a03d6125&token=k5pg9rVaEKrk4lSqfFnKvmGmgFSpfZbGmsPi2lWAdk
     ```
   - **Content type:** `application/json`
   - **SSL verification:** Enable SSL verification (default)
   - **Which events would you like to trigger this webhook?**
     - Select: "Just the push event"
   - **Active:** ✓ (checked)

4. **Click "Add webhook"**

5. **You should see a green checkmark** after GitHub pings the webhook

### Step 2: Test Automatic Deployment

Make a small change and push:

```bash
# Make a test change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify auto-deploy from GitHub"
git push
```

### Step 3: Watch the Magic!

1. **Go to AWS Amplify Console:**
   https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d6fzxseu4c8kk

2. **You'll see a new build automatically start!**
   - Provision: ~1 min
   - Build: ~2-3 mins
   - Deploy: ~1 min
   - Verify: ~30 secs

3. **Your site updates automatically:**
   https://main.d6fzxseu4c8kk.amplifyapp.com

## How It Works

```
You push code → GitHub webhook → AWS Amplify → Automatic build & deploy
```

**Workflow:**
1. You make changes locally
2. `git push` to GitHub
3. GitHub sends webhook notification to AWS Amplify
4. Amplify automatically:
   - Pulls latest code
   - Runs `npm install`
   - Runs `npm run build`
   - Deploys to production
   - Updates your live site

## What This Means

### ✅ No More Manual Deployments!

**Before (Manual):**
```bash
npm run build
./update-and-deploy.sh
```

**Now (Automatic):**
```bash
git push
# That's it! AWS Amplify handles the rest
```

### ✅ Always Up-to-Date

- Every commit to `main` branch = automatic deployment
- No need to remember to deploy
- Your live site always matches your GitHub code

### ✅ Build History

- See all deployments in Amplify console
- View build logs for debugging
- Rollback to previous versions if needed

## Verification

After setting up the webhook, verify it's working:

### Check Webhook Status

1. Go to: https://github.com/ashmanpan/whereiskrisshnaji/settings/hooks
2. Click on your webhook
3. Check "Recent Deliveries" tab
4. Should show successful pings with status 200

### Check Amplify Builds

1. Go to Amplify Console
2. View build history
3. Should see builds triggered by "Webhook"

## Troubleshooting

### Webhook Not Triggering

**Check GitHub webhook:**
- Go to Settings → Webhooks
- Click on the webhook
- Check "Recent Deliveries"
- Look for error messages

**Common issues:**
- Webhook URL incorrect
- SSL verification failed
- GitHub couldn't reach AWS

**Fix:**
- Delete webhook in GitHub
- Re-add with correct URL from above
- Ensure "Active" is checked

### Build Failing

**View build logs:**
1. Go to Amplify Console
2. Click on failed build
3. View detailed logs
4. Check for errors in:
   - npm install
   - npm run build

**Common issues:**
- Dependency installation failed
- Build command failed
- Environment variables missing

**Fix:**
- Check `package.json` dependencies
- Test build locally: `npm run build`
- Add environment variables in Amplify Console

### Deployment Slow

Normal timing:
- **Total:** 4-6 minutes
- Provision: 1 min
- Build: 2-3 mins
- Deploy: 1 min
- Verify: 30 secs

If slower, check:
- Large `node_modules` size
- Many dependencies
- Complex build process

## Advanced Configuration

### Build Settings

Current build settings (from `amplify.yml`):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables

Set in Amplify Console:
- `VITE_ADMIN_USERNAME`
- `VITE_ADMIN_PASSWORD`

### Branch Deployments

Currently deploying:
- **main** → https://main.d6fzxseu4c8kk.amplifyapp.com

Can add more branches:
```bash
# Deploy from develop branch
aws amplify create-branch \
  --app-id d6fzxseu4c8kk \
  --branch-name develop \
  --enable-auto-build \
  --region ap-south-1
```

Then access at: https://develop.d6fzxseu4c8kk.amplifyapp.com

## Benefits

### For Development

- **Fast iterations:** Push and see changes live in 5 mins
- **No manual steps:** Focus on coding, not deploying
- **Team friendly:** Anyone with repo access can deploy

### For Admin Panel

- **Quick updates:** Fix bugs and push immediately
- **No downtime:** Seamless deployments
- **Version control:** Every change tracked in Git

### For Future (Phase 2)

- **API deployments:** Backend API also auto-deploys
- **Database migrations:** Run automatically
- **Android app sync:** API always up-to-date

## Next Steps

1. ✅ Add webhook to GitHub (follow Step 1 above)
2. ✅ Test with a commit (follow Step 2 above)
3. ✅ Verify deployment (follow Step 3 above)
4. 🎉 Enjoy automatic deployments!

## Resources

- **Amplify Console:** https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d6fzxseu4c8kk
- **GitHub Webhooks:** https://github.com/ashmanpan/whereiskrisshnaji/settings/hooks
- **Live Site:** https://main.d6fzxseu4c8kk.amplifyapp.com
- **Admin Panel:** https://main.d6fzxseu4c8kk.amplifyapp.com/login

## Support

Need help?
- Check Amplify build logs
- Review GitHub webhook delivery logs
- Check this documentation
- AWS Amplify docs: https://docs.aws.amazon.com/amplify/

---

**Once webhook is added, you'll never need to run `./update-and-deploy.sh` again!**
Just `git push` and AWS Amplify does the rest! 🚀
