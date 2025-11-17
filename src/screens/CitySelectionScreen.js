import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

const CITIES = [
  {
    id: 'delhi',
    name: 'Delhi',
    subtitle: 'India Gate & Old Delhi flavours',
    image:
      'https://images.pexels.com/photos/14018661/pexels-photo-14018661.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    subtitle: 'Gateway of India & sea breeze bites',
    image:
      'https://images.pexels.com/photos/15543919/pexels-photo-15543919.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    subtitle: 'Hawa Mahal & royal treats',
    image:
      'https://images.pexels.com/photos/17967296/pexels-photo-17967296.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    subtitle: 'Garden city snacks & coffee',
    image:
      'https://images.pexels.com/photos/414660/pexels-photo-414660.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const CitySelectionScreen = ({ onSelectCity }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onSelectCity(item)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.helper}>Tap to use this city (same demo restaurants everywhere)</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose your city</Text>
        <Text style={styles.description}>
          For this sample app, every city will show the same demo restaurants. We just use the
          city to personalise the experience.
        </Text>

        <FlatList
          data={CITIES}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  listContent: {
    marginTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default CitySelectionScreen;
