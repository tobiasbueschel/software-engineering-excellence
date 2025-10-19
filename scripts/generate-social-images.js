const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const matter = require('gray-matter');

// Social media image dimensions (Open Graph standard)
const WIDTH = 1200;
const HEIGHT = 630;

// Gradient colors from your theme
const GRADIENT_START = '#d0cdff'; // --ifm-color-primary-lightest
const GRADIENT_END = '#9e98ff'; // --ifm-color-primary-lighter

// Text colors
const TEXT_PRIMARY = '#2e3440'; // Dark text for title
const TEXT_SECONDARY = '#4c566a'; // Slightly lighter for description

// Directories
const SVG_DIR = path.join(__dirname, '../static/img');
const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_DIR = path.join(__dirname, '../static/img/social');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created directory: ${OUTPUT_DIR}`);
}

/**
 * Find the MDX file that uses this SVG image
 */
function findMdxForSvg(svgFileName) {
  const mdxFiles = fs.readdirSync(DOCS_DIR).filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));

  for (const mdxFile of mdxFiles) {
    const mdxPath = path.join(DOCS_DIR, mdxFile);
    const content = fs.readFileSync(mdxPath, 'utf-8');
    const { data: frontMatter } = matter(content);

    // Check if this MDX uses this SVG (convert PNG path back to SVG)
    if (frontMatter.image && frontMatter.image.includes(svgFileName.replace('.svg', '.png'))) {
      return {
        title: frontMatter.title || 'Software Engineering Excellence',
        description: frontMatter.description || '',
      };
    }
  }

  return null;
}

/**
 * Wrap text to fit within a specified width
 */
function wrapText(text, maxCharsPerLine) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Escape XML special characters for SVG text
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

    // Get page metadata
    const metadata = findMdxForSvg(svgFileName);
    if (!metadata) {
      console.log(`  ⚠️  No MDX file found for ${svgFileName}, skipping...`);
      return;
    }

    // Read the original SVG
    const originalSvg = fs.readFileSync(svgPath, 'utf-8');

    // Get SVG dimensions using sharp
    const svgMetadata = await sharp(svgPath).metadata();
    const svgWidth = svgMetadata.width || 500;
    const svgHeight = svgMetadata.height || 500;

    // Layout: Allow text to extend across most of the width, illustration overlaps on right
    const padding = 80;
    const textMaxWidth = WIDTH * 0.7; // 70% of width for text area
    const illustrationAreaWidth = WIDTH * 0.45; // Illustration takes 45% from right

    // Calculate illustration dimensions
    const maxIllustrationWidth = illustrationAreaWidth - padding / 2;
    const maxIllustrationHeight = HEIGHT - padding * 2;

    const scale = Math.min(maxIllustrationWidth / svgWidth, maxIllustrationHeight / svgHeight, 0.75);
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;

    // Position illustration on the right side (centered vertically), closer to edge
    const illustrationX = WIDTH - scaledWidth - padding / 2;
    const illustrationY = (HEIGHT - scaledHeight) / 2;

    // Prepare text content
    const title = escapeXml(metadata.title);
    const description = escapeXml(metadata.description);

    // Typography settings
    const titleFontSize = 56;
    const descriptionFontSize = 24;
    const titleLineHeight = titleFontSize * 1.15;
    const descriptionLineHeight = descriptionFontSize * 1.6;

    // Wrap title text (max chars per line based on font size and available width)
    const titleMaxChars = Math.floor((textMaxWidth - padding * 2) / (titleFontSize * 0.55));
    const titleLines = wrapText(title, titleMaxChars);
    const maxTitleLines = 2; // Limit title to 2 lines
    const truncatedTitle = titleLines.slice(0, maxTitleLines);
    if (titleLines.length > maxTitleLines) {
      // Truncate last word and add ellipsis
      const lastLine = truncatedTitle[maxTitleLines - 1];
      truncatedTitle[maxTitleLines - 1] = lastLine.substring(0, lastLine.length - 3) + '...';
    }

    // Calculate starting Y position for title (vertically centered with content)
    const titleStartY = 180;
    const titleBlockHeight = truncatedTitle.length * titleLineHeight;

    // Wrap description text
    const descriptionMaxChars = Math.floor((textMaxWidth - padding * 2) / (descriptionFontSize * 0.55));
    const descriptionLines = wrapText(description, descriptionMaxChars);
    const maxDescriptionLines = 3;
    const truncatedDescription = descriptionLines.slice(0, maxDescriptionLines);
    if (descriptionLines.length > maxDescriptionLines) {
      const lastLine = truncatedDescription[maxDescriptionLines - 1];
      truncatedDescription[maxDescriptionLines - 1] = lastLine.substring(0, lastLine.length - 3) + '...';
    }

    const descriptionStartY = titleStartY + titleBlockHeight + 40;

    // Generate text SVG elements with proper line wrapping
    const titleElements = truncatedTitle
      .map(
        (line, index) => `
      <text x="${padding}" y="${titleStartY + index * titleLineHeight}"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
            font-size="${titleFontSize}"
            font-weight="700"
            fill="${TEXT_PRIMARY}">
        ${line}
      </text>
    `
      )
      .join('');

    const descriptionElements = truncatedDescription
      .map(
        (line, index) => `
      <text x="${padding}" y="${descriptionStartY + index * descriptionLineHeight}"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
            font-size="${descriptionFontSize}"
            font-weight="400"
            fill="${TEXT_SECONDARY}">
        ${line}
      </text>
    `
      )
      .join('');

    const textElements = titleElements + descriptionElements;

    // Create composite SVG with gradient, illustration (back), and text (front for overlap)
    const compositeSvg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${GRADIENT_START};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${GRADIENT_END};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)" />
        <g transform="translate(${illustrationX}, ${illustrationY}) scale(${scale})" opacity="0.95">
          ${originalSvg
            .replace(/<\?xml[^?]*\?>/g, '')
            .replace(/<svg[^>]*>/i, '')
            .replace(/<\/svg>/i, '')}
        </g>
        ${textElements}
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
