export const corsHeaders = {
  // Allow all origins to access your API.
  // Change this in Prod to match the domain to allow access from.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  // Allow caching for 1 day
  'Access-Control-Max-Age': '86400',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Helper for image responses
export function imageResponse(
  body: BodyInit | null | undefined,
  status = 200,
  contentType = 'image/jpeg',
  cacheControl = 'public, max-age=86400' 
): Response {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}
