# Google Search Console Verification Setup

This project includes infrastructure to support Google Search Console verification through environment variables.

⚠️ **IMPORTANT:** You must set the actual Google verification code in your Vercel environment variables for the verification to work. The placeholder value in `.env.production` will not work.

## Setup Instructions

### 1. Get Your Verification Code from Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click "Add Property"
3. Select "URL prefix" and enter your production URL: `https://nnit-social-frontend.vercel.app/`
4. Click "Continue"
5. Choose the "HTML tag" verification method
6. Copy the `content` value from the meta tag Google provides. It will look like:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   ```

### 2. Configure the Environment Variable

#### For Vercel Deployment (Production):

1. Go to your [Vercel project settings](https://vercel.com/networkniceits-projects/nnit-social-frontend/settings/environment-variables)
2. Add a new environment variable:
   - **Name:** `VITE_GOOGLE_SITE_VERIFICATION`
   - **Value:** The verification code you copied from Google (just the content value, not the entire meta tag)
   - **Environment:** Select "Production" (and optionally "Preview" if you want to verify preview deployments too)
3. Click "Save"
4. Trigger a new deployment for the changes to take effect

#### For Local Development:

Update the `.env` file:
```bash
VITE_GOOGLE_SITE_VERIFICATION=your-actual-verification-code
```

### 3. Verify in Google Search Console

1. After deploying with the new environment variable, return to Google Search Console
2. Click the "Verify" button
3. Google will check your site for the verification meta tag and confirm ownership

## How It Works

The verification is implemented in `index.html` using Vite's environment variable interpolation:

```html
<meta name="google-site-verification" content="%VITE_GOOGLE_SITE_VERIFICATION%" />
```

During the build process, Vite replaces `%VITE_GOOGLE_SITE_VERIFICATION%` with the actual value from your environment variables.

## Verifying Multiple Properties

If you need to verify additional properties (like `/privacy/` or `/terms/`), they should automatically be verified once the main domain is verified, as they are sub-paths of the same domain.

## Troubleshooting

- **"We couldn't find your verification signature"**: Make sure the environment variable is set correctly in Vercel and that you've deployed after setting it.
- **Variable not replacing**: Ensure the variable name starts with `VITE_` prefix (required by Vite for client-side variables).
- **Changes not appearing**: Clear your browser cache or use an incognito window to check the deployed site.
