import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Handle OAuth callback
  return NextResponse.json({ message: 'OAuth callback' })
}

