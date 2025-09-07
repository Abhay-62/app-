import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

interface UserLocation {
  address: string;
  latitude?: number;
  longitude?: number;
  label?: string;
}

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setDefaultLocation = useCallback(() => {
    const defaultLocation: UserLocation = {
      address: 'Bangalore, Karnataka',
      label: 'Default Location'
    };
    setUserLocation(defaultLocation);
    setError('Location access denied. Using default location.');
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web geolocation API
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
          
          const location: UserLocation = {
            address: 'Current Location',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label: 'Current Location'
          };
          
          setUserLocation(location);
          await AsyncStorage.setItem('userLocation', JSON.stringify(location));
          setError(null);
        } catch (error) {
          console.error('Web geolocation error:', error);
          setDefaultLocation();
        }
      } else {
        setDefaultLocation();
      }
    } else {
      // Mobile location using expo-location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setDefaultLocation();
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const address = reverseGeocode[0] 
          ? `${reverseGeocode[0].name || ''} ${reverseGeocode[0].street || ''}, ${reverseGeocode[0].city || ''}, ${reverseGeocode[0].region || ''}`.trim()
          : 'Current Location';

        const location: UserLocation = {
          address: address || 'Current Location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Current Location'
        };

        setUserLocation(location);
        await AsyncStorage.setItem('userLocation', JSON.stringify(location));
        setError(null);
      } catch (error) {
        console.error('Mobile location error:', error);
        setDefaultLocation();
      }
    }
  }, [setDefaultLocation]);

  const loadStoredLocation = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('userLocation');
      if (stored) {
        setUserLocation(JSON.parse(stored));
      } else {
        // If no stored location, try to get current location
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error loading stored location:', error);
      setError('Failed to load location');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    loadStoredLocation();
  }, [loadStoredLocation]);

  const updateLocation = useCallback(async (location: UserLocation) => {
    setUserLocation(location);
    await AsyncStorage.setItem('userLocation', JSON.stringify(location));
  }, []);

  return useMemo(() => ({
    userLocation,
    isLoading,
    error,
    getCurrentLocation,
    updateLocation,
  }), [userLocation, isLoading, error, getCurrentLocation, updateLocation]);
});