import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    first10: apiKey?.substring(0, 10) || 'none',
    nodeVersion: process.version,
    runtime: 'nodejs'
  });
}