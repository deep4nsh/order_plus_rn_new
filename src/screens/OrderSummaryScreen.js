import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';

import { useCart } from '../services/CartContext';
import { firestore } from '../services/firebase';
import { PrimaryButton, IconBackButton } from '../components/Buttons';
import { colors } from '../theme';

const OrderSummaryScreen = ({ user, onBackToMenu, onViewOrders }) => {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const hasItems = items && items.length > 0;

  useEffect(() => {
    if (!user?.id) {
      setLoadingAddresses(false);
      return;
    }

    const ref = firestore()
      .collection('users')
      .doc(user.id)
      .collection('addresses');

    const unsubscribe = ref.onSnapshot(
      snapshot => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(docs);
        if (!selectedAddressId && docs.length) {
          setSelectedAddressId(docs[0].id);
        }
        setLoadingAddresses(false);
      },
      err => {
        console.error('Error loading addresses for order summary', err);
        setLoadingAddresses(false);
      },
    );

    return unsubscribe;
  }, [user?.id, selectedAddressId]);

  const handlePayAndOrder = () => {
    if (!hasItems) {
      Alert.alert('Cart is empty', 'Please add some items before ordering.');
      return;
    }

    if (user?.id && addresses.length > 0 && !selectedAddressId) {
      Alert.alert('Select address', 'Please select a delivery address before paying.');
      return;
    }

    setIsSubmitting(true);

    const options = {
      description: 'Food order from Order Plus',
      image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=200',
      currency: 'INR',
      key: 'rzp_test_RaOVAroS2KoIEp', // Razorpay TEST key
      amount: Math.round(Number(totalPrice) * 100),
      name: 'Order Plus Demo',
      prefill: {
        email: user?.email || 'test.user@example.com',
        contact: '9999999999',
        name: user?.name || 'Demo User',
      },
      theme: { color: '#ff6b6b' },
    };

    RazorpayCheckout.open(options)
      .then(data => {
        placeOrder(data.razorpay_payment_id);
      })
      .catch(error => {
        setIsSubmitting(false);
        Alert.alert(
          'Payment Error',
          `Code: ${error.code}\nDescription: ${error.description}`,
        );
      });
  };

  const placeOrder = async (paymentId) => {
    const selectedAddress = selectedAddressId
      ? addresses.find(a => a.id === selectedAddressId)
      : null;

    try {
      await firestore().collection('orders').add({
        items,
        totalPrice,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'PAID',
        paymentId: paymentId || null,
        userId: user?.id || null,
        userEmail: user?.email || null,
        userName: user?.name || null,
        driverName: 'Rahul (Demo Driver)',
        deliveryAddressId: selectedAddress?.id || null,
        deliveryAddressLabel: selectedAddress?.label || null,
        deliveryAddress: selectedAddress?.address || null,
        deliveryAddressLocation: selectedAddress?.location || null,
      });

      setIsSubmitting(false);
      Alert.alert('Order Placed', 'Your order has been submitted successfully.', [
        {
          text: 'View Orders',
          onPress: () => {
            clearCart();
            onViewOrders?.();
          },
        },
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            onBackToMenu();
          },
        },
      ]);
    } catch (error) {
      console.error('Error placing order:', error);
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        'Something went wrong while saving your order. Please try again.',
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.itemName}>
          {item.name} (x{item.quantity})
        </Text>
        {item.addons && item.addons.length ? (
          <Text style={styles.itemAddons} numberOfLines={2} ellipsizeMode="tail">
            {item.addons
              .filter(a => !!a.label)
              .map(a => a.label)
              .join(' \u00b7 ')}
          </Text>
        ) : null}
      </View>
      <Text style={styles.itemPrice}>
        ₹{(Number(item.price) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
        <IconBackButton label="Back" onPress={onBackToMenu} />
        <Text style={styles.headerTitle}>Review your order</Text>
        <View style={{ width: 64 }} />
      </View>
      {hasItems ? (
        <>
          {user?.id && (
            <View style={styles.addressSection}>
              <Text style={styles.addressSectionTitle}>Delivery address</Text>
              {loadingAddresses ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : addresses.length ? (
                addresses.map(addr => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addressItem,
                      selectedAddressId === addr.id && styles.addressItemSelected,
                    ]}
                    onPress={() => setSelectedAddressId(addr.id)}
                  >
                    <View style={styles.addressRadioOuter}>
                      {selectedAddressId === addr.id && (
                        <View style={styles.addressRadioInner} />
                      )}
                    </View>
                    <View style={styles.addressTextContainer}>
                      <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
                      <Text style={styles.addressText}>{addr.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.addressHint}>
                  No saved addresses found. Add one from your Profile screen.
                </Text>
              )}
            </View>
          )}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              <Text style={styles.totalText}>Total: ₹{totalPrice.toFixed(2)}</Text>
            }
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        {isSubmitting ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <PrimaryButton
            title="Pay & place order"
            onPress={handlePayAndOrder}
          />
        )}
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addressSection: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  addressItemSelected: {
    backgroundColor: '#f3f6ff',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  addressRadioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  addressHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 16,
    flexShrink: 1,
  },
  itemAddons: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  buttonContainer: {
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OrderSummaryScreen;
