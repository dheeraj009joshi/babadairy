# Fixing 404 Errors on Netlify - SPA Routing

## Problem
When refreshing pages or directly accessing routes like `/admin/dashboard`, Netlify returns a 404 error because it's looking for those files on the server, but React Router handles routing client-side.

## Solution
Netlify needs to be configured to redirect all routes to `index.html` so React Router can handle the routing.

## Files Created

### 1. `public/_redirects`
This file is automatically copied to `dist/` during build and tells Netlify how to handle routes:
```
/*    /index.html   200
```

### 2. `netlify.toml`
This file configures Netlify build settings and redirects:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment Steps

### Option 1: Git-based Deployment (Recommended)
1. Commit and push the files:
   ```bash
   git add .
   git commit -m "Fix Netlify routing for SPA"
   git push
   ```
2. Netlify will automatically rebuild and deploy
3. The `_redirects` file and `netlify.toml` will be picked up automatically

### Option 2: Manual Deployment
1. Make sure `dist/_redirects` file exists (it should after running `npm run build`)
2. Upload the entire `dist` folder to Netlify
3. Or drag and drop the `dist` folder in Netlify dashboard

## Verification

After deployment:
1. Visit your site: `https://your-site.netlify.app`
2. Navigate to `/admin/dashboard`
3. Refresh the page (F5 or Cmd+R)
4. It should NOT show 404 - React Router should handle it

## Troubleshooting

### Still getting 404?
1. **Check Netlify Deploy Logs**
   - Go to Netlify Dashboard → Deploys → Click on latest deploy
   - Check if `_redirects` file is mentioned in the build log

2. **Verify `_redirects` file is in dist**
   ```bash
   cat dist/_redirects
   ```
   Should show: `/*    /index.html   200`

3. **Check Netlify Site Settings**
   - Go to Site Settings → Build & Deploy → Build Settings
   - Verify:
     - Build command: `npm run build`
     - Publish directory: `dist`

4. **Clear Netlify Cache**
   - Go to Deploys → Trigger deploy → Clear cache and deploy site

5. **Check `netlify.toml` is at root**
   - The file should be in the repository root (same level as `package.json`)

6. **Force Redeploy**
   - Sometimes Netlify needs a fresh deploy to pick up changes
   - Go to Deploys → Trigger deploy → Deploy site

## Alternative: Use Netlify Dashboard

If files aren't working, you can also set redirects in Netlify Dashboard:

1. Go to **Site Settings** → **Redirects and rewrites**
2. Click **New rule**
3. Add:
   - **Rule**: `/*`
   - **To**: `/index.html`
   - **Status**: `200`
4. Save and redeploy

## Why This Works

- **`_redirects` file**: Netlify reads this file from your `dist` folder and applies the redirects
- **`netlify.toml`**: Provides the same configuration at build time
- **Status 200**: Returns success status so the URL stays the same (no redirect loop)
- **React Router**: Takes over and handles the routing client-side

## Notes

- Both `_redirects` and `netlify.toml` do the same thing - having both ensures it works
- The `_redirects` file must be in the `dist` folder (copied from `public/` during build)
- After deploying, wait a few seconds for Netlify to process the redirects
- Clear your browser cache if you still see 404 after fixing

