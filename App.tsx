import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

import { CartProvider } from './src/services/CartContext';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import OrderSummaryScreen from './src/screens/OrderSummaryScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import RestaurantSelectionScreen from './src/screens/RestaurantSelectionScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';

export type RootStackParamList = {
  Auth: undefined;
  RestaurantSelect: undefined;
  Menu: { restaurant?: any } | undefined;
  Cart: undefined;
  OrderSummary: undefined;
  Orders: undefined;
  Profile: undefined;
  OrderTracking: { order: any } | undefined;
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
        onBack={undefined}
        onOpenProfile={() => navigation.navigate('Profile')}
        onSelectRestaurant={(restaurant: any) => {
          navigation.navigate('Menu', { restaurant } as any);
        }}
      />
    );
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
        onRequestLocationPick={undefined as any}
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

  const AuthWrapper = () => {
    return <AuthScreen onSignIn={handleSignedIn} />;
  };

  if (initializing) {
    return (
      <CartProvider>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          {user ? (
            <Stack.Navigator
              initialRouteName="RestaurantSelect"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="RestaurantSelect" component={RestaurantSelectWrapper} />
              <Stack.Screen name="Menu" component={MenuWrapper} />
              <Stack.Screen name="Cart" component={CartWrapper} />
              <Stack.Screen name="OrderSummary" component={OrderSummaryWrapper} />
              <Stack.Screen name="Orders" component={OrdersWrapper} />
              <Stack.Screen name="Profile" component={ProfileWrapper} />
              <Stack.Screen name="OrderTracking" component={OrderTrackingWrapper} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthWrapper} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </CartProvider>
  );
}

export default App;
