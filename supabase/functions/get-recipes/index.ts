
import { createClient } from "supabase"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Fallback: Recetas mockeadas para cuando Spoonacular no esté disponible ──
const FALLBACK_RECIPES = [
    {
        id: 9001,
        title: "Pasta Carbonara Clásica",
        image: "https://img.spoonacular.com/recipes/716429-312x231.jpg",
        summary: "La auténtica carbonara italiana con huevo, guanciale, pecorino y pimienta negra. Cremosa sin usar crema.",
        readyInMinutes: 25,
        servings: 4,
        tags: "Italian,dinner,main course",
        ingredients: "400g spaghetti,200g guanciale,4 yemas de huevo,100g pecorino romano,pimienta negra,sal"
    },
    {
        id: 9002,
        title: "Tacos al Pastor",
        image: "https://img.spoonacular.com/recipes/795751-312x231.jpg",
        summary: "Tacos mexicanos con cerdo marinado en achiote, piña asada, cilantro y cebolla. Sabor ahumado y dulce.",
        readyInMinutes: 45,
        servings: 6,
        tags: "Mexican,dinner,street food",
        ingredients: "500g cerdo,2 chiles guajillo,1 piña,tortillas de maíz,cilantro,cebolla,achiote,limón"
    },
    {
        id: 9003,
        title: "Pollo Teriyaki con Arroz",
        image: "https://img.spoonacular.com/recipes/782585-312x231.jpg",
        summary: "Pollo glaseado con salsa teriyaki casera servido sobre arroz al vapor. Dulce, salado y satisfactorio.",
        readyInMinutes: 30,
        servings: 4,
        tags: "Japanese,dinner,main course",
        ingredients: "4 muslos de pollo,3 tbsp salsa soya,2 tbsp mirin,1 tbsp azúcar,jengibre,ajo,arroz,semillas de sésamo"
    },
    {
        id: 9004,
        title: "Ensalada César con Pollo",
        image: "https://img.spoonacular.com/recipes/715538-312x231.jpg",
        summary: "Lechuga romana crujiente con aderezo césar cremoso, crutones dorados y pollo a la parrilla.",
        readyInMinutes: 20,
        servings: 2,
        tags: "American,lunch,salad",
        ingredients: "lechuga romana,pechuga de pollo,parmesano,crutones,aderezo césar,limón,ajo"
    },
    {
        id: 9005,
        title: "Risotto de Hongos Porcini",
        image: "https://img.spoonacular.com/recipes/716426-312x231.jpg",
        summary: "Risotto cremoso con hongos porcini secos rehidratados, vino blanco y queso parmesano. Pura comfort food.",
        readyInMinutes: 40,
        servings: 4,
        tags: "Italian,dinner,main course,vegetarian",
        ingredients: "300g arroz arborio,30g hongos porcini secos,1 cebolla,vino blanco,caldo de verduras,parmesano,mantequilla"
    },
    {
        id: 9006,
        title: "Salmón Glaseado con Miel y Soya",
        image: "https://img.spoonacular.com/recipes/659135-312x231.jpg",
        summary: "Filete de salmón horneado con un glaseado agridulce de miel y soya. Listo en minutos.",
        readyInMinutes: 20,
        servings: 2,
        tags: "Asian,dinner,seafood,healthy",
        ingredients: "2 filetes de salmón,3 tbsp miel,2 tbsp salsa soya,1 tbsp aceite de sésamo,ajo,jengibre,limón"
    },
    {
        id: 9007,
        title: "Burritos de Frijoles Negros",
        image: "https://img.spoonacular.com/recipes/794349-312x231.jpg",
        summary: "Burritos rellenos de frijoles negros sazonados, arroz, guacamole, pico de gallo y crema. Vegetariano.",
        readyInMinutes: 25,
        servings: 4,
        tags: "Mexican,lunch,vegetarian",
        ingredients: "tortillas de harina,frijoles negros,arroz,aguacate,tomate,cebolla,cilantro,crema,chile jalapeño"
    },
    {
        id: 9008,
        title: "Pad Thai de Camarones",
        image: "https://img.spoonacular.com/recipes/663136-312x231.jpg",
        summary: "Fideos de arroz salteados con camarones, tofu, brotes de soya, cacahuates y salsa pad thai casera.",
        readyInMinutes: 30,
        servings: 4,
        tags: "Thai,dinner,seafood",
        ingredients: "200g fideos de arroz,200g camarones,2 huevos,brotes de soya,cacahuates,salsa de pescado,tamarindo,azúcar morena,limón"
    },
    {
        id: 9009,
        title: "Pizza Margherita Casera",
        image: "https://img.spoonacular.com/recipes/665769-312x231.jpg",
        summary: "Pizza clásica napolitana con masa casera, salsa de tomate San Marzano, mozzarella fresca y albahaca.",
        readyInMinutes: 35,
        servings: 4,
        tags: "Italian,dinner,main course",
        ingredients: "300g harina,levadura,agua,sal,tomates San Marzano,mozzarella fresca,albahaca,aceite de oliva"
    },
    {
        id: 9010,
        title: "Bowl de Açaí Tropical",
        image: "https://img.spoonacular.com/recipes/716268-312x231.jpg",
        summary: "Bowl energético de açaí con banana, granola crujiente, frutas tropicales y miel. Desayuno perfecto.",
        readyInMinutes: 10,
        servings: 2,
        tags: "Brazilian,breakfast,healthy,vegan",
        ingredients: "200g pulpa de açaí,1 banana,granola,fresas,arándanos,mango,coco rallado,miel"
    }
]

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')

        // Si no hay API key, devolver fallback directamente
        if (!SPOONACULAR_API_KEY) {
            console.warn('[get-recipes] No SPOONACULAR_API_KEY set, returning fallback data')
            return new Response(JSON.stringify(FALLBACK_RECIPES), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const url = new URL(req.url)
        const query = url.searchParams.get('query') || ''

        // 1. Try DB First
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        let { data: dbRecipes, error: dbError } = await supabase
            .from('recipes')
            .select('*')

        // Filter by query if present
        if (query && dbRecipes) {
            dbRecipes = dbRecipes.filter((r: any) =>
                r.title.toLowerCase().includes(query.toLowerCase()) ||
                (r.tags && r.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase())))
            )
        }

        if (dbRecipes && dbRecipes.length > 0) {
            console.log(`[get-recipes] Serving ${dbRecipes.length} recipes from DB`)
            return new Response(JSON.stringify(dbRecipes), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Fallback to Spoonacular if DB empty or no match
        console.log('[get-recipes] No DB matches, trying Spoonacular...')

        const spoonUrl = new URL('https://api.spoonacular.com/recipes/complexSearch')
        spoonUrl.searchParams.set('apiKey', SPOONACULAR_API_KEY)
        spoonUrl.searchParams.set('query', query)
        spoonUrl.searchParams.set('addRecipeInformation', 'true')
        spoonUrl.searchParams.set('number', '10')

        const response = await fetch(spoonUrl)
        const data = await response.json()

        if (!response.ok) {
            // ── FALLBACK: Spoonacular falló (límite, error, etc.) ──
            console.warn(`[get-recipes] Spoonacular error: ${data.message || response.statusText}. Returning hardcoded fallback.`)
            return new Response(JSON.stringify(FALLBACK_RECIPES), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // ROKU TRANSFORMATION: Flatten arrays to CSV strings
        const rokuRecipes = data.results.map((recipe: any) => {
            const tags = [
                ...(recipe.cuisines || []),
                ...(recipe.dishTypes || []),
                ...(recipe.diets || []),
                ...(recipe.occasions || [])
            ] // .join(',') // Keep as array for consistency? Roku expects CSV sometimes, but DB uses arrays. 
            // Let's normalize DB to match Roku expectations or vice versa.
            // Existing code flattened to CSV. I will keep it consistent.
            // Wait, the DB 'recipes' table uses text[]. Roku code might need update if it expects CSV.
            // Let's stick to the current Roku contract: JSON with properties. 
            // If Roku expects CSV string for tags, we should convert DB arrays to CSV too?
            // Let's assume standardizing on Array in JSON is better, but check MainScene.brs usage.
            // MainScene.brs uses `item.title` and `item.image`. It doesn't seem to parse tags deep yet.
            // StandardGridItem just shows title.
            // So we are good.

            return {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                summary: recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '') : '',
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                // tags: tags.join(','), // Legacy
                tags: tags, // New standard (Array)
                ingredients: (recipe.extendedIngredients || []).map((ing: any) => ing.original || ing.name)
            }
        })

        return new Response(JSON.stringify(rokuRecipes), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        // ── FALLBACK: Error inesperado ──
        console.error(`[get-recipes] Unexpected error: ${(error as Error).message}. Returning fallback.`)
        return new Response(JSON.stringify(FALLBACK_RECIPES), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
