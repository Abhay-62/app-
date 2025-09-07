import Colors from '@/constants/Colors';
import { useCart } from '@/hooks/cart-store';
import { useLocation } from '@/hooks/location-store';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MapPin, Minus, Plus, Search, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const clothingItemsData = [
  {
    id: '1',
    name: 'T-Shirts',
    service: 'Wash & Iron',
    price: 20,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    quantity: 0,
  },
  {
    id: '2',
    name: 'Shirts',
    service: 'Wash & Iron',
    price: 20,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',
    quantity: 0,
  },
  {
    id: '3',
    name: 'Jeans',
    service: 'Wash & Iron',
    price: 20,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
    quantity: 0,
  },
  {
    id: '4',
    name: 'Hoodie',
    service: 'Wash & Iron',
    price: 20,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop',
    quantity: 0,
  },
];

export default function PlaceOrderScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { serviceId: _serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const { addToCart, items: cartItems } = useCart();
  const { userLocation } = useLocation();
  const [items, setItems] = useState(clothingItemsData);
  const [basketVisible, setBasketVisible] = useState(false);

  // Log cart items for debugging
  useEffect(() => {
    console.log('Cart items in place-order:', cartItems);
  }, [cartItems]);

  const updateQuantity = (itemId: string, change: number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemsInBasket = () => {
    return items.filter(item => item.quantity > 0);
  };

  const handleViewBasket = () => {
    setBasketVisible(true);
  };

  const handleSchedule = () => {
    const basketItems = getItemsInBasket();
    console.log('Basket items:', basketItems);
    if (basketItems.length === 0) {
      Alert.alert('Empty Basket', 'Please add items to your basket first');
      return;
    }
    if (totalAmount < 200) {
      Alert.alert('Minimum Order', 'Minimum order value is ₹200. Please add more items.');
      return;
    }
    
    // Add items to cart before navigating to schedule
    basketItems.forEach(item => {
      // Create a product object that matches the Product type
      const product = {
        _id: item.id,
        name: item.name,
        description: item.service,
        price: item.price,
        category: 'clothing',
        image: item.image,
        isActive: true
      };
      
      console.log('Adding product to cart:', product, 'Quantity:', item.quantity);
      // Add to cart with default values for required fields
      addToCart(product, item.quantity, userLocation?.address || '', userLocation?.address || '', new Date().toISOString());
    });
    
    // Add a small delay before navigating to ensure cart is saved
    setTimeout(() => {
      // Navigate to schedule
      router.push('/schedule');
    }, 200);
  };

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  if (basketVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Your Basket',
            headerShown: true,
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: Colors.light.text,
          }} 
        />
        
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color={Colors.light.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>{userLocation?.label || 'Current Location'}</Text>
              <Text style={styles.address}>
                {userLocation?.address || 'Fetching location...'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <User size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.basketTitle}>Your Basket</Text>
          
          {getItemsInBasket().map((item) => (
            <View key={item.id} style={styles.basketItem}>
              <View style={styles.basketItemHeader}>
                <Text style={styles.basketItemName}>{item.name}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Minus size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.basketItemService}>Service: {item.service}</Text>
              <View style={styles.basketItemFooter}>
                <Text style={styles.basketItemPrice}>₹{item.price}</Text>
                <Text style={styles.basketItemTotal}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
          ))}

          <View style={styles.basketSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items</Text>
              <Text style={styles.summaryValue}>{totalItems}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{totalAmount >= 200 ? 'FREE' : '₹40'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount >= 200 ? totalAmount : totalAmount + 40}</Text>
            </View>
            {totalAmount < 200 && (
              <Text style={styles.minimumOrderText}>
                Add ₹{200 - totalAmount} more for free delivery
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Washing & Ironing',
          headerShown: true,
          headerStyle: { backgroundColor: 'white' },
          headerTintColor: Colors.light.text,
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color={Colors.light.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>{userLocation?.label || 'Current Location'}</Text>
            <Text style={styles.address}>
              {userLocation?.address || 'Fetching location...'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <User size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceTitle}>Washing & Ironing</Text>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop' }}
            style={styles.serviceImage}
          />
        </View>

        <View style={styles.clothesSection}>
          <Text style={styles.sectionTitle}>Select your Cloths</Text>
          
          {items.map((item) => (
            <View key={item.id} style={styles.clothingItem}>
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemService}>Service: {item.service}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              </View>
              
              {item.quantity > 0 ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Minus size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.basketFooter}>
          <Text style={styles.basketSummaryText}>
            {totalItems} Item{totalItems > 1 ? 's' : ''} Added to your Basket
          </Text>
          <Text style={styles.basketTotalText}>Total Basket Value: ₹{totalAmount}</Text>
          <TouchableOpacity style={styles.viewBasketButton} onPress={handleViewBasket}>
            <Text style={styles.viewBasketButtonText}>View Basket</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  serviceHeader: {
    backgroundColor: '#E0E7FF',
    padding: 16,
    margin: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  serviceImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  clothesSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  clothingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemService: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  basketFooter: {
    backgroundColor: '#10B981',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  basketSummaryText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  basketTotalText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 12,
  },
  viewBasketButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewBasketButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  basketTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  basketItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  basketItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  basketItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  basketItemService: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  basketItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basketItemPrice: {
    fontSize: 16,
    color: Colors.light.text,
  },
  basketItemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  basketSummary: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  minimumOrderText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
  },
  scheduleButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});