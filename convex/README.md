# Convex Backend for PulseRooms

This directory contains all backend logic for PulseRooms using Convex.

## Structure

- `schema.ts` - Database schema definitions
- `users.ts` - User management functions
- `pulses.ts` - Pulse creation and queries
- `rooms.ts` - Real-time room management
- `circles.ts` - Mood circles logic
- `territories.ts` - City/region aggregations
- `sync.ts` - Sync pulse feature
- `chains.ts` - Pulse chain tracking
- `challenges.ts` - Global challenges
- `badges.ts` - Badge awards
- `ai.ts` - AI/ML integration
- `notifications.ts` - Push notifications
- `analytics.ts` - Event tracking
- `crons.ts` - Scheduled jobs

## Key Concepts

### Indexes
All tables have appropriate indexes for fast queries. Always query using indexed fields when possible.

### TTL (Time To Live)
Many collections use `expiresAt` fields for automatic cleanup via scheduled jobs.

### Real-time Subscriptions
Use Convex queries with `useQuery` on the frontend for automatic real-time updates.

## Development

Run the Convex dev server:
```bash
npx convex dev
```

Deploy to production:
```bash
npx convex deploy
```

