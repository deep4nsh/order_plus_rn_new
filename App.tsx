import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CartProvider } from './src/services/CartContext';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import OrderSummaryScreen from './src/screens/OrderSummaryScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import RestaurantSelectionScreen from './src/screens/RestaurantSelectionScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CitySelectionScreen from './src/screens/CitySelectionScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  CitySelect: { mode?: 'onboarding' | 'edit' } | undefined;
  Auth: undefined;
  RestaurantSelect: undefined;
  Menu: { restaurant?: any } | undefined;
  Cart: undefined;
  OrderSummary: undefined;
  Orders: undefined;
  Profile: undefined;
  OrderTracking: { order: any } | undefined;
  LocationPicker:
    | {
        onLocationPicked?: (loc: {
          latitude: number;
          longitude: number;
          address: string;
        }) => void;
      }
    | undefined;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '216126386602-i286c0imsnb9vg29sdptbv28obbvs808.apps.googleusercontent.com',
    });

    const unsubscribe = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || undefined,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const storedFlag = await AsyncStorage.getItem('hasOnboarded');
        const storedCity = await AsyncStorage.getItem('selectedCity');
        setHasOnboarded(storedFlag === 'true');
        if (storedCity) {
          try {
            setSelectedCity(JSON.parse(storedCity));
          } catch {
            setSelectedCity(null);
          }
        }
      } catch (e) {
        console.warn('Failed to load onboarding state', e);
        setHasOnboarded(false);
      }
    };

    loadOnboardingState();
  }, []);

  const handleSignedIn = (u: { id: string; name: string; email: string; avatarUrl?: string }) => {
    // Keep local state in sync immediately after AuthScreen login
    setUser({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
    });
  };

  const MenuWrapper = (props: any) => {
    return <MenuScreen {...props} user={user} />;
  };

  const RestaurantSelectWrapper = ({ navigation }: any) => {
    return (
      <RestaurantSelectionScreen
        user={user}
        city={selectedCity}
        onBack={undefined}
        onOpenProfile={() => navigation.navigate('Profile')}
        onEditCity={() => navigation.navigate('CitySelect', { mode: 'edit' } as any)}
        onSelectRestaurant={(restaurant: any) => {
          navigation.navigate('Menu', { restaurant } as any);
        }}
      />
    );
  };

  const SplashWrapper = ({ navigation }: any) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigation.replace('Onboarding');
      }, 1500);
      return () => clearTimeout(timer);
    }, [navigation]);

    return <SplashScreen />;
  };

  const OnboardingWrapper = ({ navigation }: any) => {
    return (
      <OnboardingScreen
        onContinue={() => {
          navigation.replace('CitySelect');
        }}
      />
    );
  };

  const CitySelectWrapper = ({ navigation, route }: any) => {
    const mode: 'onboarding' | 'edit' = route?.params?.mode ?? 'onboarding';

    const handleCitySelected = async (city: any) => {
      try {
        await AsyncStorage.setItem('hasOnboarded', 'true');
        await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      } catch (e) {
        console.warn('Failed to persist onboarding state', e);
      }
      setHasOnboarded(true);
      setSelectedCity(city);

      if (mode === 'onboarding') {
        // After first-time city selection, go to auth if user isn't signed in yet,
        // otherwise go straight to restaurant selection.
        if (user) {
          navigation.reset({ index: 0, routes: [{ name: 'RestaurantSelect' as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' as any }] });
        }
      } else {
        // Edit mode: just go back to the previous screen (e.g. RestaurantSelect).
        navigation.goBack();
      }
    };

    return <CitySelectionScreen onSelectCity={handleCitySelected} />;
  };

  const CartWrapper = ({ navigation }: any) => {
    return (
      <CartScreen
        onBackToMenu={() => navigation.goBack()}
        onProceedToSummary={() => navigation.navigate('OrderSummary')}
      />
    );
  };

  const OrderSummaryWrapper = ({ navigation }: any) => {
    return (
      <OrderSummaryScreen
        user={user}
        onBackToMenu={() => navigation.goBack()}
        onViewOrders={() => navigation.navigate('Orders')}
      />
    );
  };

  const OrdersWrapper = ({ navigation }: any) => {
    return (
      <OrdersScreen
        user={user}
        onBack={() => navigation.goBack()}
        onTrackOrder={(order: any) => navigation.navigate('OrderTracking', { order })}
      />
    );
  };

  const ProfileWrapper = ({ navigation }: any) => {
    return (
      <ProfileScreen
        user={user}
        onBack={() => navigation.goBack()}
        onViewOrders={() => navigation.navigate('Orders')}
        onRequestLocationPick={onPicked =>
          navigation.navigate('LocationPicker', {
            onLocationPicked: onPicked,
          } as any)
        }
      />
    );
  };

  const OrderTrackingWrapper = ({ navigation, route }: any) => {
    const order = route?.params?.order;
    return (
      <OrderTrackingScreen
        order={order}
        onBack={() => navigation.goBack()}
      />
    );
  };

  const LocationPickerWrapper = ({ navigation, route }: any) => {
    const onLocationPickedFromProfile = route?.params?.onLocationPicked;

    return (
      <LocationPickerScreen
        onBack={() => navigation.goBack()}
        onLocationPicked={loc => {
          if (onLocationPickedFromProfile) {
            onLocationPickedFromProfile(loc);
          }
          navigation.goBack();
        }}
      />
    );
  };

  const AuthWrapper = () => {
    return <AuthScreen onSignIn={handleSignedIn} />;
  };

  // While we are loading Firebase auth or onboarding state, show the splash screen.
  if (initializing || hasOnboarded === null) {
    return (
      <CartProvider>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <SplashScreen />
        </SafeAreaProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          {!hasOnboarded ? (
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Splash" component={SplashWrapper} />
              <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
              <Stack.Screen name="CitySelect" component={CitySelectWrapper} />
              <Stack.Screen name="Auth" component={AuthWrapper} />
            </Stack.Navigator>
          ) : user ? (
            <Stack.Navigator
              initialRouteName="RestaurantSelect"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="RestaurantSelect" component={RestaurantSelectWrapper} />
              <Stack.Screen name="CitySelect" component={CitySelectWrapper} />
              <Stack.Screen name="Menu" component={MenuWrapper} />
              <Stack.Screen name="Cart" component={CartWrapper} />
              <Stack.Screen name="OrderSummary" component={OrderSummaryWrapper} />
              <Stack.Screen name="Orders" component={OrdersWrapper} />
              <Stack.Screen name="Profile" component={ProfileWrapper} />
              <Stack.Screen name="OrderTracking" component={OrderTrackingWrapper} />
              <Stack.Screen name="LocationPicker" component={LocationPickerWrapper} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthWrapper} />
              <Stack.Screen name="CitySelect" component={CitySelectWrapper} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </CartProvider>
  );
}

export default App;
