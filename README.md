# Corey L. Johnson Author Site

Static marketing site for author Corey L. Johnson.

## Blog publishing workflow

Draft blog posts live in [`drafts/`](drafts/). Run the automated build before deploying to regenerate the public blog pages and update the homepage card grid.

```bash
npm install  # only needed once to set up Node
npm run build-blog
```

The `build-blog` script will:

1. Scan `drafts/*.html` for posts, extract the title and description (falling back to the first `<h1>` / `<p>` when needed), and copy each file into [`blog/`](blog/).
2. Emit `blog/posts.json` containing `{ slug, title, excerpt, href }` metadata for every published post.
3. Regenerate the blog card markup inside the `<!-- BLOG:START -->` / `<!-- BLOG:END -->` markers in `index.html` so the homepage stays synchronized with the published posts.

Commit the updated files after running the build to keep the repository in sync with what ships.

## Regenerate the blog hub

After updating the published catalog in `blog/posts.json`, run `npm run build-blog-index` and commit `blog/index.html`. This renders article links directly into HTML, preserving the existing featured article and category filters. It validates destinations and does not publish drafts. The blog remains readable when JavaScript or JSON requests are unavailable.

## Sitemap

After changing published pages or `blog/posts.json`, run `npm run build-sitemap` and commit `sitemap.xml`. The generator lists public site pages and published blog entries, using each page's canonical URL where available. Drafts are excluded. `robots.txt` advertises the sitemap to crawlers.
