import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { IconBackButton, PrimaryButton } from '../components/Buttons';

// HTTP Geocoding key; can be same as the one you use in ProfileScreen
const GOOGLE_MAPS_GEOCODE_KEY = 'AIzaSyCUQ30kB4C3TESGp1ZrWgkSo_6cXeFBOD8';

const LocationPickerScreen = ({ onBack, onLocationPicked }) => {
  const [initialRegion, setInitialRegion] = useState(null);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialRegion(region);
        setSelectedCoord({ latitude, longitude });
        setLoading(false);
      },
      error => {
        console.warn('Error getting current position for picker', error);
        // Fallback to a default region (e.g. Delhi) so user can still pick
        const region = {
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setInitialRegion(region);
        setSelectedCoord({ latitude: region.latitude, longitude: region.longitude });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, []);

  const handleConfirm = async () => {
    if (!selectedCoord) return;
    try {
      setSaving(true);
      const { latitude, longitude } = selectedCoord;
      const url =
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_GEOCODE_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const address = data?.results?.[0]?.formatted_address;

      if (!address) {
        Alert.alert('Location error', 'Could not convert your selected place to an address.');
        setSaving(false);
        return;
      }

      onLocationPicked({
        latitude,
        longitude,
        address,
      });
    } catch (e) {
      console.error('Error reverse-geocoding picked location', e);
      Alert.alert('Error', 'Failed to get address for this location.');
      setSaving(false);
    }
  };

  if (loading || !initialRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
        <IconBackButton label="Back" onPress={onBack} />
        <Text style={styles.headerTitle}>Pick delivery location</Text>
        <View style={{ width: 64 }} />
      </View>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={e => setSelectedCoord(e.nativeEvent.coordinate)}
      >
        {selectedCoord && (
          <Marker
            coordinate={selectedCoord}
            draggable
            onDragEnd={e => setSelectedCoord(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>
      <View style={styles.footer}>
        <PrimaryButton
          title={saving ? 'Saving...' : 'Use this location'}
          onPress={handleConfirm}
          loading={saving}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textMuted,
  },
});

export default LocationPickerScreen;
