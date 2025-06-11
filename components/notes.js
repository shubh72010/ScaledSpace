import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

// Notes component will handle all text-based note operations
export class NotesComponent {
  constructor() {
    this.currentView = 'list'; // 'list' or 'edit'
    this.currentNote = null;
    this.notes = [];
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Navigation button
    document.getElementById('notesBtn').addEventListener('click', () => this.show());

    // Search and sort controls
    document.getElementById('searchNotes').addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById('sortNotes').addEventListener('change', (e) => this.handleSort(e.target.value));

    // New note button
    document.getElementById('newNoteBtn').addEventListener('click', () => this.showEditView());
  }

  async show() {
    document.getElementById('mainContent').innerHTML = this.getNotesTemplate();
    await this.loadNotes();
    this.setupNoteEventListeners();
  }

  getNotesTemplate() {
    return `
      <div class="notes-container">
        <div class="notes-controls">
          <input type="text" id="searchNotes" placeholder="Search notes..." class="search-input">
          <select id="sortNotes" class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <button id="newNoteBtn" class="primary-button">New Note</button>
        </div>
        <div id="notesList" class="notes-list"></div>
      </div>
    `;
  }

  getEditTemplate(note = null) {
    const isEditing = note !== null;
    return `
      <div class="note-edit-container">
        <form id="noteForm" class="note-form">
          <input type="text" id="noteTitle" placeholder="Title" value="${note?.title || ''}" required>
          <textarea id="noteContent" placeholder="Write your note here..." required>${note?.content || ''}</textarea>
          <input type="text" id="noteTags" placeholder="Tags (comma-separated)" value="${note?.tags?.join(', ') || ''}">
          <div class="note-actions">
            <button type="submit" class="primary-button">${isEditing ? 'Save' : 'Create'}</button>
            <button type="button" id="cancelEdit" class="secondary-button">Cancel</button>
            ${isEditing ? `<button type="button" id="deleteNote" class="danger-button">Delete</button>` : ''}
          </div>
        </form>
      </div>
    `;
  }

  async loadNotes() {
    this.notes = await db.getAllNotes();
    this.renderNotesList();
  }

  renderNotesList() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    const sortedNotes = [...this.notes].sort((a, b) => {
      const sortOrder = document.getElementById('sortNotes').value;
      return sortOrder === 'newest' 
        ? b.createdAt - a.createdAt 
        : a.createdAt - b.createdAt;
    });

    notesList.innerHTML = sortedNotes.map(note => `
      <div class="note-card" data-id="${note.id}">
        <h3>${note.title}</h3>
        <p class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
        <div class="note-tags">
          ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="note-date">${helpers.formatDate(note.createdAt)}</div>
      </div>
    `).join('');
  }

  showEditView(note = null) {
    this.currentView = 'edit';
    this.currentNote = note;
    document.getElementById('mainContent').innerHTML = this.getEditTemplate(note);
    this.setupEditEventListeners();
  }

  setupNoteEventListeners() {
    document.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        const noteId = e.currentTarget.dataset.id;
        const note = await db.getNote(noteId);
        this.showEditView(note);
      });
    });
  }

  setupEditEventListeners() {
    const form = document.getElementById('noteForm');
    const cancelBtn = document.getElementById('cancelEdit');
    const deleteBtn = document.getElementById('deleteNote');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveNote();
    });

    cancelBtn.addEventListener('click', () => this.show());

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this note?')) {
          await this.deleteNote();
        }
      });
    }
  }

  async saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const tags = document.getElementById('noteTags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const note = {
      id: this.currentNote?.id || helpers.generateId(),
      title,
      content,
      tags,
      createdAt: this.currentNote?.createdAt || Date.now()
    };

    if (this.currentNote) {
      await db.updateNote(note);
    } else {
      await db.addNote(note);
    }

    this.show();
  }

  async deleteNote() {
    if (!this.currentNote) return;
    await db.deleteNote(this.currentNote.id);
    this.show();
  }

  async handleSearch(query) {
    if (!query) {
      await this.loadNotes();
      return;
    }
    this.notes = await db.searchNotes(query);
    this.renderNotesList();
  }

  handleSort() {
    this.renderNotesList();
  }
} 