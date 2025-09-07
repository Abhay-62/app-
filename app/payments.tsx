import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/auth-store';
import { useCart } from '@/hooks/cart-store';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Building, CreditCard, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaymentScreen() {
  const { clearCart, getTotalAmount, items } = useCart();
  const { user, addOrder } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState({
    totalAmount: 0,
    itemsCount: 0,
    pickupAddress: '',
    deliveryAddress: ''
  });
  
  const params = useLocalSearchParams();
  
  // Get the actual cart total instead of relying on params
  const subtotal = getTotalAmount();
  const deliveryFee = subtotal >= 200 ? 0 : 40;
  const total = subtotal + deliveryFee;

  // Initialize order data from params or cart
  useEffect(() => {
    if (params.totalAmount) {
      setOrderData({
        totalAmount: parseFloat(params.totalAmount as string),
        itemsCount: parseInt(params.itemsCount as string) || items.length,
        pickupAddress: (params.pickupAddress as string) || user?.address || '',
        deliveryAddress: (params.deliveryAddress as string) || user?.address || ''
      });
    } else {
      // Fallback to cart data
      setOrderData({
        totalAmount: total,
        itemsCount: items.length,
        pickupAddress: user?.address || '',
        deliveryAddress: user?.address || ''
      });
    }
  }, [params, items, user, total]);

  const handlePayment = async () => {
    // Refresh cart to ensure we have the latest data
    const { items: currentItems, getTotalAmount, clearCart } = useCart();
    const subtotal = getTotalAmount();
    const deliveryFee = subtotal >= 200 ? 0 : 40;
    const total = subtotal + deliveryFee;
    
    console.log('Items in cart before payment:', currentItems);
    
    if (currentItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checkout.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Create order object with real data from cart
        const newOrder = {
          _id: Date.now().toString(),
          orderId: `ORD${Date.now().toString().slice(-6)}`,
          pickupId: `PU${Date.now().toString().slice(-6)}`,
          deliveryId: `DL${Date.now().toString().slice(-6)}`,
          userId: user?._id || 'guest',
          items: [...currentItems],
          totalAmount: total, // Use the actual calculated total
          status: 'pending' as const,
          pickupAddress: orderData.pickupAddress || user?.address || 'Default Address',
          deliveryAddress: orderData.deliveryAddress || user?.address || 'Default Address',
          pickupTime: new Date().toISOString(),
          paymentMethod: `Online Payment (${selectedMethod})`,
          paymentStatus: 'completed' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('Creating new order from payment:', newOrder);

        // Add order to user's orders
        await addOrder(newOrder);
        
        // Clear cart
        clearCart();
        
        setIsProcessing(false);
        Alert.alert(
          'Payment Successful!',
          'Your order has been placed successfully. You will receive a confirmation shortly.',
          [{ text: 'OK', onPress: () => {
            router.push('/orders');
          }}]
        );
      } catch (error) {
        console.error('Error placing order:', error);
        setIsProcessing(false);
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'PAYMENT',
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
      
      <View style={styles.content}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{orderData.totalAmount || total}</Text>
        </View>

        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          <TouchableOpacity 
            style={[styles.paymentMethod, selectedMethod === 'upi' && styles.paymentMethodSelected]}
            onPress={() => setSelectedMethod('upi')}
          >
            <Smartphone size={24} color={selectedMethod === 'upi' ? Colors.light.primary : '#6B7280'} />
            <View style={styles.paymentMethodText}>
              <Text style={[styles.paymentMethodTitle, selectedMethod === 'upi' && styles.paymentMethodTitleSelected]}>UPI</Text>
              <Text style={styles.paymentMethodSubtitle}>Pay using UPI apps</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'upi' && styles.radioButtonSelected]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.paymentMethod, selectedMethod === 'card' && styles.paymentMethodSelected]}
            onPress={() => setSelectedMethod('card')}
          >
            <CreditCard size={24} color={selectedMethod === 'card' ? Colors.light.primary : '#6B7280'} />
            <View style={styles.paymentMethodText}>
              <Text style={[styles.paymentMethodTitle, selectedMethod === 'card' && styles.paymentMethodTitleSelected]}>Credit/Debit Card</Text>
              <Text style={styles.paymentMethodSubtitle}>Visa, Mastercard, RuPay</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'card' && styles.radioButtonSelected]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.paymentMethod, selectedMethod === 'netbanking' && styles.paymentMethodSelected]}
            onPress={() => setSelectedMethod('netbanking')}
          >
            <Building size={24} color={selectedMethod === 'netbanking' ? Colors.light.primary : '#6B7280'} />
            <View style={styles.paymentMethodText}>
              <Text style={[styles.paymentMethodTitle, selectedMethod === 'netbanking' && styles.paymentMethodTitleSelected]}>Net Banking</Text>
              <Text style={styles.paymentMethodSubtitle}>All major banks supported</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'netbanking' && styles.radioButtonSelected]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{orderData.totalAmount || total}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingTop: 24,
  },
  amountSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  paymentMethodsSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paymentMethodTitleSelected: {
    color: Colors.light.primary,
  },
  paymentMethodSubtitle: {
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
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});