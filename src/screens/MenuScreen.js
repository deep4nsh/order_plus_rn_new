import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '../services/firebase';
import { useCart } from '../services/CartContext';
import { colors } from '../theme';

const DEFAULT_MENU_ITEMS = [
  {
    name: 'Margherita Pizza',
    description: 'Classic cheese & tomato pizza with fresh basil.',
    price: 299,
    imageUrl:
      'https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Pizza',
    isAvailable: true,
  },
  {
    name: 'Veggie Burger',
    description: 'Grilled veggie patty with lettuce, tomato & cheese.',
    price: 199,
    imageUrl:
      'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Burger',
    isAvailable: true,
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with a side of ketchup.',
    price: 99,
    imageUrl:
      'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Sides',
    isAvailable: true,
  },
  {
    name: 'Cold Coffee',
    description: 'Iced coffee with milk and a touch of sugar.',
    price: 129,
    imageUrl:
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Beverage',
    isAvailable: true,
  },
  {
    name: 'Paneer Tikka',
    description: 'Char-grilled cottage cheese with peppers & spices.',
    price: 249,
    imageUrl:
      'https://images.pexels.com/photos/7259900/pexels-photo-7259900.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Starters',
    isAvailable: true,
  },
  {
    name: 'White Sauce Pasta',
    description: 'Creamy penne pasta tossed with herbs & veggies.',
    price: 279,
    imageUrl:
      'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Pasta',
    isAvailable: true,
  },
  {
    name: 'Grilled Sandwich',
    description: 'Loaded veggie sandwich with cheese, grilled to perfection.',
    price: 159,
    imageUrl:
      'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Snacks',
    isAvailable: true,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Warm gooey brownie topped with chocolate sauce.',
    price: 149,
    imageUrl:
      'https://images.pexels.com/photos/4109994/pexels-photo-4109994.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Dessert',
    isAvailable: true,
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Refreshing lemon soda, sweet or salted.',
    price: 79,
    imageUrl:
      'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Beverage',
    isAvailable: true,
  },
];

