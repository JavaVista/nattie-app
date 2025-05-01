export const corsHeaders = {
  // Allow all origins to access your API.
  // Change this in Prod to match the domain to allow access from.
  'Access-Control-Allow-Origin': 'http://localhost:8100',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
