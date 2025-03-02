import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ContactsProvider } from './src/context/ContactsContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { LocationProvider } from './src/context/LocationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ContactsProvider>
        <SettingsProvider>
          <LocationProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </LocationProvider>
        </SettingsProvider>
      </ContactsProvider>
    </SafeAreaProvider>
  );
}
