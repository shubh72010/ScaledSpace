import { NotesComponent } from '../components/notes.js';
import { VoiceNotesComponent } from '../components/voicenotes.js';
import { RemindersComponent } from '../components/reminders.js';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log("Service Worker Registered!"))
    .catch(err => console.error("Service Worker Registration Failed:", err));
}

// App initialization
class App {
  constructor() {
    this.notesComponent = null;
    this.voiceNotesComponent = null;
    this.remindersComponent = null;
    this.init();
  }

  async init() {
    // Initialize components
    this.notesComponent = new NotesComponent();
    this.voiceNotesComponent = new VoiceNotesComponent();
    this.remindersComponent = new RemindersComponent();
    
    // Show notes view by default
    document.getElementById('notesBtn').click();
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
}); 