const MenuScreen = ({ navigation, route, user }) => {
  const { addItemToCart, totalItems } = useCart();
  const restaurant = route?.params?.restaurant || null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [customCrust, setCustomCrust] = useState('classic');
  const [customCheese, setCustomCheese] = useState('regular');
  const [burgerExtraPatty, setBurgerExtraPatty] = useState(false);
  const [friesSize, setFriesSize] = useState('regular'); // regular | large
  const [drinkSize, setDrinkSize] = useState('regular'); // regular | large

  const openItemCustomizer = (item) => {
    setSelectedItem(item);
    setCustomCrust('classic');
    setCustomCheese('regular');
    setBurgerExtraPatty(false);
    setFriesSize('regular');
    setDrinkSize('regular');
  };

  const closeItemCustomizer = () => {
    setSelectedItem(null);
  };

  const getPizzaExtrasPrice = () => {
    let extra = 0;
    if (customCrust === 'cheese_burst') extra += 60;
    if (customCrust === 'thin') extra += 40;
    if (customCheese === 'extra') extra += 40;
    return extra;
  };

  const getExtrasTotalForItem = (item) => {
    if (!item) return 0;
    if (item.category === 'Pizza') {
      return getPizzaExtrasPrice();
    }
    if (item.category === 'Burger') {
      return burgerExtraPatty ? 50 : 0;
    }
    if (item.category === 'Sides' && /fries/i.test(item.name || '')) {
      return friesSize === 'large' ? 30 : 0;
    }
    if (item.category === 'Beverage') {
      return drinkSize === 'large' ? 25 : 0;
    }
    return 0;
  };

  const handleAddSelectedToCart = () => {
    if (!selectedItem) return;
    const basePrice = Number(selectedItem.price) || 0;

    if (selectedItem.category === 'Pizza') {
      const extras = getExtrasTotalForItem(selectedItem);
      const unitPrice = basePrice + extras;

      const crustLabel =
        customCrust === 'cheese_burst'
          ? 'Cheese Burst Crust (+₹60)'
          : customCrust === 'thin'
          ? 'Thin Crust (+₹40)'
          : 'Classic Hand Tossed';

      const cheeseLabel =
        customCheese === 'extra'
          ? 'Extra Cheese (+₹40)'
          : 'Regular Cheese';

      const cartId = `${selectedItem.id || selectedItem.name}-crust:${customCrust}-cheese:${customCheese}`;

      addItemToCart({
        id: cartId,
        menuId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        basePrice,
        price: unitPrice,
        addons: [
          {
            type: 'Crust',
            label: crustLabel,
            priceDiff:
              customCrust === 'cheese_burst' ? 60 : customCrust === 'thin' ? 40 : 0,
          },
          {
            type: 'Cheese',
            label: cheeseLabel,
            priceDiff: customCheese === 'extra' ? 40 : 0,
          },
        ],
      });
    } else if (selectedItem.category === 'Burger') {
      const extras = getExtrasTotalForItem(selectedItem);
      const unitPrice = basePrice + extras;

      const addons = [];
      if (burgerExtraPatty) {
        addons.push({
          type: 'Burger Extra',
          label: 'Extra Patty (+₹50)',
          priceDiff: 50,
        });
      }

      const cartId = `${selectedItem.id || selectedItem.name}-extraPatty:${
        burgerExtraPatty ? 'yes' : 'no'
      }`;

      addItemToCart({
        id: cartId,
        menuId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        basePrice,
        price: unitPrice,
        addons,
      });
    } else if (selectedItem.category === 'Sides' && /fries/i.test(selectedItem.name || '')) {
      const extras = getExtrasTotalForItem(selectedItem);
      const unitPrice = basePrice + extras;

      const sizeLabel =
        friesSize === 'large' ? 'Large Fries (+₹30)' : 'Regular Fries';

      const addons = [
        {
          type: 'Portion',
          label: sizeLabel,
          priceDiff: friesSize === 'large' ? 30 : 0,
        },
      ];

      const cartId = `${selectedItem.id || selectedItem.name}-friesSize:${friesSize}`;

      addItemToCart({
        id: cartId,
        menuId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        basePrice,
        price: unitPrice,
        addons,
      });
    } else if (selectedItem.category === 'Beverage') {
      const extras = getExtrasTotalForItem(selectedItem);
      const unitPrice = basePrice + extras;

      const sizeLabel =
        drinkSize === 'large' ? 'Large Drink (+₹25)' : 'Regular Drink';

      const addons = [
        {
          type: 'Drink Size',
          label: sizeLabel,
          priceDiff: drinkSize === 'large' ? 25 : 0,
        },
      ];

      const cartId = `${selectedItem.id || selectedItem.name}-drinkSize:${drinkSize}`;

      addItemToCart({
        id: cartId,
        menuId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        basePrice,
        price: unitPrice,
        addons,
      });
    } else {
      // Other items: no custom addons, just add with base price
      addItemToCart({
        id: selectedItem.id || selectedItem.name,
        menuId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        basePrice,
        price: basePrice,
        addons: [],
      });
    }

    closeItemCustomizer();
  };

  useEffect(() => {
    let unsubscribeMenu;

    const initMenu = async () => {
      try {
        setLoading(true);
        const menuRef = firestore().collection('menu');

        // Ensure default data exists (idempotent: checks by name)
        const snapshot = await menuRef.get();
        const existingNames = new Set(
          snapshot.docs.map(doc => String(doc.data().name || '').trim()),
        );
        if (snapshot.empty || snapshot.size < DEFAULT_MENU_ITEMS.length) {
          await Promise.all(
            DEFAULT_MENU_ITEMS.map(async item => {
              const nameKey = String(item.name || '').trim();
              if (!existingNames.has(nameKey)) {
                await menuRef.add(item);
              }
            }),
          );
        }

        unsubscribeMenu = menuRef.onSnapshot(
          snap => {
            const items = snap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMenuItems(items);
            setLoading(false);
          },
          err => {
            console.error('Error fetching menu:', err);
            setError(err);
            setLoading(false);
          },
        );
      } catch (err) {
        console.error('Error initializing menu:', err);
        setError(err);
        setLoading(false);
      }
    };

    initMenu();

    return () => {
      if (unsubscribeMenu) {
        unsubscribeMenu();
      }
    };
  }, []);
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isCustomisable =
      item.category === 'Pizza' ||
      item.category === 'Burger' ||
      item.category === 'Beverage' ||
      (item.category === 'Sides' && /fries/i.test(item.name || ''));

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => openItemCustomizer(item)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            {isCustomisable && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Customisable</Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text style={styles.itemDescription} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}
          <View style={styles.cardFooter}>
            <Text style={styles.itemPrice}>₹{Number(item.price).toFixed(2)}</Text>
            {isCustomisable && (
              <Text style={styles.customizeText}>Tap to customise</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>{'< Back'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {restaurant?.name || 'Menu'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButton}
            >
              <Text style={styles.cartText}>Cart ({totalItems})</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
        data={menuItems}
        keyExtractor={item => item.id || item.name}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

        <Modal
          visible={!!selectedItem}
          animationType="slide"
          transparent
          onRequestClose={closeItemCustomizer}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {selectedItem && (
                  <>
                    {selectedItem.imageUrl ? (
                      <Image
                        source={{ uri: selectedItem.imageUrl }}
                        style={styles.modalImage}
                      />
                    ) : null}
                    <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                    {selectedItem.description ? (
                      <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                    ) : null}

                    {selectedItem.category === 'Pizza' && (
                      <>
                        <Text style={styles.modalSectionTitle}>Choose crust</Text>
                        <View style={styles.chipRow}>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              customCrust === 'classic' && styles.chipSelected,
                            ]}
                            onPress={() => setCustomCrust('classic')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                customCrust === 'classic' && styles.chipLabelSelected,
                              ]}
                            >
                              Classic
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              customCrust === 'thin' && styles.chipSelected,
                            ]}
                            onPress={() => setCustomCrust('thin')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                customCrust === 'thin' && styles.chipLabelSelected,
                              ]}
                            >
                              Thin (+₹40)
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              customCrust === 'cheese_burst' && styles.chipSelected,
                            ]}
                            onPress={() => setCustomCrust('cheese_burst')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                customCrust === 'cheese_burst' && styles.chipLabelSelected,
                              ]}
                            >
                              Cheese Burst (+₹60)
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSectionTitle}>Cheese</Text>
                        <View style={styles.chipRow}>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              customCheese === 'regular' && styles.chipSelected,
                            ]}
                            onPress={() => setCustomCheese('regular')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                customCheese === 'regular' && styles.chipLabelSelected,
                              ]}
                            >
                              Regular
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              customCheese === 'extra' && styles.chipSelected,
                            ]}
                            onPress={() => setCustomCheese('extra')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                customCheese === 'extra' && styles.chipLabelSelected,
                              ]}
                            >
                              Extra (+₹40)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {selectedItem.category === 'Burger' && (
                      <>
                        <Text style={styles.modalSectionTitle}>Burger extras</Text>
                        <View style={styles.chipRow}>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              !burgerExtraPatty && styles.chipSelected,
                            ]}
                            onPress={() => setBurgerExtraPatty(false)}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                !burgerExtraPatty && styles.chipLabelSelected,
                              ]}
                            >
                              Normal
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              burgerExtraPatty && styles.chipSelected,
                            ]}
                            onPress={() => setBurgerExtraPatty(true)}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                burgerExtraPatty && styles.chipLabelSelected,
                              ]}
                            >
                              Extra Patty (+₹50)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {selectedItem.category === 'Sides' && /fries/i.test(selectedItem.name || '') && (
                      <>
                        <Text style={styles.modalSectionTitle}>Portion size</Text>
                        <View style={styles.chipRow}>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              friesSize === 'regular' && styles.chipSelected,
                            ]}
                            onPress={() => setFriesSize('regular')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                friesSize === 'regular' && styles.chipLabelSelected,
                              ]}
                            >
                              Regular
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              friesSize === 'large' && styles.chipSelected,
                            ]}
                            onPress={() => setFriesSize('large')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                friesSize === 'large' && styles.chipLabelSelected,
                              ]}
                            >
                              Large (+₹30)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {selectedItem.category === 'Beverage' && (
                      <>
                        <Text style={styles.modalSectionTitle}>Drink size</Text>
                        <View style={styles.chipRow}>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              drinkSize === 'regular' && styles.chipSelected,
                            ]}
                            onPress={() => setDrinkSize('regular')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                drinkSize === 'regular' && styles.chipLabelSelected,
                              ]}
                            >
                              Regular
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              drinkSize === 'large' && styles.chipSelected,
                            ]}
                            onPress={() => setDrinkSize('large')}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                drinkSize === 'large' && styles.chipLabelSelected,
                              ]}
                            >
                              Large (+₹25)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceLabel}>Price</Text>
                      <Text style={styles.modalPriceValue}>
                        ₹
                        {selectedItem
                          ? (
                              (Number(selectedItem.price) || 0) +
                              getExtrasTotalForItem(selectedItem)
                            ).toFixed(2)
                          : '0.00'}
                      </Text>
                    </View>

                    <View style={styles.modalButtonsRow}>
                      <TouchableOpacity
                        onPress={closeItemCustomizer}
                        style={[styles.modalButton, styles.modalSecondaryButton]}
                      >
                        <Text style={styles.modalSecondaryText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAddSelectedToCart}
                        style={[styles.modalButton, styles.modalPrimaryButton]}
                      >
                        <Text style={styles.modalPrimaryText}>Add to cart</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.danger,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  cartText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    width: '48%',
  },
  image: {
    width: '100%',
    height: 130,
  },
  imagePlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
  },
  cardContent: {
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
  },
  customBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  customizeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  modalSectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalPriceLabel: {
    fontSize: 16,
    color: colors.textMuted,
  },
  modalPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginLeft: 8,
  },
  modalSecondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalSecondaryText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
  },
  modalPrimaryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MenuScreen;
