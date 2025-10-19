const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Social media image dimensions (Open Graph standard)
const WIDTH = 1200;
const HEIGHT = 630;

// Gradient colors from your theme
const GRADIENT_START = '#d0cdff'; // --ifm-color-primary-lightest
const GRADIENT_END = '#9e98ff'; // --ifm-color-primary-lighter

// Directories
const SVG_DIR = path.join(__dirname, '../static/img');
const OUTPUT_DIR = path.join(__dirname, '../static/img/social');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created directory: ${OUTPUT_DIR}`);
}

async function generateSocialImage(svgFileName) {
  try {
    const svgPath = path.join(SVG_DIR, svgFileName);
    const outputPath = path.join(OUTPUT_DIR, svgFileName.replace('.svg', '.png'));

    // Skip if not an SVG file
    if (!svgFileName.endsWith('.svg')) {
      return;
    }

    // Skip if not an undraw illustration (only process cover images)
    if (!svgFileName.startsWith('undraw_')) {
      return;
    }

    console.log(`Processing: ${svgFileName}...`);

    // Read the original SVG
    const originalSvg = fs.readFileSync(svgPath, 'utf-8');

    // Get SVG dimensions
    const widthMatch = originalSvg.match(/width="(\d+)"/);
    const heightMatch = originalSvg.match(/height="(\d+)"/);
    const viewBoxMatch = originalSvg.match(/viewBox="([^"]+)"/);

    let svgWidth = 500;
    let svgHeight = 500;

    if (viewBoxMatch) {
      const viewBox = viewBoxMatch[1].split(' ');
      svgWidth = parseFloat(viewBox[2]);
      svgHeight = parseFloat(viewBox[3]);
    } else if (widthMatch && heightMatch) {
      svgWidth = parseFloat(widthMatch[1]);
      svgHeight = parseFloat(heightMatch[1]);
    }

    // Calculate dimensions to fit the image (with padding)
    const padding = 100;
    const maxWidth = WIDTH - padding * 2;
    const maxHeight = HEIGHT - padding * 2;

    const scale = Math.min(maxWidth / svgWidth, maxHeight / svgHeight, 1);
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;

    // Center the image
    const x = (WIDTH - scaledWidth) / 2;
    const y = (HEIGHT - scaledHeight) / 2;

    // Create an SVG with gradient background and embedded illustration
    const compositeSvg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${GRADIENT_START};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${GRADIENT_END};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)" />
        <g transform="translate(${x}, ${y}) scale(${scale})">
          ${originalSvg
            .replace(/<\?xml[^?]*\?>/g, '')
            .replace(/<svg[^>]*>/i, '')
            .replace(/<\/svg>/i, '')}
        </g>
      </svg>
    `;

    // Convert to PNG using sharp
    await sharp(Buffer.from(compositeSvg)).png().toFile(outputPath);

    console.log(`  ✅ Generated: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`  ❌ Error processing ${svgFileName}:`, error.message);
  }
}

async function generateAllImages() {
  console.log('🎨 Generating social media cover images...\n');

  const files = fs.readdirSync(SVG_DIR);
  const svgFiles = files.filter((file) => file.startsWith('undraw_') && file.endsWith('.svg'));

  console.log(`Found ${svgFiles.length} SVG files to process\n`);

  for (const file of svgFiles) {
    await generateSocialImage(file);
  }

  console.log(`\n✅ Complete! Generated ${svgFiles.length} social media images in ${OUTPUT_DIR}`);
}

// Run the script
generateAllImages().catch(console.error);
