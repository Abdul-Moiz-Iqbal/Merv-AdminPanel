import { NextRequest, NextResponse } from 'next/server';

export function handleCors(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return null; // continue with handler if not OPTIONS
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or restrict to a domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
