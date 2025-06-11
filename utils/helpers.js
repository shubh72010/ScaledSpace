// Utility functions for the application
export const helpers = {
  // Will contain common utility functions used across components
  formatDate: (date) => {
    return new Date(date).toLocaleString();
  },
  
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}; 