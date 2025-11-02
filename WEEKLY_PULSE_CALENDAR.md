# Weekly Pulse Calendar Feature

## Overview

The Weekly Pulse Calendar is a new social feature that creates a structured weekly schedule for users to sync pulses with their friends. Each Sunday, the system automatically generates a new week of daily assignments where users are matched with friends to encourage regular engagement.

## Key Features

### 📅 Weekly Calendar System
- **7-Day Schedule**: Each week has assignments for Sunday through Saturday
- **Daily Matches**: Users are paired with different friends each day
- **Mood Assignments**: Each day has a randomly assigned mood theme
- **Sunday Reset**: New calendars are automatically generated every Sunday at midnight UTC

### 🤝 Friend Matching
- Uses existing friendships to create daily pairings
- Random assignment ensures variety throughout the week
- Solo sync days available when no friends are available
- Automatic calendar badge shows when syncing with today's match

### 📊 Progress Tracking
- **Completion Status**: Track which days you've completed
- **Weekly Stats**: View completion rate, streak, and completed days
- **Streak Counter**: Build daily streaks by completing consecutive assignments
- **Rewards**: Earn badges for completing full weeks

### 🎯 Calendar Integration with Sync Pulses
- When users accept sync pulse requests, assignments are automatically marked complete
- Calendar badge appears in sync pulse modal when syncing with today's match
- Both users' calendars update when a sync is accepted

## Technical Implementation

### Database Schema

#### `weeklyPulseCalendar` Table
```typescript
{
  userId: Id<'users'>,
  weekStart: string,        // YYYY-MM-DD of Sunday
  weekEnd: string,          // YYYY-MM-DD of Saturday
  assignments: Array<{
    dayOfWeek: number,      // 0-6 (Sunday-Saturday)
    date: string,           // YYYY-MM-DD
    matchedUserId?: Id<'users'>,
    mood: string,
    color: string,
    completed: boolean,
    syncedAt?: number
  }>,
  isActive: boolean
}
```

### Backend Functions

**Location**: `/workspace/convex/weeklyPulseCalendar.ts`

#### Queries
- `getCurrentWeek(userId)` - Get user's current week calendar
- `getWeek(userId, weekStart)` - Get specific week calendar
- `getTodayMatch(userId)` - Get today's matched user
- `getWeeklyStats(userId)` - Get completion statistics

#### Mutations
- `completeAssignment(userId, date)` - Mark a day as completed
- Awards "week_completed" badge when all 7 days are done

#### Internal Mutations
- `generateWeeklyCalendar(userId)` - Create new week for a user
- `generateAllCalendars()` - Create calendars for all users (cron job)
- `deactivateCalendars()` - Mark old calendars as inactive

### Frontend Components

#### `WeeklyPulseCalendar` Component
**Location**: `/workspace/components/social/WeeklyPulseCalendar.tsx`

Features:
- Horizontal scrolling calendar view
- Weekly stats header (completed, streak, completion %)
- Visual day cards with mood emojis
- Status indicators (Today, Completed, Missed)
- Today's match section
- Info card explaining the feature

#### Integration Points
1. **Profile Screen**: Added "Calendar" tab to view weekly schedule
2. **Sync Pulse Modal**: Shows calendar badge when syncing with today's match
3. **Sync Accept Handler**: Automatically marks both users' assignments as complete

### Cron Job

**Location**: `/workspace/convex/crons.ts`

```typescript
crons.weekly(
  'generate weekly pulse calendars',
  { hourUTC: 0, minuteUTC: 0, dayOfWeek: 'sunday' },
  internal.weeklyPulseCalendar.generateAllCalendars
);
```

Runs every Sunday at midnight UTC to:
1. Deactivate previous week's calendars
2. Generate new calendars for all users
3. Create random friend matches for each day
4. Assign mood themes to each day

## User Flow

### Week Start (Sunday)
1. System generates new calendar for all users
2. Each user gets 7 daily assignments
3. Friends are randomly matched to different days
4. Mood themes are assigned to each day

