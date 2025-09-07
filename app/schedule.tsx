import Colors from '@/constants/Colors';
import { useLocation } from '@/hooks/location-store';
import { router, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Search, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DateOption {
  id: string;
  label: string;
  date: string;
  fullDate: Date;
  selected: boolean;
}

const generateDates = (): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();
  
  // Generate dates for the next 30 days starting from today
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[date.getDay()];
    const dateStr = `${date.getDate()} ${monthNames[date.getMonth()]}`;
    
    dates.push({
      id: `date-${i}`,
      label,
      date: dateStr,
      fullDate: new Date(date), // Create a new Date object to avoid reference issues
      selected: i === 0 // Default to today
    });
  }
  
  return dates;
};

const pickupTimes = [
  { id: '9am', time: '9:00 Am', selected: false },
  { id: '10am', time: '10:00 Am', selected: true },
  { id: '11am', time: '11:00 Am', selected: false },
  { id: '12pm', time: '12:00 Pm', selected: false },
  { id: '1pm', time: '1:00 Pm', selected: false },
  { id: '2pm', time: '2:00 Pm', selected: false },
  { id: '3pm', time: '3:00 Pm', selected: false },
  { id: '4pm', time: '4:00 Pm', selected: false },
];

const deliveryTimes = [
  { id: '9am-d', time: '9:00 Am', selected: false },
  { id: '10am-d', time: '10:00 Am', selected: false },
  { id: '11am-d', time: '11:00 Am', selected: false },
  { id: '12pm-d', time: '12:00 Pm', selected: false },
  { id: '1pm-d', time: '1:00 Pm', selected: false },
  { id: '2pm-d', time: '2:00 Pm', selected: false },
  { id: '3pm-d', time: '3:00 Pm', selected: true },
  { id: '4pm-d', time: '4:00 Pm', selected: false },
];

