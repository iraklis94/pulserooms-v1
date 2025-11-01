# PulseRooms Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

**Get your keys:**
- Clerk: https://dashboard.clerk.com
- Convex: https://dashboard.convex.dev

### 3. Start Expo

```bash
npm start
```

Or for specific platforms:
```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## Assets Setup

The app references these assets in `app.json`:
- `assets/icon.png` (1024x1024px)
- `assets/splash.png` (2048x2732px)
- `assets/adaptive-icon.png` (1024x1024px)
- `assets/favicon.png` (48x48px)

**For development:** Expo will work without these assets, but you'll see warnings.

**For production:** You'll need to create these assets before building.

## Troubleshooting

### Expo won't start
1. Clear cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node version: Should be 20.x

### Environment variables not loading
- Make sure `.env` file is in the root directory
- Restart Expo after creating/modifying `.env`
- Check that variable names start with `EXPO_PUBLIC_`

### Missing assets warnings
- These are non-critical for development
- Use Expo's asset generator or create placeholder images

### TypeScript errors
- Run `npx tsc --noEmit` to check for type errors
- Make sure all dependencies are installed

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Start Expo development server
4. 🔄 Set up Clerk authentication
5. 🔄 Set up Convex backend
6. 🔄 Create app assets
7. 🔄 Test core features

## Development Notes

- The app uses Expo Router for navigation
- Authentication is handled by Clerk
- Backend is powered by Convex
- All features are implemented and ready to test

