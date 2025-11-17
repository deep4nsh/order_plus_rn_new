import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { IconBackButton } from '../components/Buttons';
import { colors } from '../theme';

const steps = ['PAID', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'];

const OrderTrackingScreen = ({ order, onBack }) => {
  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <IconBackButton label="Back" onPress={onBack} />
            <Text style={styles.headerTitle}>Track Order</Text>
            <View style={{ width: 64 }} />
          </View>
          <View style={styles.center}>
            <Text style={styles.errorText}>No order selected.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = (order.status || 'PAID').toUpperCase();

  const defaultRegion = {
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const loc = order.deliveryAddressLocation;
  const region =
    loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
      ? {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : defaultRegion;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconBackButton label="Back" onPress={onBack} />
          <Text style={styles.headerTitle}>
            Order #{order.id.slice(-6).toUpperCase()}
          </Text>
          <View style={{ width: 64 }} />
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order status</Text>
        {steps.map((step, index) => {
          const isDone = steps.indexOf(currentStatus) >= index;
          return (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepDot, isDone && styles.stepDotDone]} />
              <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>{step}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery map</Text>
        <MapView
          style={styles.map}
          initialRegion={region}
          pointerEvents="none"
        >
          <Marker
            coordinate={region}
            title="Delivery location"
            description={order.deliveryAddress || 'Customer address'}
          />
        </MapView>
        <Text style={styles.mapNote}>
          Approximate delivery location based on your selected address.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver</Text>
        <Text style={styles.driverName}>{order.driverName || 'Rahul (Demo Driver)'}</Text>
        <Text style={styles.driverNote}>Arriving soon with your delicious food.</Text>
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
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  stepDotDone: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  stepLabel: {
    fontSize: 14,
    color: '#777',
  },
  stepLabelDone: {
    color: '#333',
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 4,
  },
  mapNote: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
  },
  driverNote: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
});

export default OrderTrackingScreen;
