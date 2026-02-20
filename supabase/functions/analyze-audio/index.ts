import { createClient } from "supabase"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const chefId = formData.get('chef_id') as string

        if (!file || !chefId) {
            return new Response(
                JSON.stringify({ error: 'Missing file or chef_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. OpenAI Whisper (STT)
        // We need to send the file to OpenAI. 
        // Deno's FormData is compatible with fetch.
        const openaiKey = Deno.env.get('openai_api_key')
        if (!openaiKey) {
            throw new Error('OpenAI API Key not configured in Secrets')
        }

        const openaiFormData = new FormData()
        openaiFormData.append('file', file)
        openaiFormData.append('model', 'whisper-1')
        openaiFormData.append('language', 'es') // Force Spanish or make dynamic

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: openaiFormData,
        })

        if (!whisperResponse.ok) {
            const err = await whisperResponse.text()
            console.error('Whisper API Error:', err)
            throw new Error(`Whisper API Failed: ${err}`)
        }

        const whisperData = await whisperResponse.json()
        const transcript = whisperData.text

        // 2. GPT-4o Analysis (Chef DNA)
        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Analyze this chef's monologue for "Chef DNA".
            Return JSON only:
            {
                "intent_tags": ["tag1", "tag2"],
                "dna_factors": { "rhythm_score": 0-100, "storytelling_score": 0-100, "technique_focus_score": 0-100 },
                "keywords": ["key1", "key2", "key3"],
                "origin_stories": [{ "title": "...", "summary": "..." }]
            }`
                    },
                    { role: 'user', content: transcript }
                ],
                response_format: { type: 'json_object' }
            }),
        })

        if (!gptResponse.ok) {
            const err = await gptResponse.text()
            console.error('GPT API Error:', err)
            throw new Error(`GPT API Failed: ${err}`)
        }

        const gptData = await gptResponse.json()
        const analysis = JSON.parse(gptData.choices[0].message.content)

        // 3. Update Database (Supabase)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Insert Voice Entry
        const { error: entryError } = await supabaseClient
            .from('voice_entries')
            .insert({
                chef_id: chefId,
                audio_url: 'tbd', // We could upload to Storage here if needed
                transcript: transcript,
                intent_tags: analysis.intent_tags
            })

        if (entryError) console.error('DB Insert Error:', entryError)

        // Upsert Chef DNA
        // Note: In a real app, we'd merge scores intelligently. For MVP, we'll upsert via SQL or just overwrite logic if needed.
        // Let's do a simple upsert.
        const { error: dnaError } = await supabaseClient
            .from('chef_dna')
            .upsert({
                chef_id: chefId,
                rhythm_score: analysis.dna_factors.rhythm_score,
                storytelling_score: analysis.dna_factors.storytelling_score,
                technique_focus_score: analysis.dna_factors.technique_focus_score,
                keywords: analysis.keywords, // This overwrites. Merging would require a stored procedure or read-modify-write.
                last_updated: new Date().toISOString()
            })

        if (dnaError) console.error('DB DNA Upsert Error:', dnaError)


        return new Response(
            JSON.stringify({ transcript, analysis }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
