import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { Clock, Shield, Shirt, Sparkles } from 'lucide-react-native';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const features = [
    {
      icon: Shirt,
      title: 'Professional Service',
      description: 'Expert ironing and laundry services',
    },
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Fast pickup and delivery',
    },
    {
      icon: Sparkles,
      title: 'Quality Assured',
      description: 'Premium care for your clothes',
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Safe and reliable service',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Shirt size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Welcome to Istriwala</Text>
          <Text style={styles.subtitle}>
            Professional ironing and laundry services at your doorstep
          </Text>
        </View>

        <View style={styles.heroImage}>
          <View style={styles.heroPlaceholder}>
            <Shirt size={80} color={Colors.light.primary} />
            <Text style={styles.heroText}>Your Clothes, Our Care</Text>
          </View>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <feature.icon size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/login')}
          testID="get-started-button"
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.authLinks}>
          <Text style={styles.authText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')} testID="sign-in-link">
            <Text style={styles.authLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroImage: {
    alignItems: 'center',
    marginVertical: 32,
  },
  heroPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 12,
  },
  features: {
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
  },
  getStartedButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  authLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    color: '#6b7280',
  },
  authLink: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});