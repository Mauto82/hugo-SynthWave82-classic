# SynthWave82 Classic

A synthwave / retrowave theme for [Hugo](https://gohugo.io): neon colors, retro heroes and fast, lightweight pages.

The original theme of [MAuToBlog](https://mautoblog.com), from December 2023 to October 2026, published as it was in production on 14 October 2026.

## Features

- **Multilingual** out of the box (Italian and English included), with hreflang, a language switcher and per-language taxonomies
- **Client-side search** over posts, tags, categories and authors, with live suggestions
- **Guides**: posts with a `tutorial` param are grouped into series on a dedicated page
- **Archive** grouped by year and month, related posts, sticky share bar, reading time
- **SEO**: canonical URLs, JSON-LD structured data, Open Graph, clean sitemap with alternates, `noindex` for thin pages
- **AI-agent friendly**: [`/llms.txt`](https://llmstxt.org) and a Markdown version of every page (`<url>/index.md`)
- **Privacy-friendly**: self-hosted fonts, no cookies, optional consent banner (stored in `localStorage`)
- **Optional integrations**, all off by default: Umami Analytics, Giscus comments, Netlify Forms contact form, Netlify Image CDN, MathJax
- **Hooks** to add your own scripts without touching the theme

## Requirements

Hugo **0.146.0** or later (the extended version is not required).

## Quick start

```bash
cd your-site
git clone https://github.com/Mauto82/hugo-SynthWave82-classic themes/synthwave82-classic
```

Then set `theme = "synthwave82-classic"` in your config. The fastest way to start is to copy [`exampleSite/hugo.toml`](exampleSite/hugo.toml) and the pages in [`exampleSite/content`](exampleSite/content).

To try the theme on its own:

```bash
cd themes/synthwave82-classic
hugo server -s exampleSite --themesDir ../..
```

## Configuration

### Outputs

Add these to your site config to enable search, `llms.txt` and the Markdown pages (the output formats themselves are defined by the theme):

```toml
[outputs]
  home = ["HTML", "RSS", "JSON", "llms"]
  page = ["HTML", "markdown"]
```

### Special pages

Create these pages in `content/` with the matching `layout`:

| Page | `layout` | Notes |
|---|---|---|
| Archive | `archives` | All posts by year and month |
| Guides | `tutorials` | Groups posts by their `tutorial` param |
| Search | `search` | Needs the `JSON` output on the home page |
| About, Privacy… | `service-page` | Simple text page |
| Contact | `contact-page` | Text plus the contact form |

### Params

| Param | Default | Description |
|---|---|---|
| `shortTitle` | `SynthWave82` | Short site name used in titles, structured data and `llms.txt` |
| `logoHTML` | `shortTitle` | Navbar logo. HTML is allowed: wrap letters in `<span class="eyes">` to make them blink |
| `description` | — | Site description (meta, Open Graph, `llms.txt` fallback) |
| `author.name`, `author.url` | — | Default post author |
| `social` | — | List of `{ name, label, icon, url }` shown in the footer and in `llms.txt` |
| `hero.home`, `hero.archives`, `hero.categories`, `hero.guides`, `hero.search` | theme images | Hero image paths (relative to `static/`) |
| `categoryTaxonomy` | `categories` | Plural name of the categories taxonomy. Set it per language if you translate it (e.g. `categorie`) |
| `privacyPolicyURL` | — | Privacy page, linked under the contact form (per language) |
| `searchSections` | `["posts"]` | Sections included in the search index |
| `tutorialVisiblePosts` | `3` | Guides shown per series before "Show more" |
| `home.postSummary` | `true` | Card layout on the home page |
| `post.show*` | `true` | Toggle categories, tags, meta, reading time, author and prev/next nav on posts |
| `footer.showCategories`, `footer.showTags`, `footer.showSocial` | `true` | Footer sections |
| `footer.maxFooterListItems` | `10` | Items shown in the footer category and tag lists |
| `stickyShare.*` | — | Share bar: `active`, `clipboard`, `email`, `facebook`, `telegram`, `whatsapp`, `x` |
| `llms.description` | `description` | Intro line of `llms.txt` (per language) |

Footer links come from the `footer` menu:

```toml
[[menus.footer]]
  name = "About"
  url = "/about/"
  weight = 10
```

### Front matter

| Key | Description |
|---|---|
| `cover.image`, `cover.alt`, `cover.caption` | Cover image (path relative to `static/`) |
| `tutorial`, `tutorialId` | Series name and order on the Guides page |
| `math: true` | Load MathJax on this page |
| `noindex: true` | Add `noindex, follow` |
| `hideSearch: true` | Hide the global search bar on this page |
| `enableComments: true` | Show Giscus comments on this page. With the site param `enableComments = true` comments are on everywhere and `disableComments: true` turns them off for a page |

### Languages

The theme ships `i18n/it.yaml` and `i18n/en.yaml`. To change a string, create the same key in your site's `i18n/<lang>.yaml`: your value wins. For another language, copy `i18n/en.yaml` and translate it.

If a language uses a translated taxonomy name, declare it and tell the theme:

```toml
[languages.it.taxonomies]
  categoria = "categorie"
  tag = "tags"
[languages.it.params]
  categoryTaxonomy = "categorie"
```

## Optional integrations

### Umami Analytics

Cookie-free analytics, loaded only in production.

```toml
[params.analytics.umami]
  src = "https://analytics.example.org/script.js"
  websiteId = "00000000-0000-0000-0000-000000000000"
  performance = true            # Core Web Vitals
```

Anything beyond the tracking script (custom events, Session Replay…) belongs in your site: use the [hooks](#hooks).

### Giscus comments

Get the values from [giscus.app](https://giscus.app). The widget follows the page language.

```toml
[params.comments.giscus]
  repo = "user/repo"
  repoId = "R_xxx"
  category = "General"
  categoryId = "DIC_xxx"
```

### Contact form

Netlify Forms by default; any other endpoint with `provider = "custom"`.

```toml
[params.contactForm]
  provider = "netlify"           # or "custom"
  # action = "https://formspree.io/f/xxx"
  successURL = "contact-success/"
```

### Netlify Image CDN

With `netlifyImageCDN = true` covers and heroes are resized and converted to AVIF/WebP by Netlify. Copy the `/cdn-*` routes from [`exampleSite/netlify.toml`](exampleSite/netlify.toml) into your `netlify.toml`. Without it, images are served as they are.

### Consent banner

The site uses no cookies; the banner only stores the visitor's choice in `localStorage`. On accept/decline it fires a `cookieconsentchange` event (`event.detail.value` is `"true"` or `"false"`), so your own scripts can wait for consent. All texts are optional: defaults come from the theme translations.

```toml
[params.cookie]
  enabled = true
  message = "This site uses no cookies."
  messageLong = "Longer text shown in the details dialog."
  acceptText = "Accept"
  rejectText = "Decline"
  settingsText = "Details"
  modalTitle = "Privacy Preferences"
```

## Hooks

To add scripts or tags without overriding theme files, create these partials in your site:

| File | Rendered |
|---|---|
| `layouts/partials/extend_head.html` | At the end of `<head>` |
| `layouts/partials/extend_footer.html` | Before `</body>` |

Example: load a script only after the visitor accepts the consent banner.

```html
<script>
window.addEventListener('cookieconsentchange', function (e) {
  if (e.detail.value === 'true') { /* load your script */ }
});
</script>
```

## Customizing

Any template can be overridden by creating the same path in your site, for example `layouts/partials/footer.html`. Colors and sizes are CSS variables in `assets/css/config.css`.

How the code is organized:

| Path | Content |
|---|---|
| `assets/css/config.css`, `assets/css/common/*.css` | Styles, bundled into one fingerprinted stylesheet |
| `assets/js/main.js` | Imports the scripts used on every page (`assets/js/common/`) |
| `assets/js/pages/*.js` | Scripts for a single page (archive, search, guides), loaded with `partials/page-script.html` |
| `layouts/partials/func/` | Helper partials that return values (CDN check, image URLs, category taxonomy) |

## License

[MIT](LICENSE)
