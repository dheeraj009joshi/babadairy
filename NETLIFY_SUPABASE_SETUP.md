# Configuring Supabase in Netlify

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Add Environment Variables in Netlify

### Option A: Via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site

2. **Navigate to Site Settings**
   - Click on your site name
   - Go to **Site configuration** → **Environment variables**
   - Or directly: `https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/env`

3. **Add Environment Variables**
   - Click **Add a variable** button
   - Add the first variable:
     - **Key**: `VITE_SUPABASE_URL`
     - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
     - **Scopes**: Select **All scopes** (or specific scopes if needed)
   - Click **Add variable**

4. **Add Second Variable**
   - Click **Add a variable** again
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key
   - **Scopes**: Select **All scopes**
   - Click **Add variable**

5. **Verify Variables**
   - You should see both variables listed:
     ```
     VITE_SUPABASE_URL = https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJ...
     ```

### Option B: Via netlify.toml (Alternative)

You can also add environment variables in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_SUPABASE_URL = "https://xxxxx.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-anon-key-here"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

⚠️ **Note**: This method exposes your keys in the repository. Use Netlify Dashboard (Option A) for better security.

## Step 3: Redeploy Your Site

After adding environment variables:

1. **Trigger a New Deploy**
   - Go to **Deploys** tab in Netlify
   - Click **Trigger deploy** → **Deploy site**
   - Or push a new commit to trigger automatic deploy

2. **Verify Build**
   - Check the build logs to ensure it completes successfully
   - Look for any Supabase-related errors

## Step 4: Verify Supabase Connection

1. **Check Browser Console**
   - Open your deployed site
   - Open browser DevTools (F12)
   - Go to **Console** tab
   - Look for any Supabase connection errors

2. **Test Functionality**
   - Try adding a product (if admin)
   - Try placing an order
   - Check if data persists (refresh page)

## Step 5: Set Up Database Tables

Make sure you've run the SQL schema in Supabase:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the SQL from `SUPABASE_SETUP.md`
3. Verify tables are created:
   - `products`
   - `orders`
   - `users`
   - `reviews`

## Troubleshooting

### Environment Variables Not Working

**Problem**: App still uses localStorage instead of Supabase

**Solutions**:
- ✅ Verify variables are set in Netlify dashboard
- ✅ Check variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Redeploy after adding variables
- ✅ Check build logs for any errors
- ✅ Verify variables are set for **Production** scope (or All scopes)

### Build Fails

**Problem**: Build fails with Supabase-related errors

**Solutions**:
- ✅ Check if `@supabase/supabase-js` is in `package.json`
- ✅ Verify environment variables are set correctly
- ✅ Check build logs for specific error messages
- ✅ Make sure `.env` file is NOT committed (should be in `.gitignore`)

### Data Not Syncing

**Problem**: Changes don't persist after refresh

**Solutions**:
- ✅ Verify Supabase tables exist and have correct schema
- ✅ Check RLS (Row Level Security) policies in Supabase
- ✅ Verify API keys have correct permissions
- ✅ Check browser console for Supabase errors
- ✅ Ensure environment variables are set in Netlify

### CORS Errors

**Problem**: CORS errors when connecting to Supabase

**Solutions**:
- ✅ Check Supabase project settings
- ✅ Verify API keys are correct
- ✅ Check if your domain is allowed in Supabase settings (if using custom domain)

## Environment Variable Scopes

When adding variables in Netlify, you can set scopes:

- **All scopes**: Available in all environments (Production, Deploy Previews, Branch Deploys)
- **Production**: Only in production builds
- **Deploy Previews**: Only in preview deployments
- **Branch Deploys**: Only in branch-specific deployments

**Recommendation**: Use **All scopes** for Supabase variables unless you have separate Supabase projects for different environments.

## Security Best Practices

1. ✅ **Never commit `.env` file** - Add to `.gitignore`
2. ✅ **Use Netlify Dashboard** - Don't hardcode keys in `netlify.toml`
3. ✅ **Use anon key** - The anon key is safe for client-side use (RLS protects your data)
4. ✅ **Review RLS policies** - Make sure Row Level Security is properly configured
5. ✅ **Rotate keys if compromised** - You can regenerate keys in Supabase dashboard

## Quick Checklist

- [ ] Supabase project created
- [ ] Database tables created (run SQL schema)
- [ ] Environment variables added in Netlify dashboard
- [ ] Site redeployed
- [ ] Verified connection in browser console
- [ ] Tested data persistence

## Need Help?

- **Netlify Docs**: https://docs.netlify.com/environment-variables/overview/
- **Supabase Docs**: https://supabase.com/docs
- **Check build logs**: Netlify Dashboard → Deploys → Click on deploy → View build log

