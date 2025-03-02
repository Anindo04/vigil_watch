import React, { useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ContactsContext } from '../context/ContactsContext';

export default function ContactsScreen({ navigation }) {
  const { contacts, deleteContact } = useContext(ContactsContext);

  const handleAddContact = () => {
    navigation.navigate('AddContact');
  };

  const handleEditContact = (contact) => {
    navigation.navigate('AddContact', { contact });
  };

  const handleDeleteContact = (id, name) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${name} from your emergency contacts?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteContact(id),
          style: "destructive"
        }
      ]
    );
  };

  const renderContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
        <Text style={styles.contactRelationship}>{item.relationship}</Text>
        <View style={styles.notificationPrefs}>
          {item.notifyBySMS && (
            <View style={styles.notificationTag}>
              <Ionicons name="chatbubble" size={12} color="white" />
              <Text style={styles.notificationTagText}>SMS</Text>
            </View>
          )}
          {item.notifyByPush && (
            <View style={styles.notificationTag}>
              <Ionicons name="notifications" size={12} color="white" />
              <Text style={styles.notificationTagText}>Push</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditContact(item)}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteContact(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddContact}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {contacts.length > 0 ? (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.contactsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No emergency contacts added yet</Text>
          <TouchableOpacity 
            style={styles.emptyAddButton}
            onPress={handleAddContact}
          >
            <Text style={styles.emptyAddButtonText}>Add Contact</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsList: {
    padding: 15,
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  notificationPrefs: {
    flexDirection: 'row',
    marginTop: 8,
  },
  notificationTag: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 5,
  },
  notificationTagText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 3,
  },
  contactActions: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
