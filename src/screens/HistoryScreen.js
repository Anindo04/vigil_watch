import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEvents, updateEventNotes, deleteEvent as deleteEventService } from '../services/EventService';

export default function HistoryScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create table if it doesn't exist
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const eventsData = await getEvents();
    setEvents(eventsData);
    setLoading(false);
  };

  const addNote = (id, currentNote) => {
    Alert.prompt(
      "Add Note",
      "Enter additional details about this event:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Save",
          onPress: (note) => {
            if (note) {
              updateEventNotes(id, note).then(() => {
                loadEvents();
              });
            }
          }
        }
      ],
      "plain-text",
      currentNote
    );
  };

  const deleteEvent = (id) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event from your history?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            deleteEventService(id).then(() => {
              loadEvents();
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderEventItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    let icon;
    let color;
    
    switch (item.type) {
      case 'call':
        icon = 'call';
        color = '#FF3B30';
        break;
      case 'sos':
        icon = 'alert-circle';
        color = '#FF9500';
        break;
      case 'location':
        icon = 'location';
        color = '#007AFF';
        break;
      default:
        icon = 'information-circle';
        color = '#8E8E93';
    }
    
    return (
      <View style={styles.eventItem}>
        <View style={[styles.eventIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventType}>
              {item.type === 'call' ? 'Emergency Call' : 
               item.type === 'sos' ? 'SOS Alert' : 
               item.type === 'location' ? 'Location Shared' : 'Event'}
            </Text>
            <Text style={styles.eventTime}>{formattedDate}</Text>
          </View>
          
          <Text style={styles.eventDetails}>{item.details}</Text>
          
          {item.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}
          
          <View style={styles.eventActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => addNote(item.id, item.notes)}
            >
              <Ionicons name="create-outline" size={16} color="#007AFF" />
              <Text style={[styles.actionText, { color: '#007AFF' }]}>
                {item.notes ? 'Edit Note' : 'Add Note'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => deleteEvent(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
      </View>
      
      {events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No activity history yet</Text>
          <Text style={styles.emptySubtext}>
            Your emergency calls, SOS alerts, and location sharing will appear here
          </Text>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventsList: {
    padding: 15,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  eventIcon: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  eventContent: {
    flex: 1,
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  eventDetails: {
    fontSize: 14,
    color: '#3A3A3C',
    marginBottom: 10,
  },
  notesContainer: {
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#3A3A3C',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    padding: 5,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 5,
  },
});
