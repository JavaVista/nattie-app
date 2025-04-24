// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

Deno.serve(async (req) => {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Missing prompt parameter' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
  const apiKey = Deno.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

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
    console.log(' raw:', raw);

    // TODO: Refactor to a 3 bullet prompt
    const facts = raw
      .split('\n')
      .filter(
        (line) => line.trim().startsWith('-') || line.trim().startsWith('•')
      )
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 3);

    return new Response(JSON.stringify({ facts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error generating facts' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
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
