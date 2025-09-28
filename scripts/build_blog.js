#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const draftsDir = path.join(rootDir, 'drafts');
  const blogDir = path.join(rootDir, 'blog');
  const indexPath = path.join(rootDir, 'index.html');

  await fs.mkdir(blogDir, { recursive: true });

  const entries = await fs.readdir(draftsDir, { withFileTypes: true });
  const slugCounts = new Map();
  const posts = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.html')) continue;

    const sourcePath = path.join(draftsDir, entry.name);
    const html = await fs.readFile(sourcePath, 'utf8');

    const baseName = entry.name.replace(/\.html$/i, '');
    const baseSlug = slugify(baseName);
    const slug = ensureUniqueSlug(baseSlug, slugCounts);
    const destinationPath = path.join(blogDir, `${slug}.html`);
    await fs.writeFile(destinationPath, html, 'utf8');

    const title = extractTitle(html) || toTitleCase(slug.replace(/-/g, ' '));
    const description = extractDescription(html);
    const paragraph = extractFirstParagraph(html);
    const excerptSource = description || paragraph || '';
    const excerpt = shortenExcerpt(cleanupWhitespace(excerptSource));

    posts.push({
      slug,
      title: cleanupWhitespace(title),
      excerpt,
      href: `blog/${slug}.html`,
    });
  }

  posts.sort((a, b) => a.title.localeCompare(b.title));

  const metadataPath = path.join(blogDir, 'posts.json');
  await fs.writeFile(metadataPath, JSON.stringify(posts, null, 2) + '\n', 'utf8');

  await updateIndex(indexPath, posts);

  console.log(`Processed ${posts.length} post${posts.length === 1 ? '' : 's'}.`);
}

function slugify(input) {
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
  return slug || 'post';
}

function ensureUniqueSlug(slug, map) {
  if (!map.has(slug)) {
    map.set(slug, 1);
    return slug;
  }
  const count = map.get(slug);
  map.set(slug, count + 1);
  return `${slug}-${count}`;
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return cleanupWhitespace(decodeEntities(stripHtml(titleMatch[1])));
  }
  const headingMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (headingMatch) {
    return cleanupWhitespace(decodeEntities(stripHtml(headingMatch[1])));
  }
  return '';
}

function extractDescription(html) {
  const metaRegex = /<meta[^>]*name=["']description["'][^>]*>/gi;
  const metaMatch = metaRegex.exec(html);
  if (metaMatch) {
    const contentMatch = metaMatch[0].match(/content=(["'])([\s\S]*?)\1/i);
    if (contentMatch) {
      return cleanupWhitespace(decodeEntities(contentMatch[2]));
    }
  }
  return '';
}

function extractFirstParagraph(html) {
  const paragraphMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraphMatch) {
    return cleanupWhitespace(decodeEntities(stripHtml(paragraphMatch[1])));
  }
  return '';
}

function cleanupWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, '');
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;|&#8217;/gi, '\u2019')
    .replace(/&lsquo;|&#8216;/gi, '\u2018')
    .replace(/&ldquo;|&#8220;/gi, '\u201c')
    .replace(/&rdquo;|&#8221;/gi, '\u201d')
    .replace(/&ndash;|&#8211;/gi, '\u2013')
    .replace(/&mdash;|&#8212;/gi, '\u2014')
    .replace(/&hellip;|&#8230;/gi, '\u2026');
}

function shortenExcerpt(text, maxLength = 200) {
  if (text.length <= maxLength) {
    return text;
  }
  let truncated = text.slice(0, maxLength - 1);
  truncated = truncated.replace(/\s+\S*$/, '');
  truncated = truncated.replace(/[\s,;:]+$/, '');
  truncated = truncated.replace(/["'\u201c\u201d]+$/, '');
  return `${truncated}…`;
}

function toTitleCase(text) {
  return text.replace(/\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1));
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateBlogMarkup(posts, indent = '      ') {
  const lines = [];
  lines.push(`${indent}<div class="grid md:grid-cols-3 gap-10">`);

  if (posts.length === 0) {
    lines.push(`${indent}  <p class="text-gray-400">No blog posts available yet. Check back soon!</p>`);
  } else {
    for (const post of posts) {
      lines.push(`${indent}  <article class="card shadow-lg overflow-hidden p-6 transition duration-300 transform hover:shadow-xl hover:-translate-y-1">`);
      lines.push(`${indent}    <h3 class="text-xl font-semibold mb-3">${escapeHtml(post.title)}</h3>`);
      lines.push(`${indent}    <p class="mb-4">${escapeHtml(post.excerpt)}</p>`);
      lines.push(`${indent}    <a href="${post.href}" class="font-medium">Read More →</a>`);
      lines.push(`${indent}  </article>`);
      lines.push('');
    }
    if (posts.length > 0) {
      lines.pop();
    }
  }

  lines.push(`${indent}</div>`);
  return lines.join('\n');
}

async function updateIndex(indexPath, posts) {
  const startMarker = '<!-- BLOG:START -->';
  const endMarker = '<!-- BLOG:END -->';

  let indexHtml = await fs.readFile(indexPath, 'utf8');
  const startIndex = indexHtml.indexOf(startMarker);
  const endIndex = indexHtml.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error('Blog markers not found in index.html');
  }

  const startLineStart = indexHtml.lastIndexOf('\n', startIndex);
  const startIndent = startLineStart === -1 ? '' : indexHtml.slice(startLineStart + 1, startIndex);
  const indent = startIndent.replace(/[^\s]/g, '') || startIndent;

  const generated = generateBlogMarkup(posts, indent);
  const before = indexHtml.slice(0, startIndex + startMarker.length);
  const after = indexHtml.slice(endIndex + endMarker.length);
  const replacement = `${before}\n${generated}\n${indent}${endMarker}${after}`;
  await fs.writeFile(indexPath, replacement, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
