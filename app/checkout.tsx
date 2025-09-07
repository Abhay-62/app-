import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/auth-store';
import { useCart } from '@/hooks/cart-store';
import { useLocation } from '@/hooks/location-store';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Banknote, CreditCard, Edit, MapPin, Plus, Search, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CheckoutScreen() {
  const { items, clearCart, getTotalAmount, refreshCart } = useCart();
  const { userLocation } = useLocation();
  const { user, addOrder } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Home',
      address: user?.address || '302, Om Sai Apartment,\nPipla Road, Manish Nagar\nNagpur',
      isDefault: true
    },
    {
      id: '2', 
      name: 'Office',
      address: '5th Floor, Tech Park,\nBaner Road\nPune',
      isDefault: false
    }
  ]);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  // Get schedule parameters
  const params = useLocalSearchParams();
  const { pickupDate, deliveryDate, pickupTime, deliveryTime } = params;
  
  const subtotal = getTotalAmount();
  const deliveryFee = subtotal >= 200 ? 0 : 40;
  const total = subtotal + deliveryFee;

  // Log cart items for debugging
  useEffect(() => {
    console.log('Cart items in checkout:', items);
    console.log('Cart subtotal:', subtotal);
    console.log('Cart total:', total);
  }, [items, subtotal, total]);

  // Refresh cart when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshCart();
    }, 100); // Small delay to ensure cart is loaded
    
    return () => clearTimeout(timer);
  }, [refreshCart]);

  // Update addresses when user data changes
  useEffect(() => {
    if (user) {
      setAddresses([
        {
          id: '1',
          name: 'Home',
          address: user.address || '302, Om Sai Apartment,\nPipla Road, Manish Nagar\nNagpur',
          isDefault: true
        },
        {
          id: '2', 
          name: 'Office',
          address: '5th Floor, Tech Park,\nBaner Road\nPune',
          isDefault: false
        }
      ]);
    }
  }, [user]);

  // Set the default address when addresses change
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  const handleConfirmOrder = async () => {
    // Refresh cart to ensure we have the latest data
    await refreshCart();
    
    // Small delay to ensure refresh is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Items in cart before placing order:', items);
    
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checkout.');
      return;
    }

    // Create order object with real cart data
    const newOrder = {
      _id: Date.now().toString(),
      orderId: `ORD${Date.now().toString().slice(-6)}`,
      pickupId: `PU${Date.now().toString().slice(-6)}`,
      deliveryId: `DL${Date.now().toString().slice(-6)}`,
      userId: user?._id || 'guest',
      items: [...items],
      totalAmount: total,
      status: 'pending' as const,
      pickupAddress: selectedAddress.address,
      deliveryAddress: selectedAddress.address,
      pickupTime: pickupDate && pickupTime ? `${pickupDate} ${pickupTime}` : new Date().toISOString(),
      deliveryTime: deliveryDate && deliveryTime ? `${deliveryDate} ${deliveryTime}` : new Date().toISOString(),
      paymentMethod: selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      paymentStatus: 'completed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating new order:', newOrder);

    if (selectedPayment === 'online') {
      // Pass the order data to the payments screen
      router.push({
        pathname: '/payments',
        params: {
          orderId: newOrder.orderId,
          totalAmount: total.toString(),
          itemsCount: items.length.toString(),
          pickupAddress: selectedAddress.address,
          deliveryAddress: selectedAddress.address
        }
      });
    } else {
      try {
        // Add order to user's orders
        await addOrder(newOrder);
        
        // Clear cart
        clearCart();
        
        // Show order confirmation instead of alert
        setShowOrderConfirmation(true);
        
        // Redirect to orders page after a delay or when user clicks OK
        // This will be handled in the confirmation modal
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    }
  };
  
  const handleAddAddress = () => {
    if (newAddress.trim()) {
      const newAddr = {
        id: Date.now().toString(),
        name: 'New Address',
        address: newAddress,
        isDefault: false
      };
      setAddresses([...addresses, newAddr]);
      setSelectedAddress(newAddr);
      setShowAddressModal(false);
      setNewAddress('');
      Alert.alert('Success', 'Address added successfully!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'CONFIRM ADDRESS',
          headerShown: true,
          headerStyle: { backgroundColor: 'white' },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/search')}>
            <Search size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
            <User size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.addressSection}>
          <Text style={styles.deliverToText}>Deliver to {user?.name || 'User'},</Text>
          <Text style={styles.addressText}>{selectedAddress.address}</Text>
          <TouchableOpacity style={styles.changeAddressButton} onPress={() => setShowAddressModal(true)}>
            <Edit size={16} color={Colors.light.primary} />
            <Text style={styles.changeAddressText}>Add or Change Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderSummarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.length > 0 ? (
            <>
              {items.map((item: any) => (
                <View key={item._id} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.product.name}</Text>
                    <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>₹{item.product.price * item.quantity}</Text>
                </View>
              ))}
              
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{total}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <TouchableOpacity 
                style={styles.continueShoppingButton}
                onPress={() => router.push('/place-order')}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('cod')}
          >
            <Banknote size={24} color={selectedPayment === 'cod' ? Colors.light.primary : '#6B7280'} />
            <View style={styles.paymentOptionText}>
              <Text style={[styles.paymentOptionTitle, selectedPayment === 'cod' && styles.paymentOptionTitleSelected]}>Cash on Delivery</Text>
              <Text style={styles.paymentOptionSubtitle}>Pay when your order arrives</Text>
            </View>
            <View style={[styles.radioButton, selectedPayment === 'cod' && styles.radioButtonSelected]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'online' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('online')}
          >
            <CreditCard size={24} color={selectedPayment === 'online' ? Colors.light.primary : '#6B7280'} />
            <View style={styles.paymentOptionText}>
              <Text style={[styles.paymentOptionTitle, selectedPayment === 'online' && styles.paymentOptionTitleSelected]}>Online Payment</Text>
              <Text style={styles.paymentOptionSubtitle}>UPI, Cards, Net Banking</Text>
            </View>
            <View style={[styles.radioButton, selectedPayment === 'online' && styles.radioButtonSelected]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerTotal}>₹{total}</Text>
            <Text style={styles.footerSubtext}>{items.length} items</Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
            <Text style={styles.confirmButtonText}>
              {selectedPayment === 'cod' ? 'Place Order' : 'Proceed to Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      // Add Order Confirmation Modal
      <Modal
        visible={showOrderConfirmation}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.confirmationTitle}>Order Confirmed!</Text>
            <Text style={styles.confirmationMessage}>
              Your order has been placed successfully. You will receive a confirmation shortly.
            </Text>
            <TouchableOpacity 
              style={styles.confirmationButton} 
              onPress={() => {
                setShowOrderConfirmation(false);
                router.push('/orders');
              }}
            >
              <Text style={styles.confirmationButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {addresses.map((address) => (
              <TouchableOpacity 
                key={address.id}
                style={[styles.addressOption, selectedAddress.id === address.id && styles.addressOptionSelected]}
                onPress={() => {
                  setSelectedAddress(address);
                  setShowAddressModal(false);
                }}
              >
                <View style={styles.addressOptionContent}>
                  <Text style={styles.addressOptionName}>{address.name}</Text>
                  <Text style={styles.addressOptionText}>{address.address}</Text>
                </View>
                <View style={[styles.radioButton, selectedAddress.id === address.id && styles.radioButtonSelected]} />
              </TouchableOpacity>
            ))}
            
            <View style={styles.addAddressSection}>
              <Text style={styles.addAddressTitle}>Add New Address</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Enter your address"
                value={newAddress}
                onChangeText={setNewAddress}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
                <Plus size={20} color="white" />
                <Text style={styles.addAddressButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
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
    paddingTop: 24,
  },
  addressSection: {
    backgroundColor: '#E0F2FE',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  deliverToText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  changeAddressButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeAddressText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  orderSummarySection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  orderSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  paymentSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paymentOptionTitleSelected: {
    color: Colors.light.primary,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radioButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerSummary: {
    flex: 1,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  addressOptionContent: {
    flex: 1,
  },
  addressOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  addressOptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addAddressSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addAddressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  addAddressButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addAddressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  confirmationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmationButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  confirmationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Add new styles for empty cart
  emptyCartContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  continueShoppingButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
});
