import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { StreakFlame } from '@/components/mood/StreakFlame';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { MoodCoachPanel } from '@/components/ai/MoodCoachPanel';
import { AvatarDisplay } from '@/components/ai/AvatarDisplay';
import { MoodDiary } from '@/components/export/MoodDiary';
import { MoodCardGallery } from '@/components/gamification/MoodCardGallery';
import { ChainVisualization } from '@/components/gamification/ChainVisualization';
import { QuestBoard } from '@/components/gamification/QuestBoard';
import { SubscriptionModal } from '@/components/premium/SubscriptionModal';
import { WeeklyPulseCalendar } from '@/components/social/WeeklyPulseCalendar';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [showSubscription, setShowSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'cards' | 'ai' | 'diary' | 'chains' | 'quests' | 'calendar'>('overview');

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : 'skip'
  );

  const userStats = useQuery(
    api.pulses.getUserStats,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    console.log('Subscribe to:', plan);
    setShowSubscription(false);
    // In production, handle actual subscription
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{user?.username || 'User'}</Text>
            <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
            {currentUser?.premiumStatus && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>✨ PREMIUM</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Stats overview */}
      {currentUser && userStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <StreakFlame streakDays={currentUser.streakDays} size={50} />
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userStats.totalPulses}</Text>
            <Text style={styles.statLabel}>Total Pulses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userStats.daysTracked}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>
        </View>
      )}

      {/* Tab navigation */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'cards', label: 'Cards', icon: '🎴' },
            { id: 'chains', label: 'Chains', icon: '⛓️' },
            { id: 'quests', label: 'Quests', icon: '🎯' },
            { id: 'ai', label: 'AI Coach', icon: '🤖' },
            { id: 'diary', label: 'Diary', icon: '📖' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content based on active tab */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.section}>
            {!currentUser?.premiumStatus && (
              <Card style={styles.upgradeCard}>
                <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeSubtitle}>
                  Unlimited pulses, custom colors, and more
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => setShowSubscription(true)}
                >
                  <Text style={styles.upgradeButtonText}>View Plans</Text>
                </TouchableOpacity>
              </Card>
            )}

            <Card style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/circle')}>
                <Text style={styles.menuIcon}>👥</Text>
                <Text style={styles.menuText}>Mood Circles</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuIcon}>🔔</Text>
                <Text style={styles.menuText}>Notifications</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuIcon}>⚙️</Text>
                <Text style={styles.menuText}>Settings</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            </Card>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'calendar' && currentUser && (
          <View style={styles.section}>
            <WeeklyPulseCalendar userId={currentUser._id} />
          </View>
        )}

        {activeTab === 'badges' && currentUser && (
          <BadgeShowcase userId={currentUser._id} />
        )}

        {activeTab === 'cards' && currentUser && (
          <MoodCardGallery userId={currentUser._id} />
        )}

        {activeTab === 'chains' && currentUser && (
          <ChainVisualization userId={currentUser._id} />
        )}

        {activeTab === 'quests' && currentUser && (
          <QuestBoard userId={currentUser._id} />
        )}

        {activeTab === 'ai' && currentUser && (
          <View>
            <MoodCoachPanel userId={currentUser._id} />
            <AvatarDisplay userId={currentUser._id} />
          </View>
        )}

        {activeTab === 'diary' && currentUser && (
          <MoodDiary userId={currentUser._id} />
        )}
      </ScrollView>

      <SubscriptionModal
        visible={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSubscribe={handleSubscribe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  upgradeCard: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuCard: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  menuChevron: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  signOutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

