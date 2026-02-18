# Guía de Ejecución Local para Supabase Edge Functions

Sigue estos pasos para probar `get-recipes` localmente antes de desplegar.

## 1. Iniciar Stack de Supabase Local
Asegúrate de que Docker Desktop esté corriendo.
```powershell
supabase start
```

## 2. Configurar Variables de Entorno
Crea el archivo `.env.local` dentro de la carpeta `supabase/` para almacenar tu API Key de forma segura.
```powershell
# Ejecuta este comando en PowerShell desde la raíz del proyecto (C:\Client\CookFlow)
echo "SPOONACULAR_API_KEY=tu_api_key_real_aqui" > supabase/.env.local
```
> **Nota:** Edita el archivo `supabase/.env.local` manualmente y pon tu llave real de Spoonacular.

## 3. Servir la Función Localmente
Levanta el servidor de funciones inyectando las variables de entorno.
```powershell
# Desde C:\Client\CookFlow
supabase functions serve get-recipes --env-file ./supabase/.env.local --no-verify-jwt
```

## 4. Probar el Endpoint (Test de Transformación Roku)
Abre **otra terminal de PowerShell** y ejecuta lo siguiente para verificar que los arrays `tags` e `ingredients` se devuelvan como strings CSV:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:54321/functions/v1/get-recipes?query=pasta" -Method Get
```

### Respuesta Esperada (Formato Roku Friendly)
Deberías ver una respuesta JSON donde `tags` e `ingredients` son cadenas de texto, no arrays.

```json
[
  {
    "id": 654959,
    "title": "Pasta With Tuna",
    "image": "https://img.spoonacular.com/recipes/654959-312x231.jpg",
    "summary": "Pasta With Tuna might be just the main course you are searching for...",
    "readyInMinutes": 45,
    "servings": 4,
    "tags": "lunch,main course,main dish,dinner",
    "ingredients": "flour,onion,pasta,tuna"
  }
]
```
