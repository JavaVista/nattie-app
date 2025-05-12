// This function acts as a proxy to the Google Places API.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, imageResponse } from '../_shared/cors.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
if (!GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY.');
}
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const photo_reference = url.searchParams.get('photo_reference');
    const maxwidth = url.searchParams.get('maxwidth') || '400';

    if (endpoint === 'photo' && photo_reference) {
      if (!GOOGLE_API_KEY) {
        console.error('GET /photo: Missing GOOGLE_PLACES_API_KEY.');
        return jsonResponse({ error: 'Server configuration error.' }, 500);
      }
      const googlePhotoUrl = `${PLACES_API_BASE_URL}/photo?maxwidth=${maxwidth}&photoreference=${photo_reference}&key=${GOOGLE_API_KEY}`;

      try {
        const photoResponse = await fetch(googlePhotoUrl, {
          redirect: 'follow',
        });

        if (!photoResponse.ok) {
          const errorBody = await photoResponse.text();
          console.error(
            `Google Photo API error: ${photoResponse.status} ${photoResponse.statusText}. Body: ${errorBody}`
          );
          return jsonResponse(
            { error: 'Failed to fetch photo.' },
            photoResponse.status
          );
        }

        const contentType =
          photoResponse.headers.get('Content-Type') || 'image/jpeg';

        return imageResponse(photoResponse.body, 200, contentType);
      } catch (error) {
        console.error('Error fetching photo from Google:', error);
        return jsonResponse(
          { error: 'Internal server error while fetching photo.' },
          500
        );
      }
    } else {
      return jsonResponse({ error: 'Invalid GET request parameters.' }, 400);
    }
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing JSON body:', error);
      return jsonResponse({ error: 'Invalid JSON body provided.' }, 400);
    }

    const { endpoint, input, place_id } = body;
    let apiUrl = '';

    if (!GOOGLE_API_KEY) {
      console.error('POST request: Missing GOOGLE_PLACES_API_KEY.');
      return jsonResponse({ error: 'Server configuration error.' }, 500);
    }

    if (endpoint === 'autocomplete' && typeof input === 'string') {
      const searchType = body.type || '';
      const location = body.location || '';
      let queryParams = `input=${encodeURIComponent(input)}`;

      // query with different types based on request
      if (searchType === 'cities') {
        queryParams += '&types=(cities)';
      } else if (searchType === 'establishment') {
        queryParams += '&types=establishment';
      } else if (searchType === 'tourist_attraction') {
        queryParams += '&types=tourist_attraction';
      } else if (searchType === 'point_of_interest') {
        queryParams += '&types=point_of_interest';
      } else if (searchType === 'landmark') {
        queryParams += '&types=landmark';
      }

      // location bias if provided
      if (
        location &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number'
      ) {
        queryParams += `&location=${location.lat},${location.lng}&radius=50000`;
      }

      apiUrl = `${PLACES_API_BASE_URL}/autocomplete/json?${queryParams}&key=${GOOGLE_API_KEY}`;
    } else if (endpoint === 'details' && typeof place_id === 'string') {
      apiUrl = `${PLACES_API_BASE_URL}/details/json?place_id=${place_id}&fields=name,photos,geometry,address_components&key=${GOOGLE_API_KEY}`;
    } else {
      return jsonResponse(
        { error: 'Invalid POST endpoint or missing/invalid parameters.' },
        400
      );
    }

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const status = response.ok ? 200 : response.status;

      return jsonResponse(data, status);
    } catch (error) {
      console.error(`Error fetching from Google API (${endpoint}):`, error);
      return jsonResponse(
        { error: `Internal server error during ${endpoint}.` },
        500
      );
    }
  }

  return jsonResponse({ error: `Method ${req.method} not allowed.` }, 405);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/places-proxy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
