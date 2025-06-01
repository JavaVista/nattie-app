const getAllowedOrigins = (): string[] => {
  const prodOrigin = Deno.env.get('ALLOWED_ORIGIN_PROD') || 'https://nattie.us';
  const devOrigins = [
    'http://localhost:4200',
    'http://localhost:8080',
    'http://localhost:8100',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8100',
  ];

  return [prodOrigin, ...devOrigins];
};

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

export const getCorsHeaders = (requestOrigin?: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const origin =
    requestOrigin && isOriginAllowed(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0]; // Default to production origin

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
};

// Legacy export for backward compatibility
export const corsHeaders = getCorsHeaders();

export function jsonResponse(
  body: unknown,
  status = 200,
  requestOrigin?: string | null
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(requestOrigin),
      'Content-Type': 'application/json',
    },
  });
}

// Helper for image responses
export function imageResponse(
  body: BodyInit | null | undefined,
  status = 200,
  contentType = 'image/jpeg',
  cacheControl = 'public, max-age=86400',
  requestOrigin?: string | null
): Response {
  return new Response(body, {
    status,
    headers: {
      ...getCorsHeaders(requestOrigin),
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}
