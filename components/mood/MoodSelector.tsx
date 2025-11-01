import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MOODS, MoodDefinition } from '@/constants/Moods';
import { MoodCard } from './MoodCard';
import { Colors } from '@/constants/Colors';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodDefinition, intensity: number) => void;
  selectedMood?: string;
  intensity?: number;
}

export function MoodSelector({
  onMoodSelect,
  selectedMood,
  intensity = 50,
}: MoodSelectorProps) {
  const [selected, setSelected] = useState<MoodDefinition | null>(
    selectedMood ? MOODS.find((m) => m.id === selectedMood) || null : null
  );
  const [moodIntensity, setMoodIntensity] = useState(intensity);

  const handleMoodPress = (mood: MoodDefinition) => {
    setSelected(mood);
    onMoodSelect(mood, moodIntensity);
  };

  const handleIntensityChange = (value: number) => {
    setMoodIntensity(value);
    if (selected) {
      onMoodSelect(selected, value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moods}
      >
        {MOODS.map((mood) => (
          <View key={mood.id} style={styles.moodItem}>
            <MoodCard
              mood={mood}
              onPress={() => handleMoodPress(mood)}
              selected={selected?.id === mood.id}
            />
          </View>
        ))}
      </ScrollView>

      {selected && (
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>Intensity</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderText}>Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={moodIntensity}
              onValueChange={handleIntensityChange}
              minimumTrackTintColor={selected.color}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={selected.color}
            />
            <Text style={styles.sliderText}>High</Text>
          </View>
          <Text style={styles.intensityValue}>{Math.round(moodIntensity)}%</Text>
        </View>
      )}

      {selected && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{selected.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  moods: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  moodItem: {
    marginRight: 12,
  },
  intensityContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  intensityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  intensityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
  descriptionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

