import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '../services/firebase';
import { colors } from '../theme';

const OrdersScreen = ({ user, onBack, onTrackOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const ref = firestore().collection('orders');

    const unsubscribe = ref.onSnapshot(
      snapshot => {
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (user?.id) {
          docs = docs.filter(o => o.userId === user.id);
        } else if (user?.email) {
          docs = docs.filter(o => o.userEmail === user.email);
        }

        docs.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOrders(docs);
        setLoading(false);
      },
      err => {
        console.error('Error loading orders', err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.id, user?.email]);

  const renderStatusBadge = status => {
    const s = (status || 'PENDING').toUpperCase();
    let color = '#999';
    if (s === 'PAID') color = '#2e7d32';
    if (s === 'PREPARING') color = '#ff9800';
    if (s === 'ON_THE_WAY') color = '#1976d2';
    if (s === 'DELIVERED') color = '#4caf50';

    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '22', borderColor: color }]}>
        <Text style={[styles.statusText, { color }]}>{s}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const createdAt = item.createdAt?.toDate?.() ?? null;
    const dateLabel = createdAt ? createdAt.toLocaleString() : 'Pending';

    const shortId = item.id.slice(-6).toUpperCase();
    const isExpanded = expandedOrderId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() =>
          setExpandedOrderId((prev) => (prev === item.id ? null : item.id))
        }
      >
        <View style={styles.cardRow}>
          <Text style={styles.orderId}>Order #{shortId}</Text>
          {renderStatusBadge(item.status)}
        </View>
        <Text style={styles.dateText}>{dateLabel}</Text>
        <Text style={styles.totalText}>Total: ₹{Number(item.totalPrice || 0).toFixed(2)}</Text>
        <Text style={styles.itemsText}>{item.items?.length || 0} items</Text>

        {isExpanded && item.items?.length ? (
          <View style={styles.itemsDetailsSection}>
            {item.items.map((line, idx) => (
              <View key={idx} style={styles.lineItemRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.lineItemName}>
                    {line.name} (x{line.quantity || 1})
                  </Text>
                  {line.addons && line.addons.length ? (
                    <Text
                      style={styles.lineItemAddons}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {line.addons
                        .filter((a) => !!a.label)
                        .map((a) => a.label)
                        .join(' · ')}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.lineItemPrice}>
                  ₹{(Number(line.price || 0) * (line.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.statusHint}>
            Tap to view items · {item.driverName || 'Demo driver'}
          </Text>
          <TouchableOpacity onPress={() => onTrackOrder(item)}>
            <Text style={styles.trackText}>Track order</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load orders: {error.message}</Text>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Orders</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={styles.emptyText}>No orders yet. Place your first order from the menu!</Text>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <View style={{ width: 50 }} />
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#777',
  },
  totalText: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
  },
  itemsText: {
    marginTop: 2,
    fontSize: 13,
    color: '#555',
  },
  itemsDetailsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  lineItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  lineItemAddons: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  lineItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  trackText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default OrdersScreen;
