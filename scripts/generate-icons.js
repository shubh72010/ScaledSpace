const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Base icon SVG (a simple circle with a dot)
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="240" fill="black"/>
  <circle cx="256" cy="256" r="80" fill="white"/>
</svg>
`;

// Generate icons for each size
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  try {
    // Create a buffer from the SVG
    const svgBuffer = Buffer.from(svgIcon);
    
    // Generate each icon size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated icon-${size}.png`);
    }

    // Generate shortcut icons
    const noteIcon = await sharp(svgBuffer)
      .resize(96, 96)
      .png()
      .toFile(path.join(ICONS_DIR, 'note-96.png'));
    console.log('Generated note-96.png');

    const reminderIcon = await sharp(svgBuffer)
      .resize(96, 96)
      .png()
      .toFile(path.join(ICONS_DIR, 'reminder-96.png'));
    console.log('Generated reminder-96.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 