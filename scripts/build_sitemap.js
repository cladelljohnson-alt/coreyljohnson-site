// Build a sitemap from public site pages and the published blog catalog.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://coreyljohnson.com';
const pages = [
  'index.html',
  'books.html',
  'about.html',
  'news.html',
  'contact.html',
  'black-male-romance-author/index.html',
  'blog/index.html',
];
const posts = JSON.parse(fs.readFileSync(path.join(root, 'blog/posts.json'), 'utf8'));
pages.push(...posts.map(post => post.href));

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const urls = pages.map(page => {
  if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html$/.test(page)) {
    throw new Error(`Invalid published page path: ${page}`);
  }
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const fallback = page === 'index.html' ? '/' : page.endsWith('/index.html') ? `/${page.slice(0, -10)}` : `/${page}`;
  const url = canonical || origin + fallback;
  if (!url.startsWith(origin + '/') || new URL(url).host !== 'coreyljohnson.com') {
    throw new Error(`Unexpected canonical URL in ${page}: ${url}`);
  }
  return url;
});

if (new Set(urls).size !== urls.length) throw new Error('Duplicate sitemap URL');
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Generated sitemap with ${urls.length} public URLs.`);
