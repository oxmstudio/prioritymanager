import { get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isPlannerStateShape, normalizePlannerState, normalizeSeedState } from '../../../lib/seed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLANNER_STATE_PATH = 'planner/state.json';

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function storageUnavailable() {
  return NextResponse.json(
    { error: 'BLOB_READ_WRITE_TOKEN is not configured for this deployment.' },
    { status: 503 },
  );
}

export async function GET() {
  if (!hasBlobToken()) return storageUnavailable();

  try {
    const blob = await get(PLANNER_STATE_PATH, { access: 'private' });
    if (!blob) return NextResponse.json({ state: normalizeSeedState(), source: 'seed' as const });

    const raw = await new Response(blob.stream).text();
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlannerStateShape(parsed)) {
      return NextResponse.json({ state: normalizeSeedState(), source: 'seed' as const });
    }

    return NextResponse.json({ state: normalizePlannerState(parsed), source: 'blob' as const });
  } catch {
    return NextResponse.json({ error: 'Failed to read planner state from Blob storage.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasBlobToken()) return storageUnavailable();

  try {
    const payload = (await request.json()) as unknown;
    if (!isPlannerStateShape(payload)) {
      return NextResponse.json({ error: 'Invalid planner state payload.' }, { status: 400 });
    }

    const result = await put(PLANNER_STATE_PATH, JSON.stringify(normalizePlannerState(payload)), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: 'application/json; charset=utf-8',
    });

    return NextResponse.json({ ok: true, pathname: result.pathname, etag: result.etag });
  } catch {
    return NextResponse.json({ error: 'Failed to save planner state to Blob storage.' }, { status: 500 });
  }
}
