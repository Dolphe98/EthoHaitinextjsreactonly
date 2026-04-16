import { NextResponse } from 'next/server';

const BASE_URL = 'https://backend.ethohaiti.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// THE FIX: Append keys directly to the URL to bypass Hostinger's firewall completely
function buildWooUrl(endpoint) {
  const key = process.env.WOO_CONSUMER_KEY;
  const secret = process.env.WOO_CONSUMER_SECRET;
  
  // Make sure the endpoint doesn't have double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${BASE_URL}${cleanEndpoint}`);
  
  if (endpoint.includes('/wc/v3') && key && secret) {
    url.searchParams.append('consumer_key', key);
    url.searchParams.append('consumer_secret', secret);
  }
  
  return url.toString();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    const fetchUrl = buildWooUrl(endpoint);
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    const data = await res.json();
    
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { endpoint, data } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400, headers: corsHeaders });
    }

    const fetchUrl = buildWooUrl(endpoint);
    const res = await fetch(fetchUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data || {}) 
    });
    
    const result = await res.json();
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}