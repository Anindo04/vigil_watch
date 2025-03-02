import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('emercall.db');

export const EventTypes = {
  CALL: 'call',
  SOS: 'sos',
  LOCATION: 'location'
};

export const logEvent = (type, details) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO events (type, timestamp, details, notes) VALUES (?, ?, ?, ?);',
        [type, timestamp, details, ''],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          console.error("Error logging event:", error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getEvents = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM events ORDER BY timestamp DESC;',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (_, error) => {
          console.error("Error getting events:", error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateEventNotes = (id, notes) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE events SET notes = ? WHERE id = ?;',
        [notes, id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error updating event notes:", error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const deleteEvent = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM events WHERE id = ?;',
        [id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error deleting event:", error);
          reject(error);
          return true;
        }
      );
    });
  });
};
