// Generate crawlable blog cards from the published catalog; never publish drafts here.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
    // ── Category + visual config ──────────────────────────────────
    const categoryMap = {
      'black-male-romance-authors':                      { cat: 'Relationships',  icon: '📚', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'my-love-letter-to-black-women':                    { cat: 'Relationships',  icon: '💛', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'what-black-men-think-about-love':                  { cat: 'Relationships',  icon: '❤️', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'why-i-write-black-men-loving-black-women':         { cat: 'Writing Craft',  icon: '❤️', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'character-deep-dive-malik-thompson':              { cat: 'Writing Craft', icon: '✍️', bg: 'linear-gradient(135deg,#0d1a0d,#1a2e1a)' },
      '10-signs-your-marriage-is-running-on-secrets':   { cat: 'Relationships',  icon: '💍', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      '21-brutal-questions-before-i-do':                { cat: 'Relationships',  icon: '💬', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'ya-mysteries-black-protagonists':                { cat: 'YA Fiction',     icon: '🔍', bg: 'linear-gradient(135deg,#0d0f1a,#1a1e35)' },
      'why-some-couples-survive-betrayal':              { cat: 'Relationships',  icon: '❤️', bg: 'linear-gradient(135deg,#1a0d15,#2e1a25)' },
      'family-secrets-in-fiction':                      { cat: 'Writing Craft',  icon: '📖', bg: 'linear-gradient(135deg,#0d1a0d,#1a2e1a)' },
      'long-lost-siblings-surprise-adoptions-in-literature': { cat: 'Writing Craft', icon: '🧬', bg: 'linear-gradient(135deg,#0d1a0d,#1a2e1a)' },
      'premonitions-intuition-solving-disappearances':  { cat: 'YA Fiction',     icon: '🌙', bg: 'linear-gradient(135deg,#0d0f1a,#1a1e35)' },
      'real-life-cases-missing-girls-of-color':         { cat: 'Thrillers',      icon: '🕵️', bg: 'linear-gradient(135deg,#1a0d0d,#2e1a1a)' },
      'african-american-ya-thrillers':                  { cat: 'YA Fiction',     icon: '📚', bg: 'linear-gradient(135deg,#0d0f1a,#1a1e35)' },
      'why-representation-matters-ya-thrillers':        { cat: 'YA Fiction',     icon: '✊', bg: 'linear-gradient(135deg,#0d0f1a,#1a1e35)' },
      'how-to-write-suspense-without-gore-11-05-09-am': { cat: 'Writing Craft',  icon: '⚡', bg: 'linear-gradient(135deg,#0d1a0d,#1a2e1a)' },
    };

    function buildFeatured(post, meta) {
      return `
        <a href="/${post.href}" data-category="${meta.cat}" class="featured-card" style="text-decoration:none;">
          <div class="featured-visual" style="background:${meta.bg}">
            <span class="featured-badge">Featured</span>
            <span class="featured-visual-icon">${meta.icon}</span>
          </div>
          <div class="featured-body">
            <p class="featured-cat">${meta.cat}</p>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.excerpt)}</p>
            <span class="read-link">Read Article</span>
          </div>
        </a>`;
    }

    function buildCard(post, meta) {
      return `
        <a href="/${post.href}" data-category="${meta.cat}" class="post-card">
          <div class="card-visual" style="background:${meta.bg}">
            <span style="position:relative;z-index:1;">${meta.icon}</span>
          </div>
          <div class="card-body">
            <p class="card-cat">${meta.cat}</p>
            <h2 class="card-title">${escapeHtml(post.title)}</h2>
            <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="card-footer">

              <span class="card-arrow">Read →</span>
            </div>
          </div>
        </a>`;
    }


const posts = JSON.parse(fs.readFileSync(path.join(root, 'blog/posts.json'), 'utf8'));
const fallback = { cat: 'General', icon: '📝', bg: 'linear-gradient(135deg,#0f172a,#162033)' };
for (const post of posts) {
  if (!/^blog\/[a-z0-9-]+\.html$/.test(post.href) || !fs.existsSync(path.join(root, post.href))) {
    throw new Error(`Invalid published article: ${post.href}`);
  }
}
const page = path.join(root, 'blog/index.html');
let html = fs.readFileSync(page, 'utf8');
function replaceRegion(name, content) {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const a = html.indexOf(start), b = html.indexOf(end);
  if (a < 0 || b < a) throw new Error(`Missing ${name} markers`);
  html = html.slice(0, a + start.length) + '\n' + content + '\n' + html.slice(b);
}
replaceRegion('FEATURED', posts.length ? buildFeatured(posts[0], categoryMap[posts[0].slug] || fallback) : '');
replaceRegion('POSTS', posts.slice(1).map(p => buildCard(p, categoryMap[p.slug] || fallback)).join('\n'));
fs.writeFileSync(page, html);
console.log(`Rendered ${posts.length} published article links.`);
