import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { MOOD_CARD_DEFINITIONS, getRarityColor } from '@/constants/MoodCards';
import { Id } from '@/convex/_generated/dataModel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

interface MoodCardGalleryProps {
  userId: Id<'users'>;
}

interface CollectibleCardProps {
  card: any;
  unlocked: boolean;
  onPress: () => void;
}

function CollectibleCard({ card, unlocked, onPress }: CollectibleCardProps) {
  const cardDef = MOOD_CARD_DEFINITIONS.find((c) => c.id === card.cardId);
  const rarityColor = getRarityColor(card.rarity);

  if (!unlocked) {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
        <Card style={[styles.lockedCard, { borderColor: rarityColor }]}>
          <Text style={styles.lockedEmoji}>🔒</Text>
          <Text style={styles.lockedText}>Locked</Text>
          <Text style={[styles.rarity, { color: rarityColor }]}>
            {card.rarity.toUpperCase()}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={card.colorGradient}
        style={[styles.unlockedCard, { borderColor: rarityColor, borderWidth: 2 }]}
      >
        <Text style={styles.cardEmoji}>{cardDef?.emoji || '✨'}</Text>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardDescription}>{card.description}</Text>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{card.rarity.toUpperCase()}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function MoodCardGallery({ userId }: MoodCardGalleryProps) {
  const userCards = useQuery(api.moodCards.getUserCards, { userId });
  const moodHistory = useQuery(api.pulses.getUserPulses, { userId, limit: 100 });

  // Get all possible cards and mark which are unlocked
  const allCards = MOOD_CARD_DEFINITIONS.map((def) => {
    const unlocked = userCards?.find((c) => c.cardId === def.id);
    return {
      ...def,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt,
    };
  });

  const unlockedCount = allCards.filter((c) => c.unlocked).length;

  const handleCardPress = (card: any) => {
    // Show card details modal
    console.log('Card pressed:', card);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Card Collection</Text>
        <Text style={styles.subtitle}>
          {unlockedCount} / {allCards.length} unlocked
        </Text>
      </View>

      <FlatList
        data={allCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollectibleCard
            card={item}
            unlocked={item.unlocked}
            onPress={() => handleCardPress(item)}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  grid: {
    padding: 10,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  cardContainer: {
    flex: 1,
    aspectRatio: 0.7,
  },
  lockedCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
  },
  lockedEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  unlockedCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  cardEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  rarity: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rarityBadge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
});

