import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // x402 middleware already validated and charged payment

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Event ticker is required' },
      { status: 400 }
    );
  }

  // Transform query param to path param and proxy to original route
  const url = new URL(request.url);
  url.pathname = `/api/kalshi/events/${ticker}`;
  url.searchParams.delete('ticker'); // Clean up query param

  return fetch(url.toString(), {
    method: 'GET',
    headers: request.headers,
  }).then((res) => {
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  });
}
