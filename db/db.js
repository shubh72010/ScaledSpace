// IndexedDB initialization and database operations will be implemented here
// This will handle all data persistence for notes, voice notes, and reminders 

const DB_NAME = 'scaledspaceDB';
const DB_VERSION = 3; // Increment version for new store
const NOTES_STORE = 'notes';
const VOICENOTES_STORE = 'voicenotes';
const REMINDERS_STORE = 'reminders';

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create notes store if it doesn't exist
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('title', 'title', { unique: false });
        }

        // Create voicenotes store if it doesn't exist
        if (!db.objectStoreNames.contains(VOICENOTES_STORE)) {
          const voicenotesStore = db.createObjectStore(VOICENOTES_STORE, { keyPath: 'id' });
          voicenotesStore.createIndex('createdAt', 'createdAt', { unique: false });
          voicenotesStore.createIndex('title', 'title', { unique: false });
        }

        // Create reminders store if it doesn't exist
        if (!db.objectStoreNames.contains(REMINDERS_STORE)) {
          const remindersStore = db.createObjectStore(REMINDERS_STORE, { keyPath: 'id' });
          remindersStore.createIndex('scheduledAt', 'scheduledAt', { unique: false });
          remindersStore.createIndex('createdAt', 'createdAt', { unique: false });
          remindersStore.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  async addNote(note) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.add(note);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateNote(note) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.put(note);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllNotes() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchNotes(query) {
    const notes = await this.getAllNotes();
    const searchTerm = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Voice Notes Methods
  async addVoiceNote(voicenote) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([VOICENOTES_STORE], 'readwrite');
      const store = transaction.objectStore(VOICENOTES_STORE);
      const request = store.add(voicenote);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateVoiceNote(voicenote) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([VOICENOTES_STORE], 'readwrite');
      const store = transaction.objectStore(VOICENOTES_STORE);
      const request = store.put(voicenote);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVoiceNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([VOICENOTES_STORE], 'readwrite');
      const store = transaction.objectStore(VOICENOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getVoiceNote(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([VOICENOTES_STORE], 'readonly');
      const store = transaction.objectStore(VOICENOTES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllVoiceNotes() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([VOICENOTES_STORE], 'readonly');
      const store = transaction.objectStore(VOICENOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchVoiceNotes(query) {
    const notes = await this.getAllVoiceNotes();
    const searchTerm = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm)
    );
  }

  // Reminders Methods
  async addReminder(reminder) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([REMINDERS_STORE], 'readwrite');
      const store = transaction.objectStore(REMINDERS_STORE);
      const request = store.add(reminder);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateReminder(reminder) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([REMINDERS_STORE], 'readwrite');
      const store = transaction.objectStore(REMINDERS_STORE);
      const request = store.put(reminder);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReminder(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([REMINDERS_STORE], 'readwrite');
      const store = transaction.objectStore(REMINDERS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getReminder(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([REMINDERS_STORE], 'readonly');
      const store = transaction.objectStore(REMINDERS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReminders() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([REMINDERS_STORE], 'readonly');
      const store = transaction.objectStore(REMINDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUpcomingReminders() {
    const reminders = await this.getAllReminders();
    const now = Date.now();
    return reminders
      .filter(reminder => reminder.scheduledAt > now)
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  }

  async getPastReminders() {
    const reminders = await this.getAllReminders();
    const now = Date.now();
    return reminders
      .filter(reminder => reminder.scheduledAt <= now)
      .sort((a, b) => b.scheduledAt - a.scheduledAt);
  }
}

// Export a singleton instance
export const db = new Database(); 