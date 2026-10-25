# Parish content used in the homepage refinement

Verified October 25, 2026 against the original parish website and its public WordPress media/page API.

- Parish worship photograph: https://stpeterorthodoxchurch.com/wp-content/uploads/2025/10/B2P3a.jpg . This belongs to the parish-history media series alongside the Holiday Inn and former storefront photographs. Presented as parish-archive photography; no claim about the present appearance of the building is made. Local optimized copy: `public/assets/parish-worship.webp` (596 × 336).
- Father Hans photograph: existing `public/assets/who.webp`, retained from the original parish website. Parish priest and ministry history: https://stpeterorthodoxchurch.com/our-clergy/ . No new first-person message or quotation is attributed to him.
- Parish beginnings and move to the present home: https://stpeterorthodoxchurch.com/our-story/ . The B2P3 storefront photograph is a former location and is deliberately not presented as the current building.
- Fellowship after worship and geographic context: https://stpeterorthodoxchurch.com/new-to-the-area/ .
- Parking, catechumen/enquirers class, and Good Samaritan Mercy Fund: https://stpeterorthodoxchurch.com/st-peter-news-october-20-2026/ . The visit page follows the published parking guidance and asks visitors to follow current signs and instructions. Details of step-free access, service duration, and worship languages were not established by these sources and have not been invented.
- Sunday Liturgy and contact details: https://stpeterorthodoxchurch.com/contact/ . Calendar service times are retrieved from the same public Google Calendar used by the original parish website, in America/New_York time.
- Featured homily: the latest episode in the imported public parish podcast snapshot. Publication date is visible; refreshing the snapshot uses the existing `npm run refresh:content` command.

Photography and parish text retain their original ownership. Newsletter and podcast content is a publication snapshot. Only the homepage upcoming-events list and embedded Google Calendar refresh independently of a new site build.
