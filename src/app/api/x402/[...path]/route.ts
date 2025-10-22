import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Middleware runs globally via src/middleware.ts
  // This route just proxies to the original implementation

  const { path } = await params;
  const url = new URL(request.url);
  url.pathname = `/api/${path.join('/')}`;

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
