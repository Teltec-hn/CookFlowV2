import { serve } from "std/server"
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS para el Roku
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { route, id } = await req.json()

    // RUTA: Perfil del Chef
    if (route === 'chef-profile') {
      const { data, error } = await supabaseClient
        .from('chef_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // ESTRATEGIA V2.1: Transformación para Roku
      // Si no existe el CSV en DB, lo creamos al vuelo para el cliente
      const response = {
        ...data,
        specialties_csv: data.specialties_csv || data.specialties?.join(',') || "",
        voice_style: data.voice_style || "Default"
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), { status: 404 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})