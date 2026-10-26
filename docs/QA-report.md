# Production refinement QA

Date: October 25, 2026. Target: the separate St. Peter Netlify website copy.

## Automated and source checks

- `npm run build` generated all 26 static pages successfully.
- `npm run check:links` passed for 26 pages, 827 local paths/assets/fragments, and 78 image instances after the visual refinement build.
- Checks include relative and absolute local links, fragment targets, responsive image candidates, CSS font/background assets, font preloads, page titles and descriptions, canonical uniqueness, Open Graph metadata, one main landmark and h1 per page, ordered headings, duplicate IDs and ARIA references, accessible link/button names, field labels, image dimensions and alt attributes, iframe titles, JSON-LD syntax, unsafe link protocols, and insecure embedded assets.
- No separate client JavaScript files were emitted. Maximum inline application JavaScript was 1,493 bytes per page, excluding JSON-LD.
- `npm audit --json` reported zero known vulnerabilities across production and development dependencies.

## Issues corrected in this pass

- Added or corrected intrinsic dimensions on 67 imported image instances, avoiding layout movement caused by unknown image proportions.
- Normalized nine imported articles to begin at h2 beneath the template h1 and preserve section nesting without skipped heading levels.
- Named five otherwise unnamed image links on the Akathist prayers page using their existing linked heading text.
- Updated the import workflow to preserve these structural improvements on future content refreshes.
- Confirmed imported article prose, article ordering, and link URLs are identical to their pre-refinement versions.

## External destination smoke checks

The original parish homepage, podcast RSS feed, Antiochian Archdiocese, Apple Podcasts, Amazon Music podcast page, and Netlify/Google/Apple privacy notices returned HTTP 200. The RSS feed redirects from Libsyn to the parish-hosted feed successfully. Amazon's privacy link redirects to its privacy help page but returns HTTP 403 to the automated request; its browser presentation is not established by that check.

## Release scope

The Netlify copy intentionally remains excluded from search indexing while the original church domain continues serving WordPress. The original domain and DNS are outside this release. Newsletters and podcast entries are a content snapshot; the documented refresh command must run when republishing new parish content. Google Calendar, Maps, and audio remain external services with their existing fallbacks.

These automated checks establish static document and asset integrity. They do not establish visual quality, color contrast, real device behavior, keyboard usability, screen-reader compatibility, or external embed functionality. Browser evidence belongs below and must describe the actual tested viewport sizes and interactions.

## Browser and deployed verification

Tested the built static site through the Codex Chromium browser against the local production preview, not only the development server.

- All 26 pages inspected for document overflow, clipped text/button/card containers, one h1, and failed loaded images at 320 px and 1440 px: 52 page/viewport checks passed.
- Eight representative pages (home, visit, calendar, resources, contact, homilies, news, privacy) tested at 360, 390, 430, 700, 701, 768, 960, 961, 1024, 1280, and 1920 px: 88 additional checks passed. This includes both sides of the mobile layout and navigation breakpoints.
- Visually reviewed desktop homepage hero, lower sections, news, visit, resources, homilies, calendar, and phone homepage, navigation, visit/contact, clergy, and calendar layouts. Viewports are browser emulation, not physical-device or Safari/Firefox certification.
- Mobile menu opens, updates its accessible expanded state, closes with Escape, and returns focus to its trigger. Homepage visit CTA and visit contact CTA reach their intended pages. Skip link transfers focus to main content.
- With JavaScript disabled, mobile navigation remains visible and menu toggle remains hidden. Programmatic link activation in this emulation was unsupported by the browser tool; no claim of that activation test is made. Reduced-motion emulation verified automatic scrolling and zero-duration transitions.
- Resource category filter returned three Prayer resources; query creed returned one; an unmatched query displayed the empty state; clearing query and choosing All restored eight.
- FAQ opened with Enter. Both footer policy links navigated correctly.
- First homily played and advanced past five seconds with readyState 4 and no media error; playback was stopped after verification.
- Google weekly calendar rendered its seven-column date grid and service events. On a 390 px viewport, its 900 px inner frame scrolled horizontally to 415 px while the document remained within the viewport. Direct Google Calendar and ICS fallbacks remain available.
- Measured 184 text styles across home, visit, resources, and homilies against their solid backgrounds. All passed the applicable 4.5:1 normal / 3:1 large-text thresholds after darkening gold labels; minimum normal-text ratio was 4.55:1. This sample excludes photo captions and third-party iframe content and is not a comprehensive WCAG conformance certification.
- Raw geometry and contrast measurements are saved in ignored local artifact `artifacts/responsive-qa.json`.
- Published application source commit: `a11db40c35910d7c44bd82d6c7c63423275adffd`.
- Netlify production deploy `6ade62c6018b3208a63f4949` reached ready and published October 25, 2026 at 20:13:11 UTC. Build and static QA gate passed; Netlify processed all 11 redirects and both header rules without errors. Its scan reported no secret matches.
- Live origin: https://st-peter-orthodox-fort-myers.netlify.app/ . HTTP checks across all 26 built routes found the new navigation and self-hosted font references, with no old Google Fonts imports. New font and responsive image URLs returned 200 with correct content types. An unknown route returned HTTP 404. Security and intentional noindex headers were present.
- Visually verified the deployed homepage at 1440 px and 390 px. The live mobile menu navigated to Resources and the Prayer filter returned three results, with no document overflow.
- Saved live screenshots: `artifacts/polished-homepage-desktop.png` and `artifacts/polished-homepage-mobile.png`; HTTP evidence: `artifacts/production-qa.json`. These local artifacts are intentionally ignored by Git.
- Temporary browser emulation was cleared and the production homepage left open.

