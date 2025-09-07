import Colors from '@/constants/Colors';
import { Order } from '@/types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return Colors.light.warning;
      case 'confirmed':
      case 'picked-up':
      case 'in-progress':
        return Colors.light.primary;
      case 'ready':
        return '#8b5cf6';
      case 'delivered':
        return Colors.light.success;
      case 'cancelled':
        return Colors.light.error;
      default:
        return Colors.light.text;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} testID={`order-card-${order._id}`}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      <Text style={styles.address} numberOfLines={1}>
        {order.pickupAddress}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.amount}>₹{order.totalAmount}</Text>
        <Text style={styles.paymentMethod}>{order.paymentMethod}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6b7280',
  },
});