export default function ScheduleScreen() {
  const { userLocation } = useLocation();
  
  const initialDates = useMemo(() => generateDates(), []);
  const [pickupDates, setPickupDates] = useState<DateOption[]>(initialDates);
  const [deliveryDates, setDeliveryDates] = useState<DateOption[]>(() => {
    const deliveryDatesData = generateDates();
    // Set default delivery date to tomorrow (index 1) if pickup is today
    return deliveryDatesData.map((date, index) => ({
      ...date,
      selected: index === 1 // Default to tomorrow for delivery
    }));
  });
  const [pickupTimeSlots, setPickupTimeSlots] = useState(pickupTimes);
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState(deliveryTimes);

  const handlePickupDateSelect = (selectedId: string) => {
    setPickupDates(prev => 
      prev.map(date => ({ ...date, selected: date.id === selectedId }))
    );
  };

  const handleDeliveryDateSelect = (selectedId: string) => {
    const selectedPickupDate = pickupDates.find(d => d.selected);
    const selectedDeliveryDate = deliveryDates.find(d => d.id === selectedId);
    
    // Allow same day delivery or later
    if (selectedPickupDate && selectedDeliveryDate) {
      const pickupDateOnly = new Date(selectedPickupDate.fullDate.getFullYear(), selectedPickupDate.fullDate.getMonth(), selectedPickupDate.fullDate.getDate());
      const deliveryDateOnly = new Date(selectedDeliveryDate.fullDate.getFullYear(), selectedDeliveryDate.fullDate.getMonth(), selectedDeliveryDate.fullDate.getDate());
      
      if (deliveryDateOnly >= pickupDateOnly) {
        setDeliveryDates(prev => 
          prev.map(date => ({ ...date, selected: date.id === selectedId }))
        );
      }
    }
  };

  const handlePickupTimeSelect = (selectedId: string) => {
    setPickupTimeSlots(prev => 
      prev.map(time => ({ ...time, selected: time.id === selectedId }))
    );
  };

  const handleDeliveryTimeSelect = (selectedId: string) => {
    setDeliveryTimeSlots(prev => 
      prev.map(time => ({ ...time, selected: time.id === selectedId }))
    );
  };

  const handleConfirmOrder = () => {
    // Get selected pickup and delivery information
    const selectedPickupDate = pickupDates.find(d => d.selected);
    const selectedDeliveryDate = deliveryDates.find(d => d.selected);
    const selectedPickupTime = pickupTimeSlots.find(t => t.selected);
    const selectedDeliveryTime = deliveryTimeSlots.find(t => t.selected);
    
    // Add a small delay before navigating to ensure cart is saved
    setTimeout(() => {
      // Pass schedule data to checkout screen
      router.push({
        pathname: '/checkout',
        params: {
          pickupDate: selectedPickupDate ? selectedPickupDate.date : '',
          deliveryDate: selectedDeliveryDate ? selectedDeliveryDate.date : '',
          pickupTime: selectedPickupTime ? selectedPickupTime.time : '',
          deliveryTime: selectedDeliveryTime ? selectedDeliveryTime.time : ''
        }
      });
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'SCHEDULE',
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
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <User size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick Up</Text>
          
          <Text style={styles.subTitle}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateContainer}>
              {pickupDates.map((date) => (
                <TouchableOpacity
                  key={date.id}
                  style={[styles.dateButton, date.selected && styles.dateButtonSelected]}
                  onPress={() => handlePickupDateSelect(date.id)}
                >
                  <Text style={[styles.dateLabel, date.selected && styles.dateLabelSelected]}>
                    {date.label}
                  </Text>
                  <Text style={[styles.dateText, date.selected && styles.dateTextSelected]}>
                    {date.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.subTitle}>Time</Text>
          <View style={styles.timeContainer}>
            {pickupTimeSlots.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[styles.timeButton, time.selected && styles.timeButtonSelected]}
                onPress={() => handlePickupTimeSelect(time.id)}
              >
                <Text style={[styles.timeText, time.selected && styles.timeTextSelected]}>
                  {time.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          
          <Text style={styles.subTitle}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateContainer}>
              {deliveryDates.map((date) => {
                const selectedPickupDate = pickupDates.find(d => d.selected);
                let isDisabled = false;
                
                if (selectedPickupDate) {
                  const pickupDateOnly = new Date(selectedPickupDate.fullDate.getFullYear(), selectedPickupDate.fullDate.getMonth(), selectedPickupDate.fullDate.getDate());
                  const deliveryDateOnly = new Date(date.fullDate.getFullYear(), date.fullDate.getMonth(), date.fullDate.getDate());
                  isDisabled = deliveryDateOnly < pickupDateOnly;
                }
                
                return (
                  <TouchableOpacity
                    key={`delivery-${date.id}`}
                    style={[
                      styles.dateButton, 
                      date.selected && styles.dateButtonSelected,
                      isDisabled && styles.dateButtonDisabled
                    ]}
                    onPress={() => !isDisabled && handleDeliveryDateSelect(date.id)}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.dateLabel, 
                      date.selected && styles.dateLabelSelected,
                      isDisabled && styles.dateLabelDisabled
                    ]}>
                      {date.label}
                    </Text>
                    <Text style={[
                      styles.dateText, 
                      date.selected && styles.dateTextSelected,
                      isDisabled && styles.dateTextDisabled
                    ]}>
                      {date.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={styles.subTitle}>Time</Text>
          <View style={styles.timeContainer}>
            {deliveryTimeSlots.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[styles.timeButton, time.selected && styles.timeButtonSelected]}
                onPress={() => handleDeliveryTimeSelect(time.id)}
              >
                <Text style={[styles.timeText, time.selected && styles.timeTextSelected]}>
                  {time.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
          <Text style={styles.confirmButtonText}>Confirm your order</Text>
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateLabelSelected: {
    color: 'white',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dateTextSelected: {
    color: 'white',
  },
  dateButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  dateLabelDisabled: {
    color: '#9CA3AF',
  },
  dateTextDisabled: {
    color: '#9CA3AF',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  timeTextSelected: {
    color: 'white',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});