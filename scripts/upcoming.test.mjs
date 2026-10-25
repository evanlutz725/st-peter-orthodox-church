import test from 'node:test';
import assert from 'node:assert/strict';
import { upcomingFromICS } from '../netlify/lib/upcoming.mjs';

const calendar = (...events) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events.join('\r\n')}\r\nEND:VCALENDAR`;
const event = (uid, properties) => `BEGIN:VEVENT\r\nUID:${uid}\r\n${properties.join('\r\n')}\r\nEND:VEVENT`;

test('weekly worship keeps its local time across the November DST change', async () => {
  const source = calendar(event('weekly', ['SUMMARY:DIVINE LITURGY','DTSTART;TZID=America/New_York:20261025T093000','DTEND;TZID=America/New_York:20261025T103000','RRULE:FREQ=WEEKLY']));
  const before = await upcomingFromICS(source,new Date('2026-10-25T00:00:00Z'));
  const after = await upcomingFromICS(source,new Date('2026-10-31T00:00:00Z'));
  assert.equal(before[0].start,'2026-10-25T13:30:00.000Z');
  assert.equal(after[0].start,'2026-11-01T14:30:00.000Z');
});

test('exclusions, cancellations, and all-day commemorations are omitted', async () => {
  const source = calendar(
    event('weekly',['SUMMARY:Service','DTSTART:20261026T130000Z','DTEND:20261026T140000Z','RRULE:FREQ=DAILY;COUNT=3','EXDATE:20261027T130000Z']),
    event('cancelled',['SUMMARY:Cancelled service','STATUS:CANCELLED','DTSTART:20261026T120000Z','DTEND:20261026T123000Z']),
    event('saint',['SUMMARY:Saint','DTSTART;VALUE=DATE:20261026','DTEND;VALUE=DATE:20261027'])
  );
  const events = await upcomingFromICS(source,new Date('2026-10-26T00:00:00Z'));
  assert.deepEqual(events.map(e=>e.start),['2026-10-26T13:00:00.000Z','2026-10-28T13:00:00.000Z']);
});

test('moved and cancelled recurrence overrides replace their original occurrences', async () => {
  const source = calendar(
    event('weekly',['SUMMARY:Service','DTSTART:20261026T130000Z','DTEND:20261026T140000Z','RRULE:FREQ=DAILY;COUNT=3']),
    event('weekly',['SUMMARY:Moved service','RECURRENCE-ID:20261027T130000Z','DTSTART:20261027T150000Z','DTEND:20261027T160000Z']),
    event('weekly',['SUMMARY:Service','STATUS:CANCELLED','RECURRENCE-ID:20261028T130000Z','DTSTART:20261028T130000Z','DTEND:20261028T140000Z'])
  );
  const events=await upcomingFromICS(source,new Date('2026-10-26T00:00:00Z'));
  assert.deepEqual(events.map(e=>e.start),['2026-10-26T13:00:00.000Z','2026-10-27T15:00:00.000Z']);
  assert.equal(events[1].title,'Moved service');
});

test('past and distant events are excluded; ongoing events are retained', async () => {
  const source=calendar(...[
    ['past','20261025T110000Z','20261025T120000Z'],
    ['ongoing','20261025T130000Z','20261025T150000Z'],
    ['future','20261104T130000Z','20261104T140000Z'],
  ].map(([uid,start,end])=>event(uid,[`SUMMARY:${uid}`,`DTSTART:${start}`,`DTEND:${end}`])));
  const events=await upcomingFromICS(source,new Date('2026-10-25T14:00:00Z'));
  assert.deepEqual(events.map(e=>e.title),['ongoing']);
});

test('empty calendars are valid and upstream HTML is rejected', async () => {
  assert.deepEqual(await upcomingFromICS(calendar()),[]);
  await assert.rejects(upcomingFromICS('<html>Unavailable</html>'));
});
