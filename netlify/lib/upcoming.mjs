import ical from 'node-ical';

export const calendarUrl = 'https://calendar.google.com/calendar/ical/lmvofhvvg09vnvd6tqlglbh838%40group.calendar.google.com/public/basic.ics';

export async function upcomingFromICS(source, now = new Date()) {
  if (!source.includes('BEGIN:VCALENDAR')) throw new Error('Invalid calendar response');
  const calendar = await ical.async.parseICS(source);
  const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = [];
  for (const event of Object.values(calendar)) {
    if (event.type !== 'VEVENT' || !event.start || event.status === 'CANCELLED') continue;
    for (const occurrence of ical.expandRecurringEvent(event, {from:now, to:until, expandOngoing:true})) {
      if (occurrence.isFullDay || occurrence.event?.status === 'CANCELLED' || !occurrence.summary) continue;
      const title = String(occurrence.summary).trim();
      events.push({title: title === title.toUpperCase() ? title.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase()) : title, start:occurrence.start.toISOString(), end:occurrence.end.toISOString()});
    }
  }
  const unique = [...new Map(events.map(event => [`${event.start}:${event.title}`,event])).values()];
  return unique.sort((a,b)=>a.start.localeCompare(b.start)).slice(0,3);
}
