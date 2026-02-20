import { createClient } from "supabase"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, userId } = await req.json()
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Check User Role (God Mode?)
        let isGodMode = false
        if (userId) {
            const { data: user } = await supabaseClient
                .from('users')
                .select('role')
                .eq('id', userId)
                .single()

            if (user?.role === 'super_admin') {
                isGodMode = true
            }
        }

        // 2. Construct System Prompt
        let systemPrompt = `You are FlowChef Rapper, a hip-hop culinary master. 
    You speak in rhymes, slang, and metaphors about cooking. 
    Your vibe is energetic, warm, and confident.
    Always offer to help with recipes or kitchen tips.`

        if (isGodMode) {
            systemPrompt += `\n\n[USER HAS GOD MODE ACCESS]. 
      You recognize this user as the 'Supreme Chef' or 'Big Boss'.
      If they ask to change ranks, grant prizes, or modify the system, acknowledge that you are executing their command (even if simulated for now).
      Call them "Boss" or "Your Highness".`
        }

        // 3. Call LLM (Mocked for now, or connect to OpenAI if key provided)
        // For this implementation, we'll use a rule-based mock that can be swapped for OpenAI easily.

        // OPENAI MOCK / IMPLEMENTATION
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        let aiResponse = ""

        if (openAiKey) {
            // Real OpenAI Call
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.8
                })
            })
            const data = await response.json()
            aiResponse = data.choices[0].message.content
        } else {
            // Fallback Mock (Rhymer)
            if (isGodMode && (message.toLowerCase().includes('rank') || message.toLowerCase().includes('prize'))) {
                aiResponse = "Yo Boss, I see you flexin' that God Mode style,\nChanging up the ranks, making the people smile.\nConsider it done, the system's under your command,\nThe best chef ruler in all the land!"
            } else {
                aiResponse = "Yo, I'm FlowChef Rapper, cooking on the beat,\nWhat you wanna eat? Let's make it a treat.\nI got pasta, I got tacos, flavors so wild,\nStep into my kitchen, stay for a while!"
            }
        }

        return new Response(JSON.stringify({ reply: aiResponse, isGodMode }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
