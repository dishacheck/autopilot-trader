// api/dhan.js — Vercel serverless function
// This runs on Vercel's SERVER, not the browser
// So CORS is not an issue — server can call any API freely

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Allow all origins
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, access-token, client-id',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Get credentials from request headers
    const clientId   = req.headers.get('x-client-id') || '';
    const accessToken = req.headers.get('x-access-token') || '';

    if (!clientId || !accessToken) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the Dhan endpoint path from query param
    const endpoint = url.searchParams.get('endpoint') || '';
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Missing endpoint param' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const dhanURL = 'https://api.dhan.co' + endpoint;
    const method  = req.method === 'POST' ? 'POST' : 'GET';

    // Read body if POST
    let body = null;
    if (method === 'POST') {
      try { body = await req.text(); } catch(e) {}
    }

    // Call Dhan API from server side (no CORS issue)
    const dhanRes = await fetch(dhanURL, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access-token': accessToken,
        'client-id': clientId,
        'Accept': 'application/json',
      },
      ...(body ? { body } : {})
    });

    const data = await dhanRes.text();

    return new Response(data, {
      status: dhanRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
