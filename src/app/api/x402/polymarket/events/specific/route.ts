import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // x402 middleware already validated and charged payment

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Event ID or slug is required' },
      { status: 400 }
    );
  }

  // Transform query param to path param and proxy to original route
  const url = new URL(request.url);
  url.pathname = `/api/polymarket/events/${id}`;
  url.searchParams.delete('id'); // Clean up query param

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
