/* eslint-env jest */

// Global Jest setup for React Native app: mock native modules that are not available in Jest environment.

// Mock Google Signin to avoid native module errors in tests.
jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          photo: null,
        },
      }),
      signOut: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock Firebase Auth to avoid native module usage during tests.
jest.mock('@react-native-firebase/auth', () => {
  const onAuthStateChanged = jest.fn(callback => {
    // Simulate "not signed in" by default.
    if (callback) {
      callback(null);
    }
    return jest.fn(); // unsubscribe
  });

  const signInWithPhoneNumber = jest.fn(() =>
    Promise.resolve({ verificationId: 'test-verification-id' }),
  );

  const PhoneAuthProvider = {
    credential: jest.fn(() => ({ providerId: 'phone', token: 'test', secret: 'secret' })),
  };

  const currentUser = {
    uid: 'test-user-id',
    linkWithCredential: jest.fn(() => Promise.resolve()),
  };

  const authFn = () => ({
    onAuthStateChanged,
    signInWithPhoneNumber,
    currentUser,
  });

  authFn.PhoneAuthProvider = PhoneAuthProvider;

  return authFn;
});

// Optionally mock other native-heavy modules used in the app so tests don't fail on import.
jest.mock('react-native-razorpay', () => ({
  open: jest.fn(() => Promise.resolve({ razorpay_payment_id: 'test_payment_id' })),
}));

jest.mock('@react-native-firebase/app', () => ({}));

// Mock react-native-maps to a simple View-based implementation so imports succeed in tests.
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = props => <View {...props} />;
  const MockMarker = props => <View {...props} />;

  MockMapView.Marker = MockMarker;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

jest.mock('@react-native-firebase/firestore', () => {
  const collectionMock = jest.fn(() => ({
    doc: jest.fn(() => ({
      collection: collectionMock,
      onSnapshot: jest.fn(),
      set: jest.fn(),
    })),
    add: jest.fn(),
    onSnapshot: jest.fn(),
  }));

  const firestore = () => ({
    collection: collectionMock,
    FieldValue: { serverTimestamp: jest.fn() },
  });

  firestore.FieldValue = { serverTimestamp: jest.fn() };

  return firestore;
});
