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
- Production deployment verification is recorded below after release.