### Daily Activity
1. User opens app and navigates to Calendar tab
2. Views current week's schedule
3. Sees today's matched friend (if any)
4. Sends sync pulse to today's match
5. Friend accepts sync request
6. Both users' calendars mark the day as completed

### Week Completion
1. User completes all 7 days
2. "week_completed" badge is automatically awarded
3. Stats update to show 100% completion
4. User maintains or extends their streak

## UI/UX Design Patterns

### Calendar Card States
- **Today**: Highlighted border, "Today" indicator
- **Completed**: Full color gradient, checkmark badge
- **Missed**: Past date without completion, "Missed" indicator
- **Future**: Muted colors, shows assigned mood

### Visual Elements
- Emoji-based mood indicators
- Color-coded day cards matching mood themes
- Progress stats prominently displayed
- Horizontal scroll for space efficiency
- Clear today's match section

### Empty States
- "No calendar yet" for new users or between weeks
- "Solo sync day" when no friend is matched
- Helpful info card explaining the feature

## Benefits

### For Users
- **Structure**: Predictable schedule for social engagement
- **Motivation**: Weekly goals and completion tracking
- **Discovery**: Connect with different friends each day
- **Rewards**: Badges and streaks for consistency

### For Engagement
- **Daily Returns**: Encourages users to open app daily
- **Social Bonds**: Strengthens friendships through regular interaction
- **Habit Formation**: Weekly rhythm builds consistent usage
- **Gamification**: Progress tracking and rewards drive completion

## Future Enhancements

### Potential Features
1. **Custom Scheduling**: Let users set preferred sync times
2. **Match Preferences**: Allow users to prioritize certain friends
3. **Group Days**: Multi-friend sync challenges
4. **Themed Weeks**: Special weekly challenges with unique moods
5. **Calendar History**: View past weeks' performance
6. **Reminders**: Notifications for today's match
7. **Flex Days**: Swap or skip days with friend consent
8. **Leaderboards**: Compare completion rates with friends

### Analytics Opportunities
- Track weekly completion rates
- Measure friend engagement patterns
- Identify optimal matching algorithms
- Monitor feature adoption and retention

## Code Locations

### Core Files
- Schema: `/workspace/convex/schema.ts` (lines 283-305)
- Backend: `/workspace/convex/weeklyPulseCalendar.ts`
- Component: `/workspace/components/social/WeeklyPulseCalendar.tsx`
- Cron: `/workspace/convex/crons.ts` (lines 90-95)
- Profile Tab: `/workspace/app/(tabs)/profile.tsx`
- Sync Integration: `/workspace/convex/sync.ts` (acceptRequest mutation)
- Modal Update: `/workspace/components/social/SyncPulseModal.tsx`
- Friends Screen: `/workspace/app/(modals)/friends.tsx`

## Testing Checklist

- [ ] Calendar generation works on Sunday cron
- [ ] Friend matching creates valid pairings
- [ ] Calendar displays correctly in Profile tab
- [ ] Today's match shows in calendar
- [ ] Sync pulse acceptance marks day complete
- [ ] Calendar badge appears in sync modal
- [ ] Weekly stats calculate correctly
- [ ] Completion rewards badge properly
- [ ] Empty states render appropriately
- [ ] Missed days show correct indicator
- [ ] Future days display as locked/muted

## Maintenance Notes

### Database Cleanup
- Old calendars are marked `isActive: false` but not deleted
- Consider archiving calendars older than 4 weeks
- Monitor database size as user base grows

### Performance Considerations
- Calendar generation runs for all users weekly
- Use batching/throttling for large user bases
- Consider time zone adjustments for global users
- Index optimization for calendar queries

### Configuration
- Cron time currently hardcoded to UTC midnight Sunday
- Mood list and colors pulled from existing constants
- Assignment completion only allowed on current day
- Badges use existing system infrastructure
