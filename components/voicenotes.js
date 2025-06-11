import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

// VoiceNotes component will handle all voice recording and playback operations
export class VoiceNotesComponent {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.currentAudio = null;
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('voiceNotesBtn').addEventListener('click', () => this.show());
  }

  async show() {
    document.getElementById('mainContent').innerHTML = this.getVoiceNotesTemplate();
    await this.loadVoiceNotes();
    this.setupRecordingEventListeners();
  }

  getVoiceNotesTemplate() {
    return `
      <div class="voicenotes-container">
        <div class="recording-controls">
          <button id="recordButton" class="primary-button">
            <span class="record-icon">●</span> Start Recording
          </button>
          <div id="recordingStatus" class="recording-status hidden">
            Recording... <span id="recordingTime">0:00</span>
          </div>
        </div>
        
        <div id="saveRecordingForm" class="save-recording-form hidden">
          <input type="text" id="recordingTitle" placeholder="Enter title for your recording" required>
          <div class="recording-actions">
            <button id="saveRecording" class="primary-button">Save Recording</button>
            <button id="discardRecording" class="secondary-button">Discard</button>
          </div>
        </div>

        <div class="voicenotes-list" id="voicenotesList">
          <!-- Voice notes will be listed here -->
        </div>
      </div>
    `;
  }

  async loadVoiceNotes() {
    const notes = await db.getAllVoiceNotes();
    this.renderVoiceNotesList(notes);
  }

  renderVoiceNotesList(notes) {
    const list = document.getElementById('voicenotesList');
    if (!list) return;

    const sortedNotes = [...notes].sort((a, b) => b.createdAt - a.createdAt);

    list.innerHTML = sortedNotes.map(note => `
      <div class="voicenote-card" data-id="${note.id}">
        <div class="voicenote-info">
          <h3>${note.title}</h3>
          <div class="voicenote-date">${helpers.formatDate(note.createdAt)}</div>
        </div>
        <div class="voicenote-controls">
          <button class="play-button" data-id="${note.id}">
            <span class="play-icon">▶</span>
          </button>
          <button class="delete-button" data-id="${note.id}">
            <span class="delete-icon">×</span>
          </button>
        </div>
        <audio id="audio-${note.id}" src="${URL.createObjectURL(note.blob)}" class="hidden"></audio>
      </div>
    `).join('');

    this.setupPlaybackEventListeners();
  }

  setupRecordingEventListeners() {
    const recordButton = document.getElementById('recordButton');
    if (!recordButton) return;

    recordButton.addEventListener('click', () => this.toggleRecording());
  }

  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.currentAudio = audioBlob;
        this.showSaveForm();
      };

      this.mediaRecorder.start();
      this.updateRecordingUI(true);
      this.startRecordingTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  }

  async stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.updateRecordingUI(false);
      this.stopRecordingTimer();
      
      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  updateRecordingUI(isRecording) {
    const recordButton = document.getElementById('recordButton');
    const recordingStatus = document.getElementById('recordingStatus');
    const saveForm = document.getElementById('saveRecordingForm');

    if (isRecording) {
      recordButton.innerHTML = '<span class="record-icon recording">●</span> Stop Recording';
      recordButton.classList.add('recording');
      recordingStatus.classList.remove('hidden');
      saveForm.classList.add('hidden');
    } else {
      recordButton.innerHTML = '<span class="record-icon">●</span> Start Recording';
      recordButton.classList.remove('recording');
      recordingStatus.classList.add('hidden');
    }
  }

  showSaveForm() {
    const saveForm = document.getElementById('saveRecordingForm');
    const saveButton = document.getElementById('saveRecording');
    const discardButton = document.getElementById('discardRecording');
    const titleInput = document.getElementById('recordingTitle');

    saveForm.classList.remove('hidden');
    titleInput.value = '';
    titleInput.focus();

    saveButton.onclick = () => this.saveRecording();
    discardButton.onclick = () => this.discardRecording();
  }

  async saveRecording() {
    const titleInput = document.getElementById('recordingTitle');
    const title = titleInput.value.trim();

    if (!title) {
      alert('Please enter a title for your recording');
      return;
    }

    const voicenote = {
      id: helpers.generateId(),
      title,
      blob: this.currentAudio,
      createdAt: Date.now()
    };

    await db.addVoiceNote(voicenote);
    this.currentAudio = null;
    document.getElementById('saveRecordingForm').classList.add('hidden');
    await this.loadVoiceNotes();
  }

  discardRecording() {
    this.currentAudio = null;
    document.getElementById('saveRecordingForm').classList.add('hidden');
  }

  setupPlaybackEventListeners() {
    document.querySelectorAll('.play-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        this.togglePlayback(id);
      });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        if (confirm('Are you sure you want to delete this recording?')) {
          await this.deleteVoiceNote(id);
        }
      });
    });
  }

  togglePlayback(id) {
    const audio = document.getElementById(`audio-${id}`);
    const button = document.querySelector(`.play-button[data-id="${id}"]`);
    
    if (audio.paused) {
      // Stop any currently playing audio
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      
      audio.play();
      button.innerHTML = '<span class="play-icon">⏸</span>';
      
      audio.onended = () => {
        button.innerHTML = '<span class="play-icon">▶</span>';
      };
    } else {
      audio.pause();
      audio.currentTime = 0;
      button.innerHTML = '<span class="play-icon">▶</span>';
    }
  }

  async deleteVoiceNote(id) {
    await db.deleteVoiceNote(id);
    await this.loadVoiceNotes();
  }

  startRecordingTimer() {
    this.recordingStartTime = Date.now();
    this.recordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timeDisplay = document.getElementById('recordingTime');
      if (timeDisplay) {
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }
} 