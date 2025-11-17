import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { firestore } from '../services/firebase';
import { colors } from '../theme';
import { PrimaryButton, SecondaryButton, IconBackButton } from '../components/Buttons';

const ProfileScreen = ({ user, onBack, onViewOrders, onRequestLocationPick }) => {
  const [userDoc, setUserDoc] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [locating, setLocating] = useState(false);

  const [phoneInput, setPhoneInput] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoadingAddresses(false);
      return;
    }

    const userRef = firestore().collection('users').doc(user.id);

    const unsubUser = userRef.onSnapshot(
      snapshot => {
        setUserDoc(snapshot.exists ? snapshot.data() : null);
      },
      err => {
        console.error('Error loading user doc', err);
      },
    );

    const addrRef = userRef.collection('addresses');
    const unsubAddr = addrRef.onSnapshot(
      snapshot => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(docs);
        setLoadingAddresses(false);
      },
      err => {
        console.error('Error loading addresses', err);
        setLoadingAddresses(false);
      },
    );

    return () => {
      unsubUser();
      unsubAddr();
    };
  }, [user?.id]);

  useEffect(() => {
    if (userDoc?.phoneNumber && !phoneInput) {
      const stored = String(userDoc.phoneNumber);
      // If stored in E.164 as +91XXXXXXXXXX, prefill only the 10-digit local part
      if (stored.startsWith('+91') && stored.length > 3) {
        setPhoneInput(stored.slice(3));
      } else {
        setPhoneInput(stored);
      }
    }
  }, [userDoc?.phoneNumber, phoneInput]);

  const handleLogout = async () => {
    try {
      // Best-effort sign-out from Google + Firebase Auth
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await GoogleSignin.signOut();
      } catch (e) {
        // ignore if GoogleSignin is not available or fails
      }
      await auth().signOut();
    } catch (error) {
      console.error('Logout error', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in to save addresses.');
      return;
    }
    const label = newAddressLabel.trim();
    const line = newAddressLine.trim();
    if (!line) {
      Alert.alert('Address required', 'Please enter an address.');
      return;
    }

    try {
      setSavingAddress(true);
      await firestore()
        .collection('users')
        .doc(user.id)
        .collection('addresses')
        .add({
          label: label || 'Home',
          address: line,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setNewAddressLabel('');
      setNewAddressLine('');
    } catch (error) {
      console.error('Error saving address', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in to save addresses.');
      return;
    }
    if (!onRequestLocationPick) {
      Alert.alert('Not supported', 'Location picker is not available.');
      return;
    }

    setLocating(true);
    onRequestLocationPick(({ latitude, longitude, address }) => {
      setLocating(false);
      setNewAddressLabel('Current location');
      setNewAddressLine(address);
      // You could call handleSaveAddress() here to auto-save if desired.
    });
  };

  const handleSendOtp = async () => {
    // Expect only 10-digit Indian mobile, auto-prefix +91 for Firebase
    const raw = phoneInput.trim();
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      Alert.alert('Phone required', 'Please enter your 10-digit phone number.');
      return;
    }
    if (digitsOnly.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a 10-digit Indian mobile number.');
      return;
    }
    const phone = `+91${digitsOnly}`;
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in to verify your phone number.');
      return;
    }

    try {
      setSendingOtp(true);
      // Send OTP using signInWithPhoneNumber and keep the verificationId to
      // build a credential later for linking.
      const confirmation = await auth().signInWithPhoneNumber(phone);
      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
      setIsEditingPhone(true);
      Alert.alert('OTP sent', 'We have sent an OTP to your phone.');
    } catch (error) {
      console.error('Error sending OTP', error);
      Alert.alert('Error', 'Failed to send OTP. Please check the number and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId) {
      Alert.alert('No OTP request', 'Please request an OTP first.');
      return;
    }
    if (!otpCode.trim()) {
      Alert.alert('Code required', 'Please enter the OTP code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      const credential = auth.PhoneAuthProvider.credential(
        verificationId,
        otpCode.trim(),
      );
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Link phone credential to the existing Google account
      await currentUser.linkWithCredential(credential);

      // Persist phone number into Firestore user document
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .set(
          {
            phoneNumber: `+91${phoneInput.trim().replace(/\D/g, '')}`,
            phoneVerifiedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      Alert.alert('Phone verified', 'Your phone number has been verified and saved.');
      setVerificationId(null);
      setOtpCode('');
      setOtpSent(false);
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Error verifying OTP', error);
      Alert.alert(
        'Verification failed',
        'Could not verify the OTP. Please check the code and try again.',
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleEditCurrentPhone = () => {
    // Allow editing current input again (used when OTP sent but number was wrong)
    setOtpSent(false);
    setVerificationId(null);
    setOtpCode('');
  };

  const handleStartPhoneEditFromProfile = () => {
    // Start editing from an already-verified phone number
    const stored = userDoc?.phoneNumber ? String(userDoc.phoneNumber) : '';
    if (stored.startsWith('+91') && stored.length > 3) {
      setPhoneInput(stored.slice(3));
    } else {
      setPhoneInput(stored);
    }
    setIsEditingPhone(true);
    setOtpSent(false);
    setVerificationId(null);
    setOtpCode('');
  };

  const renderAddressList = () => {
    if (loadingAddresses) {
      return (
        <View style={styles.sectionInnerCenter}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (!addresses.length) {
      return <Text style={styles.mutedText}>No addresses saved yet.</Text>;
    }

    return addresses.map(addr => (
      <View key={addr.id} style={styles.addressCard}>
        <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
        <Text style={styles.addressText}>{addr.address}</Text>
      </View>
    ));
  };

  const avatarUrl = user?.avatarUrl || userDoc?.avatarUrl;
  const displayName = user?.name || userDoc?.name || 'User';
  const email = user?.email || userDoc?.email;
  const phoneFromDoc = userDoc?.phoneNumber;

  const showVerifiedPhoneView = !!phoneFromDoc && !isEditingPhone;
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
        {onBack && <IconBackButton onPress={onBack} />}
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 64 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarPlaceholderText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName}</Text>
              {email ? <Text style={styles.email}>{email}</Text> : null}
            </View>
          </View>
          <View style={styles.profileActionsRow}>
            <SecondaryButton
              title="View orders"
              onPress={onViewOrders}
              style={styles.smallButton}
              textStyle={styles.smallButtonText}
            />
            <SecondaryButton
              title="Logout"
              onPress={handleLogout}
              style={styles.smallButton}
              textStyle={styles.smallButtonText}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phone number</Text>
          {showVerifiedPhoneView ? (
            <>
              <Text style={styles.sectionSubtitle}>
                Your verified phone number.
              </Text>
              <Text style={styles.verifiedText}>{phoneFromDoc}</Text>
              <SecondaryButton
                title="Edit phone number"
                onPress={handleStartPhoneEditFromProfile}
                style={styles.smallButton}
                textStyle={styles.smallButtonText}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionSubtitle}>
                Verify your phone number to make your account more secure.
              </Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={colors.text}
                  keyboardType="phone-pad"
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  editable={!otpSent && !sendingOtp}
                />
              </View>
              {!verificationId ? (
                <PrimaryButton
                  title={sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  onPress={handleSendOtp}
                  loading={sendingOtp}
                  style={styles.primaryButton}
                />
              ) : (
                <>
                  <View style={styles.otpRow}>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="Enter OTP"
                      placeholderTextColor={colors.text}
                      keyboardType="number-pad"
                      value={otpCode}
                      onChangeText={setOtpCode}
                    />
                    <PrimaryButton
                      title={verifyingOtp ? 'Verifying...' : 'Verify'}
                      onPress={handleVerifyOtp}
                      loading={verifyingOtp}
                      style={[styles.primaryButton, styles.otpButton]}
                    />
                  </View>
                  <View style={styles.otpActionsRow}>
                    <SecondaryButton
                      title="Edit number"
                      onPress={handleEditCurrentPhone}
                      style={styles.smallButton}
                      textStyle={styles.smallButtonText}
                    />
                    <SecondaryButton
                      title="Resend OTP"
                      onPress={handleSendOtp}
                      style={styles.smallButton}
                      textStyle={styles.smallButtonText}
                    />
                  </View>
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Saved addresses</Text>
          {renderAddressList()}

          <View style={styles.addressForm}>
            <Text style={styles.sectionSubtitle}>Add a new address</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Home, Work)"
              placeholderTextColor={colors.text}
              value={newAddressLabel}
              onChangeText={setNewAddressLabel}
            />
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Full address"
              placeholderTextColor={colors.text}
              multiline
              value={newAddressLine}
              onChangeText={setNewAddressLine}
            />
            <SecondaryButton
              title={locating ? 'Getting location...' : 'Use current location'}
              onPress={handleUseCurrentLocation}
              style={[styles.primaryButton, { marginBottom: 4 }]}
              textStyle={styles.smallButtonText}
            />
            <PrimaryButton
              title={savingAddress ? 'Saving...' : 'Save address'}
              onPress={handleSaveAddress}
              loading={savingAddress}
              style={styles.primaryButton}
            />
          </View>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
  profileActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  smallButton: {
    marginRight: 8,
  },
  smallButtonText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: colors.text,
    marginBottom: 8,
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 13,
    color: colors.success,
    marginBottom: 4,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  otpActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  otpInput: {
    flex: 1,
    marginRight: 8,
  },
  otpButton: {
    paddingHorizontal: 16,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryCodeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  sectionInnerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  mutedText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  addressCard: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  addressForm: {
    marginTop: 12,
  },
});

export default ProfileScreen;