# St. Peter Orthodox Church

A modern, responsive Astro website for St. Peter the Apostle Antiochian Orthodox Church in Fort Myers, Florida. Built as a separate copy of the public WordPress website, with a new visual identity and simpler navigation.

## Local development

```sh
npm ci
npm run dev
npm run build
npm run check:links
npm run test:calendar
```

Astro 7 requires Node 22.23.4 or newer. A compatible Node runtime is included as a development dependency; npm scripts resolve that local binary. Netlify uses the latest Node 22 release.

## Content and features

- Static HTML pages with small scripts for the mobile menu, faith-library search, homepage upcoming events, and the responsive weekly calendar.
- Clear service time, directions, first-visit guidance, and call/text contact actions.
- Eight migrated parish and prayer articles, plus six recent newsletters imported from the public WordPress REST API.
- Six recent podcast episodes imported from the parish's public RSS feed, with native audio controls and Apple Podcasts / Amazon Music links.
- A native weekly calendar: seven columns on desktop, two columns on tablets, and readable day cards on phones. There is no embedded frame or horizontal calendar scrolling. A Netlify Function reads the original public Google Calendar; previous/next/current week controls, all-day feasts, timed services, cancellations, and daylight-saving changes are supported. Google Calendar and ICS subscription links remain available.
- The homepage shows the next three timed gatherings in the next seven days through a small Netlify Function. Both calendar endpoints cache successful responses for up to five minutes and show useful fallbacks if unavailable.
- Self-hosted Lora headings at semibold weight and DM Sans body text, with 18 px main prose, darker secondary text, and larger controls for readability.
- The homepage leads with the parish worship photograph. The original blue and gold Saint Peter icon appears in a circular frame in the header/footer and parish page; its lossless WebP source preserves the original RGBA pixels. Parish worship and exterior photography, Father Hans, and original-site candlelit worship imagery provide a fuller visual identity.
- Local optimized WebP images sourced from the existing parish website. The homepage and visit page use parish-archive worship photography; Father Hans's photograph is also from the original parish site. Candlelit Orthodox worship imagery on the faith page is not independently identified as this parish. See `docs/parish-content-sources.md`.
- Accessible navigation, skip link, keyboard focus styles, reduced-motion support, responsive layouts, metadata, and old-path redirects.

This is a content snapshot, not a live WordPress integration. Refresh imported articles, newsletters, and podcast episodes with:

```sh
npm run refresh:content
npm run build
npm run check:links
```

Review the resulting source diff before committing. The import strips WordPress form/plugin runtime and untrusted inline styles/scripts, rewrites migrated links, and downloads optimized article images. The Google Calendar and hosted audio remain live external services. Older newsletters remain available through the original archive link. Broken legacy `/sermon/` links are replaced by the current parish podcast.

Primary navigation, parish details, and resource cards: `src/data/site.ts`. Our parish, clergy, and history share `/about/`; the faith introduction and prayer library share `/orthodoxy/`. Old `/our-clergy/`, `/our-story/`, and `/resources/` URLs redirect to their new sections. Homilies, Calendar, News, Contact, and Plan your visit are all available directly in the header. Layout and navigation: `src/layouts/Layout.astro`. Colors, typography, and responsive styles: `src/styles/global.css`. Imported content: `src/data/*.json`.

## Deployment

Netlify project: `st-peter-orthodox-fort-myers` (ID `503f2a04-4bbe-444e-827b-16c171a0ab01`). Build command: `npm run test:calendar && npm run build && npm run check:links`; publish directory: `dist`.

`.netlify/` is ignored because it contains checkout-local deployment state. No credentials belong in the repository.

The new Netlify copy is intentionally excluded from search indexing while the existing church domain remains on WordPress. At domain cutover, update the Astro `site` origin, remove the `noindex` meta and `X-Robots-Tag` header, and replace `public/robots.txt` with an indexing policy. DNS and the original WordPress installation have not been changed.

## Sources

- Parish pages and newsletter content: https://stpeterorthodoxchurch.com/
- Service times / contact: https://stpeterorthodoxchurch.com/contact/
- Calendar source: https://stpeterorthodoxchurch.com/calendar/
- Podcast ownership / public feed discovery: https://podcasts.apple.com/us/podcast/homilies-of-father-hans/id1867037828
- Podcast RSS: https://rss.libsyn.com/shows/548077/destinations/5263490.xml

Parish content and original photography retain their existing ownership. No new license is granted for third-party material.

## Release verification

See `docs/QA-report.md` for the October 25 responsive, keyboard, contrast, content, and deployment checks. The Netlify build runs the static integrity checks before a deployment can publish. Regenerate responsive images and bundled fonts with `node scripts/prepare-assets.mjs` only when those source assets need updating.
