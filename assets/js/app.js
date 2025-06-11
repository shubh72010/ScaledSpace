import { NotesComponent } from '/components/notes.js';
import { VoiceNotesComponent } from '/components/voicenotes.js';
import { RemindersComponent } from '/components/reminders.js';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker Registered!"))
    .catch(err => console.error("Service Worker Registration Failed:", err));
}

// App initialization
class App {
  constructor() {
    this.notesComponent = null;
    this.voiceNotesComponent = null;
    this.remindersComponent = null;
    this.deferredPrompt = null;
    this.init();
  }

  async init() {
    // Initialize components
    this.notesComponent = new NotesComponent();
    this.voiceNotesComponent = new VoiceNotesComponent();
    this.remindersComponent = new RemindersComponent();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Show notes view by default
    document.getElementById('notesBtn').click();
  }

  setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Show the install button
      this.showInstallButton();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  showInstallButton() {
    const header = document.querySelector('header');
    if (!header.querySelector('.install-button')) {
      const installButton = document.createElement('button');
      installButton.className = 'install-button';
      installButton.innerHTML = `
        <span class="install-icon">📱</span>
        Install App
      `;
      installButton.addEventListener('click', () => this.installApp());
      header.appendChild(installButton);
    }
  }

  hideInstallButton() {
    const installButton = document.querySelector('.install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We no longer need the prompt
    this.deferredPrompt = null;

    // Hide the install button
    this.hideInstallButton();
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
}); 