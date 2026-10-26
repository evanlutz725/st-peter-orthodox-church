# Parish content used in the homepage refinement

Verified October 25, 2026 against the original parish website and its public WordPress media/page API.

- Parish worship photograph: https://stpeterorthodoxchurch.com/wp-content/uploads/2025/10/B2P3a.jpg . This belongs to the parish-history media series alongside the Holiday Inn and former storefront photographs. Presented as parish-archive photography; no claim about the present appearance of the building is made. Local optimized copy: `public/assets/parish-worship.webp` (596 × 336).
- Father Hans photograph: existing `public/assets/who.webp`, retained from the original parish website. Parish priest and ministry history: https://stpeterorthodoxchurch.com/our-clergy/ . No new first-person message or quotation is attributed to him.
- Parish beginnings and move to the present home: https://stpeterorthodoxchurch.com/our-story/ . The B2P3 storefront photograph is a former location and is deliberately not presented as the current building.
- Fellowship after worship and geographic context: https://stpeterorthodoxchurch.com/new-to-the-area/ .
- Parking, catechumen/enquirers class, and Good Samaritan Mercy Fund: https://stpeterorthodoxchurch.com/st-peter-news-october-20-2026/ . The visit page follows the published parking guidance and asks visitors to follow current signs and instructions. Details of step-free access, service duration, and worship languages were not established by these sources and have not been invented.
- Sunday Liturgy and contact details: https://stpeterorthodoxchurch.com/contact/ . Calendar service times are retrieved from the same public Google Calendar used by the original parish website, in America/New_York time.
- Featured homily: the latest episode in the imported public parish podcast snapshot. Publication date is visible; refreshing the snapshot uses the existing `npm run refresh:content` command.

Photography and parish text retain their original ownership. Newsletter and podcast content is a publication snapshot. The homepage upcoming-events list and native weekly calendar refresh independently of a new site build.

## Readability, icon, and navigation revision

- The blue and gold icon requested by the parish is the original image at https://stpeterorthodoxchurch.com/wp-content/uploads/2026/04/cropped-2026-fav.png . It is now the homepage’s principal image and the repeated header/footer identity. Local copy: `public/assets/saint-peter-icon.webp`, 512 × 512, lossless WebP. Raw RGBA pixel hashes matched the source PNG after normalization to the same channel count. No recoloring, redrawing, facial cropping, or AI alteration was applied. The smaller favicon is a normal resized derivative.
- Parish exterior: https://stpeterorthodoxchurch.com/wp-content/uploads/2021/06/at-peter-exterior-500x362-1.jpg . Used on home, visit, and the consolidated parish page; local optimized copy `public/assets/parish-exterior.webp` (500 × 362).
- Candlelit Orthodox worship photograph: https://stpeterorthodoxchurch.com/wp-content/uploads/2026/04/WHAT.png . Used on the faith page as an image of Orthodox worship, with no claim that it depicts a service at St. Peter. Local copy `public/assets/orthodox-worship.webp` (358 × 200).
- Lora normal/italic variable Latin font subsets are self-hosted from the official Google Fonts CDN. Its SIL Open Font License and versioned sources are in `public/assets/fonts/`.
- Parish history and clergy content now share `/about/`; the faith introduction and prayer library share `/orthodoxy/`. Legacy URLs have permanent redirects to the relevant sections. Original article text remains in the imported data and can be refreshed with the existing importer.
- Both homepage upcoming events and the native weekly calendar now read the public parish ICS feed through server-side functions. The calendar has no Google iframe; only the visit-page map remains an embedded Google service.
