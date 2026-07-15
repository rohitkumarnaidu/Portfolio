import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const secret = process.env.PREVIEW_SECRET || 'default-preview-secret';
  if (token !== secret || !id) {
    return new Response('Invalid or missing token/id', { status: 401 });
  }

  draftMode().enable();
  redirect(`/blog/${id}?preview=true`);
}
