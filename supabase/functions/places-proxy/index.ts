// This function acts as a proxy to the Google Places API.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  const { endpoint, input, place_id, photo_reference } = await req.json();

  let apiUrl = '';

  if (endpoint === 'autocomplete') {
    apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=(cities)&key=${GOOGLE_API_KEY}`;
  } else if (endpoint === 'details') {
    apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,photos,geometry,address_components&key=${GOOGLE_API_KEY}`;
  } else if (endpoint === 'photo') {
    const redirectUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${GOOGLE_API_KEY}`;
    return Response.redirect(redirectUrl, 302);
  } else {
    return jsonResponse({ error: 'Invalid endpoint.' }, 400);
  }

  const response = await fetch(apiUrl);
  const data = await response.json();

  return jsonResponse(data);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/places-proxy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
