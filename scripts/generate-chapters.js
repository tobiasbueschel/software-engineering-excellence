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

  // Extract relative path from absolute URL for local use
  // e.g., "https://software-engineering-excellence.vercel.app/img/undraw_agile.svg" -> "/img/undraw_agile.svg"
  const imageUrl = frontMatter.image.replace(/^https?:\/\/[^/]+/, '');

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
