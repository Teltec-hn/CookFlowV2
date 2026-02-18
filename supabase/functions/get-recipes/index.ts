
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')
        if (!SPOONACULAR_API_KEY) {
            throw new Error('Missing SPOONACULAR_API_KEY')
        }

        // Parse URL params for query if any, default to some query if needed or just random
        const url = new URL(req.url)
        const query = url.searchParams.get('query') || ''

        // Construct Spoonacular URL
        // We use complexSearch to get data. We need addRecipeInformation to get ingredients/tags.
        const spoonUrl = new URL('https://api.spoonacular.com/recipes/complexSearch')
        spoonUrl.searchParams.set('apiKey', SPOONACULAR_API_KEY)
        spoonUrl.searchParams.set('query', query)
        spoonUrl.searchParams.set('addRecipeInformation', 'true')
        spoonUrl.searchParams.set('number', '10') // Limit to 10 for now

        const response = await fetch(spoonUrl)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(`Spoonacular API Error: ${data.message || response.statusText}`)
        }

        // ROKU TRANSFORMATION: Flatten arrays to CSV strings
        const rokuRecipes = data.results.map((recipe: any) => {
            // Collect tags from various fields
            const tags = [
                ...(recipe.cuisines || []),
                ...(recipe.dishTypes || []),
                ...(recipe.diets || []),
                ...(recipe.occasions || [])
            ].join(',')

            // ingredients to CSV
            // extendedIngredients is an array of objects, we want the 'name' or 'original' string
            const ingredients = (recipe.extendedIngredients || [])
                .map((ing: any) => ing.original || ing.name)
                .join(',')

            return {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                summary: recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '') : '', // Strip HTML from summary for Roku
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                tags: tags,           // CSV String
                ingredients: ingredients // CSV String
            }
        })

        return new Response(JSON.stringify(rokuRecipes), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
