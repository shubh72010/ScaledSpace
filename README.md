# ScaledSpace

A minimalist, offline-first PWA for notes, voice notes, and reminders. Built with vanilla JavaScript and IndexedDB.

## Features

- 📝 Text Notes
- 🎤 Voice Notes
- ⏰ Reminders
- 📱 PWA Support
- 💾 Offline Storage
- 🎨 Nothing OS-inspired Design

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ScaledSpace.git
   cd ScaledSpace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script:
   ```bash
   npm run setup
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser

## Deployment

The app is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment process:

1. Installs dependencies
2. Generates icons
3. Deploys to the `gh-pages` branch

To deploy manually:

1. Build the app:
   ```bash
   npm run setup
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. Wait for the GitHub Action to complete

The app will be available at: `https://yourusername.github.io/ScaledSpace/`

## Browser Support

- Chrome 89+
- Edge 89+
- Firefox 89+
- Safari 15.4+

## License

MIT License - see LICENSE file for details