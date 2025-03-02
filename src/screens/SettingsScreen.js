import React, { useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../context/SettingsContext';
import * as Location from 'expo-location';

export default function SettingsScreen() {
  const { settings, updateSettings } = useContext(SettingsContext);

  const handleEmergencyNumberChange = (value) => {
    updateSettings({ emergencyNumber: value });
  };

  const handleSOSMessageChange = (value) => {
    updateSettings({ defaultSOSMessage: value });
  };

  const handleCountdownChange = (value) => {
    const countdown = parseInt(value);
    if (!isNaN(countdown) && countdown > 0 && countdown <= 10) {
      updateSettings({ confirmationCountdown: countdown });
    }
  };

  const toggleLocationSharing = (value) => {
    updateSettings({ locationSharingEnabled: value });
  };

  const toggleHighAccuracyLocation = (value) => {
    updateSettings({ highAccuracyLocation: value });
  };

  const toggleAccessibilityMode = (value) => {
    updateSettings({ 
      accessibilityMode: value,
      // When accessibility mode is enabled, also enable large text by default
      largeText: value ? true : settings.largeText
    });
  };

  const toggleLargeText = (value) => {
    updateSettings({ largeText: value });
  };

  const toggleHighContrast = (value) => {
    updateSettings({ highContrast: value });
  };

  const checkLocationPermissions = async () => {
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    
    Alert.alert(
      "Location Permissions",
      `Foreground Location: ${foregroundStatus}\nBackground Location: ${backgroundStatus}`,
      [
        { text: "OK" },
        { 
          text: "Request Permissions", 
          onPress: async () => {
            await Location.requestForegroundPermissionsAsync();
            await Location.requestBackgroundPermissionsAsync();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Emergency Number</Text>
            <TextInput
              style={styles.input}
              value={settings.emergencyNumber}
              onChangeText={handleEmergencyNumberChange}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default SOS Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.defaultSOSMessage}
              onChangeText={handleSOSMessageChange}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Confirmation Countdown (seconds)</Text>
            <TextInput
              style={[styles.input, styles.numberInput]}
              value={settings.confirmationCountdown.toString()}
              onChangeText={handleCountdownChange}
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Location Sharing</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={settings.locationSharingEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLocationSharing}
              value={settings.locationSharingEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High Accuracy Location</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={settings.highAccuracyLocation ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleHighAccuracyLocation}
              value={settings.highAccuracyLocation}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={checkLocationPermissions}
          >
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.permissionButtonText}>Check Location Permissions</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Accessibility Mode</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={settings.accessibilityMode ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleAccessibilityMode}
              value={settings.accessibilityMode}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Large Text</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={settings.largeText ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLargeText}
              value={settings.largeText}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High Contrast</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={settings.highContrast ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleHighContrast}
              value={settings.highContrast}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            EmergCall v0.1.0{'\n'}
            An emergency response application designed to provide quick access to emergency services and alert trusted contacts during emergencies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    width: 120,
  },
  textArea: {
    width: '100%',
    height: 80,
    marginTop: 10,
  },
  numberInput: {
    width: 60,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
