const BASE_PATH = '/ScaledSpace';

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
    try {
      // Dynamically import components
      const [
        { NotesComponent },
        { VoiceNotesComponent },
        { RemindersComponent }
      ] = await Promise.all([
        import(`${BASE_PATH}/components/notes.js`),
        import(`${BASE_PATH}/components/voicenotes.js`),
        import(`${BASE_PATH}/components/reminders.js`)
      ]);

      // Initialize components
      this.notesComponent = new NotesComponent();
      this.voiceNotesComponent = new VoiceNotesComponent();
      this.remindersComponent = new RemindersComponent();
      
      // Setup install prompt
      this.setupInstallPrompt();
      
      // Show notes view by default
      document.getElementById('notesBtn').click();
    } catch (error) {
      console.error('Failed to load components:', error);
      // Show error message to user
      const main = document.querySelector('main');
      main.innerHTML = `
        <div class="error-message">
          <h2>Failed to load application</h2>
          <p>Please check your internet connection and try refreshing the page.</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
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