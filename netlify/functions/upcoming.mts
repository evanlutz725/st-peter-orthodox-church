import { calendarUrl, upcomingFromICS } from '../lib/upcoming.mjs';

export default async (request: Request) => {
  const headers = {'Cache-Control':'public, max-age=60, s-maxage=300','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
  if (request.method !== 'GET') return new Response('Method not allowed', {status:405,headers:{Allow:'GET'}});
  try {
    const response = await fetch(calendarUrl, {signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Calendar request failed');
    const events = await upcomingFromICS(await response.text());
    return Response.json({events}, {headers});
  } catch {
    return Response.json({error:'Calendar temporarily unavailable'}, {status:503,headers:{...headers,'Cache-Control':'no-store'}});
  }
};
