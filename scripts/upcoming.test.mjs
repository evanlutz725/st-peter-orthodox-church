import test from 'node:test';
import assert from 'node:assert/strict';
import { upcomingFromICS, weeklyFromICS, localMidnight, currentWeekStart } from '../netlify/lib/upcoming.mjs';

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

test('week boundaries follow Fort Myers time across daylight saving and UTC midnight',()=>{
  assert.equal(localMidnight('2026-11-01').toISOString(),'2026-11-01T04:00:00.000Z');
  assert.equal(localMidnight('2026-11-02').toISOString(),'2026-11-02T05:00:00.000Z');
  assert.equal(currentWeekStart(new Date('2026-10-26T02:00:00Z')),'2026-10-25');
});

test('weekly calendar has seven days, full-day feasts, timed events, and empty days',async()=>{
  const source=calendar(
    event('feast',['SUMMARY:ST. DEMETRIOS','DTSTART;VALUE=DATE:20261026','DTEND;VALUE=DATE:20261027']),
    event('service',['SUMMARY:Divine Liturgy','DTSTART:20261026T130000Z','DTEND:20261026T140000Z']),
    event('nextweek',['SUMMARY:Next Sunday','DTSTART:20261101T140000Z','DTEND:20261101T150000Z'])
  );
  const result=await weeklyFromICS(source,'2026-10-25');
  assert.equal(result.days.length,7);
  assert.equal(result.days[0].date,'2026-10-25');
  assert.equal(result.days[6].date,'2026-10-31');
  assert.equal(result.days[0].events.length,0);
  assert.deepEqual(result.days[1].events.map(e=>e.title),['St. Demetrios','Divine Liturgy']);
  assert.equal(result.days[1].events[0].allDay,true);
  assert.equal(result.days.flatMap(d=>d.events).length,2);
});

test('weekly calendar places overnight events on both days and rejects invalid dates',async()=>{
  const source=calendar(event('overnight',['SUMMARY:Night vigil','DTSTART;TZID=America/New_York:20261030T230000','DTEND;TZID=America/New_York:20261031T020000']));
  const result=await weeklyFromICS(source,'2026-10-25');
  assert.equal(result.days[5].events[0].continues,false);
  assert.equal(result.days[6].events[0].continues,true);
  await assert.rejects(weeklyFromICS(source,'2026-02-30'),RangeError);
  await assert.rejects(weeklyFromICS(source,'not-a-date'),RangeError);
});
