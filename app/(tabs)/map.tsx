import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors } from '@/constants/Colors';
import { getCurrentLocation } from '@/services/location';
import { PulseCircle } from '@/components/mood/PulseCircle';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Get live pulses from Convex
  const livePulses = useQuery(api.pulses.getLive);
  const territories = useQuery(api.territories.getActive);

  useEffect(() => {
    const getUserLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    };

    getUserLocation();
  }, []);

  const filteredPulses = selectedFilter
    ? livePulses?.filter((pulse) => pulse.mood === selectedFilter)
    : livePulses;

  const handlePulsePress = (pulse: any) => {
    // Check if there's a room for this pulse location/mood
    router.push('/(modals)/room');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        customMapStyle={darkMapStyle}
      >
        {/* Render territory circles */}
        {territories?.map((territory) => (
          <Circle
            key={territory._id}
            center={{
              latitude: territory.lat,
              longitude: territory.lon,
            }}
            radius={50000} // 50km
            fillColor={territory.dominantColor + '30'}
            strokeColor={territory.dominantColor}
            strokeWidth={2}
          />
        ))}

        {/* Render individual pulses */}
        {filteredPulses?.map((pulse) => (
          <Marker
            key={pulse._id}
            coordinate={{
              latitude: pulse.lat,
              longitude: pulse.lon,
            }}
            onPress={() => handlePulsePress(pulse)}
          >
            <View style={styles.pulseMarker}>
              <PulseCircle color={pulse.color} size={30} duration={800} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{livePulses?.length || 0}</Text>
          <Text style={styles.statLabel}>Live Pulses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{territories?.length || 0}</Text>
          <Text style={styles.statLabel}>Active Territories</Text>
        </View>
      </View>

      {/* Mood filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !selectedFilter && styles.filterButtonActive]}
          onPress={() => setSelectedFilter(null)}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'calm' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter(selectedFilter === 'calm' ? null : 'calm')}
        >
          <Text style={styles.filterText}>🌊 Calm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'excited' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter(selectedFilter === 'excited' ? null : 'excited')}
        >
          <Text style={styles.filterText}>✨ Excited</Text>
        </TouchableOpacity>
      </View>

      {/* Recenter button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={async () => {
          const location = await getCurrentLocation();
          if (location) {
            setRegion({
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            });
          }
        }}
      >
        <Text style={styles.recenterText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  statsOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.backgroundSecondary + 'E6',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  filterButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterText: {
    fontSize: 24,
  },
  pulseMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


