import ical from 'node-ical';

export const calendarUrl = 'https://calendar.google.com/calendar/ical/lmvofhvvg09vnvd6tqlglbh838%40group.calendar.google.com/public/basic.ics';

export const parishTimeZone = 'America/New_York';
const dateKey = (date, timeZone = parishTimeZone) => new Intl.DateTimeFormat('en-CA', {timeZone, year:'numeric', month:'2-digit', day:'2-digit'}).format(date);
export function addDays(key, days) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0,10);
}
export function localMidnight(key) {
  const target = Date.parse(`${key}T00:00:00Z`);
  let instant = target;
  for (let i=0; i<3; i++) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:parishTimeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'}).formatToParts(new Date(instant)).map(p=>[p.type,p.value]));
    const wall = Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute),Number(parts.second));
    instant += target-wall;
  }
  return new Date(instant);
}
export function currentWeekStart(now = new Date()) {
  const today = dateKey(now);
  return addDays(today,-new Date(`${today}T12:00:00Z`).getUTCDay());
}

export function validateWeekStart(start) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !Number.isFinite(Date.parse(start)) || new Date(`${start}T00:00:00Z`).toISOString().slice(0,10)!==start || start<'2000-01-01' || start>'2100-12-24') throw new RangeError('Invalid week start');
}
export async function weeklyFromICS(source, start = currentWeekStart()) {
  validateWeekStart(start);
  if (!source.includes('BEGIN:VCALENDAR')) throw new Error('Invalid calendar response');
  const from = localMidnight(start);
  const to = localMidnight(addDays(start,7));
  const calendar = await ical.async.parseICS(source);
  const days = Array.from({length:7},(_,i)=>({date:addDays(start,i),events:[]}));
  for (const event of Object.values(calendar)) {
    if (event.type!=='VEVENT' || !event.start || event.status==='CANCELLED') continue;
    for (const occurrence of ical.expandRecurringEvent(event,{from:new Date(from.getTime()-86400000),to,expandOngoing:true})) {
      if (occurrence.event?.status==='CANCELLED' || !occurrence.summary) continue;
      const allDay = occurrence.isFullDay;
      const title = String(occurrence.summary).trim();
      const displayTitle = title===title.toUpperCase() ? title.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase()) : title;
      for (const day of days) {
        let matches;
        if (allDay) {
          const zone = occurrence.start.tz || event.start.tz || 'UTC';
          matches = dateKey(occurrence.start,zone)<=day.date && dateKey(occurrence.end,zone)>day.date;
        } else {
          const dayStart = localMidnight(day.date);
          const dayEnd = localMidnight(addDays(day.date,1));
          matches = occurrence.start<dayEnd && (occurrence.end>dayStart || occurrence.start>=dayStart && occurrence.end.getTime()===occurrence.start.getTime());
        }
        if (matches) day.events.push({title:displayTitle,start:occurrence.start.toISOString(),end:occurrence.end.toISOString(),allDay,continues:!allDay && occurrence.start<localMidnight(day.date)});
      }
    }
  }
  for (const day of days) day.events=[...new Map(day.events.map(e=>[`${e.start}:${e.title}`,e])).values()].sort((a,b)=>Number(b.allDay)-Number(a.allDay)||a.start.localeCompare(b.start));
  return {start, timeZone:parishTimeZone, days};
}

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
