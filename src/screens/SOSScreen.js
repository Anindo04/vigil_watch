import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../context/SettingsContext';
import { LocationContext } from '../context/LocationContext';
import { ContactsContext } from '../context/ContactsContext';
import { logEvent, EventTypes } from '../services/EventService';
import * as SMS from 'expo-sms';

export default function SOSScreen({ navigation }) {
  const { settings } = useContext(SettingsContext);
  const { location, getLocationUrl } = useContext(LocationContext);
  const { contacts } = useContext(ContactsContext);
  
  const [message, setMessage] = useState(settings.defaultSOSMessage);
  const [countdown, setCountdown] = useState(settings.confirmationCountdown);
  const [isCounting, setIsCounting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isCounting && countdown === 0) {
      sendSOSMessage();
    }
    
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);
  
  const startCountdown = () => {
    setIsCounting(true);
  };
  
  const cancelCountdown = () => {
    setIsCounting(false);
    setCountdown(settings.confirmationCountdown);
  };
  
  const sendSOSMessage = async () => {
    setIsSending(true);
    
    try {
      // Check if device can send SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "SMS is not available on this device");
        setIsSending(false);
        return;
      }

      // Get SMS contacts
      const smsContacts = contacts.filter(contact => contact.notifyBySMS)
                                  .map(contact => contact.phone);
      
      if (smsContacts.length === 0) {
        Alert.alert("No Contacts", "You don't have any contacts set up for SMS notifications");
        setIsSending(false);
        return;
      }

      // Prepare message with location
      const locationUrl = getLocationUrl();
      const fullMessage = `${message} ${locationUrl}`;
      
      // Log the SOS message event
      logEvent(EventTypes.SOS, `SOS message sent to ${smsContacts.length} contacts`);

      // Send SMS
      const { result } = await SMS.sendSMSAsync(smsContacts, fullMessage);
      
      if (result === 'sent' || result === 'unknown') {
        Alert.alert(
          "SOS Sent",
          "Your emergency message has been sent to your contacts",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", "Failed to send SOS message");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while sending the SOS message");
      console.error(error);
    } finally {
      setIsSending(false);
      setIsCounting(false);
      setCountdown(settings.confirmationCountdown);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.label}>Emergency Message:</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          value={message}
          onChangeText={setMessage}
          editable={!isCounting && !isSending}
        />
        
        <Text style={styles.previewLabel}>Your message will be sent with your current location to:</Text>
        {contacts.filter(contact => contact.notifyBySMS).length > 0 ? (
          contacts.filter(contact => contact.notifyBySMS).map(contact => (
            <Text key={contact.id} style={styles.contactName}>
              • {contact.name} ({contact.phone})
            </Text>
          ))
        ) : (
          <Text style={styles.noContacts}>No emergency contacts configured</Text>
        )}
      </View>
      
      {isCounting ? (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>Sending SOS in</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={cancelCountdown}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : isSending ? (
        <View style={styles.sendingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.sendingText}>Sending SOS message...</Text>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={startCountdown}
            disabled={contacts.filter(contact => contact.notifyBySMS).length === 0}
          >
            <Text style={styles.sendButtonText}>Send SOS</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
  },
  noContacts: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FF3B30',
    marginLeft: 10,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  countdownText: {
    fontSize: 18,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginVertical: 20,
  },
  sendingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  sendingText: {
    fontSize: 18,
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
