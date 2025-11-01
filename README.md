# PulseRooms

**Real-Time Collective Moods & Micro Actions**

> "See what the world feels — and act together in 30 seconds."

## Overview

PulseRooms is a real-time emotional social app where users express their current mood through color, sound, and emotion, connecting with others feeling the same way across the globe. Built with Expo (React Native), Convex backend, and Clerk authentication.

## Tech Stack

- **Frontend**: Expo (React Native) + React Native Reanimated + Skia
- **Backend**: Convex (real-time data, subscriptions, scheduled jobs)
- **Auth**: Clerk
- **Key Features**: 
  - Real-time mood mapping
  - Ephemeral PulseRooms
  - AI mood analysis
  - Gamification & streaks
  - Premium monetization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Convex:
```bash
npx convex dev
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your keys:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_CONVEX_URL`

4. Start the development server:
```bash
npm start
```

## Project Structure

```
/convex          - Backend logic (queries, mutations, actions)
/app             - Expo Router screens
/components      - React components
/services        - Platform services (audio, location, notifications)
/utils           - Helper functions
/constants       - App constants and config
```

## Features

### Core
- 🎨 Mood Spectrum Selector
- 🗺️ Live Global Pulse Map
- 🏠 Ephemeral PulseRooms
- ⏱️ Real-Time Pulse Timeline
- 🤝 Sync Pulse (friend connection)

### Advanced
- 🎵 Sound Pulse Layer
- 💫 Group Mood Fusion
- 👥 Mood Circles (private groups)
- 🔥 Streak System
- 🎴 Collectible Mood Cards
- 🏆 Mood Territories & Leaderboards

### AI & Personalization
- 🤖 AI Mood Coach
- 👤 AI Mood Avatar
- 📊 Mood Forecasts
- 🔮 Social Matching AI

## License

Proprietary - All rights reserved

## Contact

For questions or support: support@pulserooms.app

