import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ContactsContext } from '../context/ContactsContext';
import * as Contacts from 'expo-contacts';

export default function AddContactScreen({ navigation, route }) {
  const { addContact, updateContact } = useContext(ContactsContext);
  const editingContact = route.params?.contact;
  
  const [name, setName] = useState(editingContact?.name || '');
  const [phone, setPhone] = useState(editingContact?.phone || '');
  const [relationship, setRelationship] = useState(editingContact?.relationship || '');
  const [notifyBySMS, setNotifyBySMS] = useState(editingContact?.notifyBySMS || true);
  const [notifyByPush, setNotifyByPush] = useState(editingContact?.notifyByPush || false);
  
  useEffect(() => {
    navigation.setOptions({
      title: editingContact ? 'Edit Contact' : 'Add Contact'
    });
  }, [navigation, editingContact]);
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    
    const contactData = {
      name,
      phone,
      relationship,
      notifyBySMS,
      notifyByPush
    };
    
    if (editingContact) {
      updateContact({ ...contactData, id: editingContact.id });
    } else {
      addContact(contactData);
    }
    
    navigation.goBack();
  };
  
  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your contacts to use this feature');
      return;
    }
    
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
    });
    
    if (data.length > 0) {
      navigation.navigate('ContactPicker', {
        contacts: data,
        onSelect: (contact) => {
          setName(contact.name);
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            setPhone(contact.phoneNumbers[0].number);
          }
        }
      });
    } else {
      Alert.alert('No Contacts', 'No contacts found on your device');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter contact name"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="E.g., Family, Friend, Coworker"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notification Preferences</Text>
            
            <View style={styles.switchContainer}>
              <Text>Notify by SMS</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={notifyBySMS ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setNotifyBySMS}
                value={notifyBySMS}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text>Notify by Push Notification</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={notifyByPush ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setNotifyByPush}
                value={notifyByPush}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.pickContactButton}
            onPress={pickContact}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.pickContactButtonText}>Pick from Contacts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Contact</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickContactButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickContactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
