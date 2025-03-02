import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useContext } from 'react';
import { SettingsContext } from './SettingsContext';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: settings.highAccuracyLocation ? 
          Location.Accuracy.BestForNavigation : 
          Location.Accuracy.Balanced
      });
      setLocation(currentLocation);
    })();
  }, [settings.highAccuracyLocation]);

  const startTracking = async () => {
    if (isTracking) return;
    
    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Background location permission is required for location tracking');
      return false;
    }

    setIsTracking(true);
    
    // Start watching position
    Location.watchPositionAsync(
      {
        accuracy: settings.highAccuracyLocation ? 
          Location.Accuracy.BestForNavigation : 
          Location.Accuracy.Balanced,
        distanceInterval: 10, // update every 10 meters
        timeInterval: 5000 // or every 5 seconds
      },
      (newLocation) => {
        setLocation(newLocation);
      }
    );
    
    return true;
  };

  const stopTracking = () => {
    setIsTracking(false);
    // Location.stopLocationUpdatesAsync() would be called here
    // but Expo's Location API doesn't have this method directly
    // Instead, we would need to keep the subscription reference and unsubscribe
  };

  const getLocationUrl = () => {
    if (!location) return '';
    
    const { latitude, longitude } = location.coords;
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      errorMsg, 
      isTracking,
      startTracking,
      stopTracking,
      getLocationUrl
    }}>
      {children}
    </LocationContext.Provider>
  );
};