## Parish identity and visitor refinement

October 25, 2026, following comparison with five Orthodox parish websites.

- Rebuilt the homepage around a direct Sunday invitation, parish-archive worship photography, live upcoming gatherings, practical first-visit guidance, Father Hans, concrete parish ministries, a featured homily, and the latest newsletter.
- Added the server-side upcoming-events endpoint using the existing public calendar. Its only output is the next three timed gatherings within seven days; all times are displayed in America/New_York. No API keys or client calendar library are required. Successful responses cache for up to five minutes; a failed request is not cached.
- Five calendar tests passed: daylight-saving transitions, exclusions and cancellations, moved/cancelled recurrence overrides, ongoing/past/distant events, and empty/invalid upstream responses.
- Built all 26 pages. Static integrity checks passed for 818 local paths/assets/fragments and 78 image instances. Homepage inline application JavaScript is 2,377 bytes; no separate client JavaScript bundle is emitted. Production dependency audit found no known vulnerabilities.
- Tested home and visit at 320, 360, 390, 430, 700, 701, 768, 960, 961, 1024, 1440, and 1920 px: 24 checks with no document overflow, clipped checked text/controls, failed loaded images, or duplicate/missing h1.
- Tested all 26 pages at 320 and 1440 px: 52 further checks with no document overflow, duplicate/missing h1, or failed loaded images.
- Visually inspected the desktop hero and mobile hero, dated service list, visitor steps, pastor, parish life, and homily sections. Verified the service-times anchor, visit CTA, mobile menu expanded state, Escape dismissal/focus return, and children FAQ.
- Played the new homepage audio player; playback advanced beyond 11 seconds with readyState 4 and no media error. Navigation stopped playback.
- Simulated calendar HTTP failure and a successful empty calendar using the ignored local QA preview server. Both left the regular Sunday schedule and full-calendar link visible, with the appropriate accessible status message.
- Measured 157 visible text samples across homepage and visit against their computed solid backgrounds. No sampled failures; minimum ratio 4.55:1. Third-party/native controls and photographic pixels are outside this measurement.
- Local browser preview served built files and the actual function handler. It does not establish Netlify bundling or production function execution; those are verified separately after publishing. Responsive testing uses Chromium viewport emulation, not physical devices.
- Raw browser measurements: ignored `artifacts/parish-refinement-qa.json`. Content provenance: `docs/parish-content-sources.md`.
- Published application source commit `e50f06d`. Netlify deploy `6ade7654ef5aa0a028cd02a2` reached ready and published at 21:36:43 UTC on October 25, 2026, with the `upcoming` function successfully bundled for Node 22.
- Production endpoint returned HTTP 200 and the expected October 26, 28, and 30 timed gatherings. Its response showed Netlify Edge caching and the configured five-minute shared-cache lifetime. New image, homepage, visit, calendar, and both policy routes returned HTTP 200; intentional noindex headers remain present.
- Verified the published homepage with live event rows at 1440 px and 390 px. No document overflow; parish photograph loaded successfully. Saved production screenshots: ignored `artifacts/parish-homepage-desktop.png` and `artifacts/parish-homepage-mobile.png`; HTTP evidence: `artifacts/parish-production-qa.json`.
- Confirmed the calendar still uses `mode=WEEK` with a 900 px horizontally scrollable grid on phones. The visit-page contact CTA navigated to `/contact/`.

## Readability, sacred icon, calendar, and navigation revision

October 25, 2026. This revision supersedes the embedded/calendar-scrolling behavior documented above.

