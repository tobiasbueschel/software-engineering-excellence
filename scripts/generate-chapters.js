const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, '../docs');
const outputFile = path.join(__dirname, '../src/data/chapters.json');

// Read all MDX files from docs directory
const files = fs.readdirSync(docsDir).filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));

const chapters = [];

files.forEach((file) => {
  const filePath = path.join(docsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontMatter } = matter(content);

  // Skip files without required metadata or specific files
  if (
    !frontMatter.id ||
    frontMatter.id === 'introduction' ||
    frontMatter.id === 'contributors' ||
    !frontMatter.image ||
    !frontMatter.description
  ) {
    return;
  }

  // Extract relative path from absolute URL
  // e.g., "https://software-engineering-excellence.vercel.app/img/social/undraw_agile.png" -> "/img/social/undraw_agile.png"
  let imageUrl = frontMatter.image.replace(/^https?:\/\/[^/]+/, '');

  // Convert PNG social image path back to SVG for frontend use
  // e.g., "/img/social/undraw_agile.png" -> "/img/undraw_agile.svg"
  if (imageUrl.includes('/img/social/')) {
    imageUrl = imageUrl.replace('/img/social/', '/img/').replace('.png', '.svg');
  }

  chapters.push({
    id: frontMatter.id,
    title: frontMatter.title,
    imageUrl: imageUrl,
    path: frontMatter.slug || `/${frontMatter.id}`,
    description: frontMatter.description,
  });
});

// Sort alphabetically by title
chapters.sort((a, b) => a.title.localeCompare(b.title));

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to JSON file
fs.writeFileSync(outputFile, JSON.stringify(chapters, null, 2));

console.log(`✅ Generated ${chapters.length} chapters in ${outputFile}`);
