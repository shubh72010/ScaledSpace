import { db } from '../db/db.js';
import { helpers } from '../utils/helpers.js';

// Reminders component will handle all reminder and notification operations
export class RemindersComponent {
  constructor() {
    this.notificationPermission = 'default';
    this.checkNotificationPermission();
    this.init();
  }

  async init() {
    await db.init();
    this.setupEventListeners();
    this.startReminderCheck();
  }

  setupEventListeners() {
    document.getElementById('remindersBtn').addEventListener('click', () => this.show());
  }

  async checkNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    this.notificationPermission = Notification.permission;
    if (this.notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
    }
  }

  async show() {
    document.getElementById('mainContent').innerHTML = this.getRemindersTemplate();
    await this.loadReminders();
    this.setupReminderEventListeners();
  }

  getRemindersTemplate() {
    return `
      <div class="reminders-container">
        <div class="reminder-form-container">
          <form id="reminderForm" class="reminder-form">
            <input type="text" id="reminderTitle" placeholder="Reminder title" required>
            <textarea id="reminderDescription" placeholder="Description (optional)"></textarea>
            <div class="datetime-input">
              <input type="datetime-local" id="reminderDateTime" required>
            </div>
            <button type="submit" class="primary-button">Create Reminder</button>
          </form>
        </div>

        <div class="reminders-section">
          <h2>Upcoming Reminders</h2>
          <div id="upcomingReminders" class="reminders-list"></div>
        </div>

        <div class="reminders-section">
          <h2>Past Reminders</h2>
          <div id="pastReminders" class="reminders-list"></div>
        </div>

        ${this.notificationPermission !== 'granted' ? `
          <div class="notification-permission-banner">
            <p>Enable notifications to receive reminders</p>
            <button id="enableNotifications" class="secondary-button">Enable Notifications</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  async loadReminders() {
    const [upcoming, past] = await Promise.all([
      db.getUpcomingReminders(),
      db.getPastReminders()
    ]);

    this.renderRemindersList('upcomingReminders', upcoming, true);
    this.renderRemindersList('pastReminders', past, false);
  }

  renderRemindersList(containerId, reminders, isUpcoming) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (reminders.length === 0) {
      container.innerHTML = `<p class="no-reminders">No ${isUpcoming ? 'upcoming' : 'past'} reminders</p>`;
      return;
    }

    container.innerHTML = reminders.map(reminder => `
      <div class="reminder-card" data-id="${reminder.id}">
        <div class="reminder-info">
          <h3>${reminder.title}</h3>
          ${reminder.description ? `<p class="reminder-description">${reminder.description}</p>` : ''}
          <div class="reminder-time">
            ${helpers.formatDate(reminder.scheduledAt)}
            ${isUpcoming ? `<span class="time-until">(${this.getTimeUntil(reminder.scheduledAt)})</span>` : ''}
          </div>
        </div>
        <div class="reminder-actions">
          ${isUpcoming ? `
            <button class="delete-button" data-id="${reminder.id}">
              <span class="delete-icon">×</span>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  setupReminderEventListeners() {
    const form = document.getElementById('reminderForm');
    const enableNotificationsBtn = document.getElementById('enableNotifications');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.createReminder();
      });
    }

    if (enableNotificationsBtn) {
      enableNotificationsBtn.addEventListener('click', async () => {
        await this.checkNotificationPermission();
        if (this.notificationPermission === 'granted') {
          document.querySelector('.notification-permission-banner').remove();
        }
      });
    }

    // Setup delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        if (confirm('Are you sure you want to delete this reminder?')) {
          await this.deleteReminder(id);
        }
      });
    });
  }

  async createReminder() {
    const title = document.getElementById('reminderTitle').value.trim();
    const description = document.getElementById('reminderDescription').value.trim();
    const scheduledAt = new Date(document.getElementById('reminderDateTime').value).getTime();

    if (scheduledAt <= Date.now()) {
      alert('Please select a future date and time');
      return;
    }

    const reminder = {
      id: helpers.generateId(),
      title,
      description,
      scheduledAt,
      createdAt: Date.now()
    };

    await db.addReminder(reminder);
    document.getElementById('reminderForm').reset();
    await this.loadReminders();
  }

  async deleteReminder(id) {
    await db.deleteReminder(id);
    await this.loadReminders();
  }

  getTimeUntil(timestamp) {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) return 'Past due';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days} day${days === 1 ? '' : 's'}`;
    if (hours > 0) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
    if (minutes > 0) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
    return 'Less than a minute';
  }

  startReminderCheck() {
    // Check for due reminders every minute
    setInterval(async () => {
      if (this.notificationPermission !== 'granted') return;

      const reminders = await db.getUpcomingReminders();
      const now = Date.now();

      reminders.forEach(reminder => {
        // Notify if reminder is due within the next minute
        if (reminder.scheduledAt <= now + 60000 && reminder.scheduledAt > now - 60000) {
          this.showNotification(reminder);
        }
      });
    }, 60000); // Check every minute
  }

  showNotification(reminder) {
    if (this.notificationPermission !== 'granted') return;

    const notification = new Notification(reminder.title, {
      body: reminder.description || 'Time for your reminder!',
      icon: '/assets/icons/icon-192.png',
      tag: reminder.id // Prevent duplicate notifications
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
} 