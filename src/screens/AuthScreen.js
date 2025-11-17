import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { firestore } from '../services/firebase';
import { colors } from '../theme';

const GOOGLE_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';

const AuthScreen = ({ onSignIn }) => {
  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;

      const userData = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        avatarUrl: firebaseUser.photoURL || undefined,
      };

      if (userData.email) {
        await firestore()
          .collection('users')
          .doc(firebaseUser.uid)
          .set(
            {
              name: userData.name,
              email: userData.email,
              avatarUrl: userData.avatarUrl || null,
              lastLoginAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      }

      onSignIn(userData);
    } catch (error) {
      console.error('Google sign-in error', error);
      Alert.alert('Sign-in failed', 'Unable to sign in with Google. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.logo}>Order Plus</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <Text style={styles.helperText}>
        This demo uses a mocked Google account so you can focus on the ordering flow.
      </Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleSignIn}>
        <View style={styles.googleContent}>
          <View style={styles.googleIconWrapper}>
            <Image source={{ uri: GOOGLE_LOGO }} style={styles.googleIcon} />
          </View>
          <Text style={styles.googleText}>Continue with Google</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() =>
          onSignIn({ id: 'guest', name: 'Guest', email: 'guest@example.com' })
        }>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    color: colors.text,
  },
  helperText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  googleButton: {
    marginTop: 32,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  googleIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skipButton: {
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
