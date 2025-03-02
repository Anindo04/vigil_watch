import React, { useContext, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Linking,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../context/SettingsContext';
import { LocationContext } from '../context/LocationContext';
import { ContactsContext } from '../context/ContactsContext';
import { logEvent, EventTypes } from '../services/EventService';
import * as SMS from 'expo-sms';

export default function HomeScreen({ navigation }) {
  const { settings } = useContext(SettingsContext);
  const { location, isTracking, startTracking, stopTracking, getLocationUrl } = useContext(LocationContext);
  const { contacts } = useContext(ContactsContext);
  const [locationSharing, setLocationSharing] = useState(false);

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Call",
      `Are you sure you want to call ${settings.emergencyNumber}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Call", 
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' 
              ? `tel:${settings.emergencyNumber}` 
              : `telprompt:${settings.emergencyNumber}`;

            // Log the emergency call event
            logEvent(EventTypes.CALL, `Called emergency number: ${settings.emergencyNumber}`);
            
            Linking.openURL(phoneNumber)
              .catch(err => Alert.alert('Error', 'Could not initiate the call'));
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSOSPress = () => {
    navigation.navigate('SOS');
  };

  const toggleLocationSharing = async () => {
    if (!locationSharing) {
      const success = await startTracking();
      if (success) {
        setLocationSharing(true);
        Alert.alert(
          "Location Sharing Enabled",
          "Your location is now being shared with your emergency contacts."
        );

        // Log the location sharing event
        logEvent(EventTypes.LOCATION, `Location sharing enabled`);
      }
    } else {
      stopTracking();
      setLocationSharing(false);
      Alert.alert(
        "Location Sharing Disabled",
        "Your location is no longer being shared."
      );

      // Log the location sharing event
      logEvent(EventTypes.LOCATION, `Location sharing disabled`);
    }
  };

  const sendQuickSOS = async () => {
    // Check if device can send SMS
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "SMS is not available on this device");
      return;
    }

    // Get SMS contacts
    const smsContacts = contacts.filter(contact => contact.notifyBySMS)
                                .map(contact => contact.phone);
    
    if (smsContacts.length === 0) {
      Alert.alert("No Contacts", "You don't have any contacts set up for SMS notifications");
      return;
    }

    // Prepare message with location
    const locationUrl = getLocationUrl();
    const message = `${settings.defaultSOSMessage} ${locationUrl}`;

    // Log the SOS message event
    logEvent(EventTypes.SOS, `Quick SOS message sent to ${smsContacts.length} contacts`);

    // Send SMS
    const { result } = await SMS.sendSMSAsync(smsContacts, message);
    
    if (result === 'sent' || result === 'unknown') {
      Alert.alert("Success", "SOS message sent to your emergency contacts");
    } else {
      Alert.alert("Error", "Failed to send SOS message");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EmergCall</Text>
      </View>
      
      <View style={styles.emergencyButtonContainer}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <Ionicons name="call" size={50} color="white" />
          <Text style={styles.emergencyButtonText}>
            Emergency Call
          </Text>
          <Text style={styles.emergencyNumber}>
            {settings.emergencyNumber}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationSharingContainer}>
        <Text style={styles.locationSharingText}>Location Sharing</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#FF3B30" }}
          thumbColor={locationSharing ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleLocationSharing}
          value={locationSharing}
        />
      </View>

      <View style={styles.quickAccessContainer}>
        <TouchableOpacity 
          style={styles.quickAccessButton}
          onPress={handleSOSPress}
        >
          <Ionicons name="alert-circle" size={30} color="white" />
          <Text style={styles.quickAccessText}>SOS Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAccessButton}
          onPress={sendQuickSOS}
        >
          <Ionicons name="chatbubble-ellipses" size={30} color="white" />
          <Text style={styles.quickAccessText}>Quick SOS Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emergencyNumber: {
    color: 'white',
    fontSize: 16,
  },
  locationSharingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  locationSharingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickAccessButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '40%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickAccessText: {
    color: 'white',
    marginTop: 5,
    fontWeight: '500',
  },
});
