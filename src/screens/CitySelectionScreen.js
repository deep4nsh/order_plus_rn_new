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
      'https://amoghavarshaiaskas.in/wp-content/uploads/2024/10/Red-Fort-Complex.jpg',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    subtitle: 'Gateway of India & sea breeze bites',
    image:
      'https://miro.medium.com/v2/resize:fit:1400/1*DTXfmmagnoAxRcUEWdajMw.jpeg',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    subtitle: 'Hawa Mahal & royal treats',
    image:
      'https://res.cloudinary.com/ddjuftfy2/image/upload/f_webp,c_fill,q_auto/memphis/xlarge/1162399525_Hawa%20Mahal.jpg',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    subtitle: 'Garden city snacks & coffee',
    image:
      'https://yometro.com/images/places/bangalore-palace.jpg',
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