- Replaced the Google Calendar iframe with a native weekly view: seven columns on desktop, two on tablets, one readable day card per row on phones. No internal scrolling container or iframe remains on the calendar page. Previous/next/current week controls retain keyboard focus after loading.
- Added a weekly feed endpoint covering timed services, all-day feast days, empty days, and overnight events. Dates are grouped in America/New_York, with exclusive week-end boundaries. Successful responses are cached for up to five minutes; unavailable feeds show a regular-Sunday fallback, Google Calendar link, and parish contact information. Without JavaScript, inactive week controls stay hidden and the external calendar/contact options remain available.
- Eight calendar tests passed, including daylight-saving changes, recurrence exceptions/cancellations, moved services, all-day dates, overnight events, invalid dates, and the distinction between Eastern and UTC week boundaries.
- Replaced the thin display typeface with self-hosted Lora at semibold weight. Main prose is 18 px DM Sans, secondary text is darker, and controls/labels are larger. Main navigation becomes a mobile menu at 1200 px to preserve readable labels.
- Placed the original blue and gold Saint Peter icon in the hero and every header/footer. A normalized raw RGBA comparison confirmed the lossless WebP version matches the original PNG pixels. Added parish exterior and original-site candlelit worship photographs; retained the parish worship archive and Father Hans images.
- Consolidated history and clergy into `/about/`, and faith/prayer resources into `/orthodoxy/`. `/our-story/`, `/our-clergy/`, and `/resources/` redirect to specific sections. Header and sidebar now share one navigation definition, including Homilies, Calendar, News, and Contact. Faith articles include a parent breadcrumb.
- Built 23 pages. Static checks passed for 829 local paths/assets/fragments and 128 image instances. No separate client JavaScript files are emitted; maximum inline application JavaScript is 4,008 bytes on the calendar page. Production dependency audit found no known vulnerabilities.
- Tested eight key pages at 320, 360, 390, 430, 600, 601, 700, 701, 768, 1100, 1101, 1200, 1201, 1280, 1440, and 1920 px: 128 responsive checks passed, with no document/calendar overflow, checked text/control clipping, failed loaded images, or desktop header overlap.
- Tested all 23 pages plus the three consolidated URLs at 320 and 1440 px: 52 further checks passed. Legacy URLs reached the expected new paths and anchors in the local preview.
- Measured 505 visible text samples on home, calendar, parish, faith, visit, and homilies. No failures against the applicable 4.5:1 normal/3:1 large text thresholds; minimum sampled ratio 5.06:1. This excludes native audio controls and image pixels and is not a comprehensive assistive-technology certification.
- Verified the mobile header reaches Homilies, Escape closes the menu and returns focus, prayer filtering returns three resources, searching for creed returns one, and clergy details expand. Calendar previous/next/current controls show the right week; pressing Enter after a week change preserves navigation and focus.
- Exercised feed failure and empty-week fixtures. Failure leaves retry controls, schedule fallback, external calendar, and contact routes available. Empty weeks render all seven dates with clear no-event messages.
- Browser checks use Chromium viewport emulation against the built site and actual function handlers. Source and image provenance is recorded in `docs/parish-content-sources.md`; raw measurements are in ignored `artifacts/readability-navigation-qa.json`.
- Published application source commit `ac2630a`. Netlify deploy `6adea98a67b0953ad3f31c94` reached ready at 01:15:15 UTC on October 26 (October 25 in Fort Myers), with both `upcoming` and `week` functions deployed and 14 redirect rules processed.
- Live checks returned HTTP 200 for the homepage, calendar, consolidated hubs, homilies, visit page, icon, and Lora font. The three consolidated legacy routes returned HTTP 301 with the intended section anchors. The calendar HTML contains no iframe.
- The production weekly endpoint returned seven dates and eight entries for October 25–31. The November 1 response preserved 9:30 am local Liturgy after daylight saving (14:30 UTC); an invalid February 30 request returned HTTP 400 and no-store. The homepage upcoming endpoint returned three gatherings.
- In the published browser, verified 18 px body text, Lora headings at weight 600, all primary destinations in the header, the full 512 px source icon, and no desktop overflow. At 390 px, the live calendar rendered seven day cards, no iframe, and no document/calendar overflow; Next week displayed November 1–7 with the correct local service times.
- Saved published screenshots: ignored `artifacts/readable-saint-peter-home-desktop.png` and `artifacts/readable-calendar-mobile.png`. HTTP evidence: `artifacts/readability-production-qa.json`.

## Homepage and resource simplification

- Restored the parish worship photograph and left-aligned homepage welcome, removing the large hero icon. Saint Peter icons in the shared identity and parish page now use circular frames; the source image is unchanged.
- Removed resource category tabs and category labels. Search, result counts, empty state, and resource links remain.
- Build and static checks passed across 23 pages, 829 local links/assets/fragments, and 128 image instances.
- Browser-checked home, parish, and faith pages at 320, 390, 768, and 1440 px: 12 checks with no document overflow. Verified circular header icons, restored hero image, and removal of resource categories. Searching creed returned one result; an unmatched query showed the empty state.
