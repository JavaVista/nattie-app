// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders });

  const { prompt } = await req.json();

  if (!prompt)
    return new Response(JSON.stringify({ error: 'Missing prompt parameter' }), {
      status: 400,
    });

  const apiKey = Deno.env.get('GEMINI_API_KEY');

  if (!apiKey)
    return new Response(
      JSON.stringify({ error: 'Your Gemini API key is not configured' }),
      {
        status: 500,
      }
    );

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const facts = raw
      .split('\n')
      .filter(
        (bullet) =>
          bullet.trim().startsWith('-') ||
          bullet.trim().startsWith('•') ||
          /^\d+\.\s+\*\*/.test(bullet.trim())
      )
      .map((bullet) => {
        return bullet
          .replace(/^[-•]\s*/, '')
          .replace(/^\d+\.\s+\*\*/, '**')
          .trim();
      })
      .slice(0, 3);

    return jsonResponse({ facts });
  } catch (_) {
    return jsonResponse({ error: 'Error generating facts.' }, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-useless-facts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

/*
const prompt = `Give me 3 useless facts about the location "${location}", specifically the place "${place}"` : ''}.

*/
