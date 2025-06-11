const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required directories
const dirs = [
  'assets/icons',
  'components',
  'db',
  'utils',
  'scripts'
];

// Required component files
const componentFiles = {
  'components/notes.js': `import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

export class NotesComponent {
  constructor() {
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('notesBtn').addEventListener('click', () => this.show());
  }

  show() {
    document.getElementById('mainContent').innerHTML = '<p>Notes component loaded</p>';
  }
}`,
  'components/voicenotes.js': `import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

export class VoiceNotesComponent {
  constructor() {
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('voiceNotesBtn').addEventListener('click', () => this.show());
  }

  show() {
    document.getElementById('mainContent').innerHTML = '<p>Voice Notes component loaded</p>';
  }
}`,
  'components/reminders.js': `import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

export class RemindersComponent {
  constructor() {
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('remindersBtn').addEventListener('click', () => this.show());
  }

  show() {
    document.getElementById('mainContent').innerHTML = '<p>Reminders component loaded</p>';
  }
}`
};

// Required utility files
const utilityFiles = {
  'utils/helpers.js': `export const helpers = {
  generateId() {
    return crypto.randomUUID();
  },
  
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
};`
};

// Create directories
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create component files
Object.entries(componentFiles).forEach(([file, content]) => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${file}`);
  }
});

// Create utility files
Object.entries(utilityFiles).forEach(([file, content]) => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${file}`);
  }
});

// Install dependencies and generate icons
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('Generating icons...');
execSync('npm run generate-icons', { stdio: 'inherit' });

console.log('\nSetup complete! All required files and directories have been created.');
console.log('You can now run the app using a local server.'); 