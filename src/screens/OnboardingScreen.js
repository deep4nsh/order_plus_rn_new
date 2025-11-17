import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { PrimaryButton } from '../components/Buttons';

const OnboardingScreen = ({ onContinue }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.illustrationWrapper}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/4393663/pexels-photo-4393663.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
            style={styles.illustration}
          />
        </View>

        <Text style={styles.title}>Welcome to Order Plus</Text>
        <Text style={styles.subtitle}>
          Discover great food in your city, pick a restaurant, and track your delivery in real time.
        </Text>

        <View style={styles.bullets}>
          <Text style={styles.bullet}>• Curated demo restaurants in every city</Text>
          <Text style={styles.bullet}>• Simple checkout with Razorpay demo payments</Text>
          <Text style={styles.bullet}>• Live order status for a complete flow</Text>
        </View>

        <PrimaryButton title="Get started" onPress={onContinue} />
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  illustration: {
    width: '100%',
    height: 220,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
  },
  bullets: {
    marginTop: 16,
    marginBottom: 24,
  },
  bullet: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
});

export default OnboardingScreen;
