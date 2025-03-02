import React, { createContext, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export const ContactsContext = createContext();

const db = SQLite.openDatabase('emercall.db');

export const ContactsProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create tables if they don't exist
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, relationship TEXT, notifyBySMS BOOLEAN, notifyByPush BOOLEAN);'
      );
    });

    // Load contacts
    loadContacts();
  }, []);

  const loadContacts = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM contacts ORDER BY name;',
        [],
        (_, { rows: { _array } }) => {
          setContacts(_array);
          setLoading(false);
        },
        (_, error) => {
          console.error("Error loading contacts:", error);
          setLoading(false);
          return true;
        }
      );
    });
  };

  const addContact = (contact) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO contacts (name, phone, relationship, notifyBySMS, notifyByPush) VALUES (?, ?, ?, ?, ?);',
        [contact.name, contact.phone, contact.relationship, contact.notifyBySMS ? 1 : 0, contact.notifyByPush ? 1 : 0],
        (_, { insertId }) => {
          setContacts([...contacts, { ...contact, id: insertId }]);
        },
        (_, error) => {
          console.error("Error adding contact:", error);
          return true;
        }
      );
    });
  };

  const updateContact = (contact) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE contacts SET name = ?, phone = ?, relationship = ?, notifyBySMS = ?, notifyByPush = ? WHERE id = ?;',
        [contact.name, contact.phone, contact.relationship, contact.notifyBySMS ? 1 : 0, contact.notifyByPush ? 1 : 0, contact.id],
        () => {
          setContacts(contacts.map(c => c.id === contact.id ? contact : c));
        },
        (_, error) => {
          console.error("Error updating contact:", error);
          return true;
        }
      );
    });
  };

  const deleteContact = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM contacts WHERE id = ?;',
        [id],
        () => {
          setContacts(contacts.filter(c => c.id !== id));
        },
        (_, error) => {
          console.error("Error deleting contact:", error);
          return true;
        }
      );
    });
  };

  return (
    <ContactsContext.Provider value={{ 
      contacts, 
      loading, 
      addContact, 
      updateContact, 
      deleteContact,
      refreshContacts: loadContacts
    }}>
      {children}
    </ContactsContext.Provider>
  );
};
