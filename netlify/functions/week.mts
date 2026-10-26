import { calendarUrl, weeklyFromICS, currentWeekStart, validateWeekStart } from '../lib/upcoming.mjs';

export default async (request: Request) => {
  const headers={'Cache-Control':'public, max-age=60, s-maxage=300','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
  if(request.method!=='GET') return new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
  const start=new URL(request.url).searchParams.get('start') || currentWeekStart();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)) return Response.json({error:'Choose a valid week.'},{status:400,headers:{'Cache-Control':'no-store'}});
  try {
    // Validate before making the upstream request.
    validateWeekStart(start);
    const response=await fetch(calendarUrl,{signal:AbortSignal.timeout(8000)});
    if(!response.ok) throw new Error('Calendar unavailable');
    return Response.json(await weeklyFromICS(await response.text(),start),{headers});
  } catch(error) {
    const invalid=error instanceof RangeError;
    return Response.json({error:invalid?'Choose a valid week.':'Calendar temporarily unavailable.'},{status:invalid?400:503,headers:{...headers,'Cache-Control':'no-store'}});
  }
};
