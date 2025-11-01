import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
}

const PREMIUM_FEATURES = [
  { icon: '∞', text: 'Unlimited pulses per day' },
  { icon: '🎨', text: 'Custom color palettes' },
  { icon: '📊', text: 'Full mood history access' },
  { icon: '🏙️', text: 'City takeover visualizations' },
  { icon: '⭐', text: 'Priority in PulseRooms' },
  { icon: '🚫', text: 'Ad-free experience' },
  { icon: '🎯', text: 'Advanced analytics' },
  { icon: '💬', text: 'Unlimited sync pulses' },
];

export function SubscriptionModal({ visible, onClose, onSubscribe }: SubscriptionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Go Premium</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.tagline}>Unlock the full PulseRooms experience</Text>

          <View style={styles.featuresContainer}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plansContainer}>
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => onSubscribe('monthly')}
              activeOpacity={0.8}
            >
              <Card style={styles.plan} variant="elevated">
                <Text style={styles.planBadge}>MONTHLY</Text>
                <Text style={styles.planPrice}>€4.99</Text>
                <Text style={styles.planPeriod}>per month</Text>
                <Text style={styles.planSaving}>7-day free trial</Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.planCard}
              onPress={() => onSubscribe('yearly')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.bestValueBanner}
              >
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </LinearGradient>
              <Card style={styles.plan} variant="elevated">
                <Text style={styles.planBadge}>YEARLY</Text>
                <Text style={styles.planPrice}>€49.99</Text>
                <Text style={styles.planPeriod}>per year</Text>
                <Text style={styles.planSaving}>Save 17% • 7-day free trial</Text>
              </Card>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Cancel anytime. Auto-renews unless cancelled at least 24 hours before the end of the
            current period.
          </Text>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    position: 'relative',
  },
  bestValueBanner: {
    position: 'absolute',
    top: -8,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.text,
  },
  plan: {
    padding: 20,
    alignItems: 'center',
  },
  planBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  planSaving: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

