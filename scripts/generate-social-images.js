const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

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

    // Create canvas
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Create gradient background (135deg diagonal)
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, GRADIENT_START);
    gradient.addColorStop(1, GRADIENT_END);

    // Fill background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Load and draw SVG
    const image = await loadImage(svgPath);

    // Calculate dimensions to fit the image (with padding)
    const padding = 100;
    const maxWidth = WIDTH - padding * 2;
    const maxHeight = HEIGHT - padding * 2;

    let imgWidth = image.width;
    let imgHeight = image.height;

    // Scale to fit
    const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
    imgWidth *= scale;
    imgHeight *= scale;

    // Center the image
    const x = (WIDTH - imgWidth) / 2;
    const y = (HEIGHT - imgHeight) / 2;

    // Draw the SVG
    ctx.drawImage(image, x, y, imgWidth, imgHeight);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

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
