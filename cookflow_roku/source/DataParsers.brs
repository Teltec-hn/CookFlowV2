' ============================================================
' COOKFLOW DATA PARSERS (V2.1)
' Handles "Flattened" JSONs and RLS-compliant structures
' ============================================================

' Parses a Chef Profile, preferring CSV fields for lists
function ParseChefProfile(json as Object) as Object
    if json = invalid return invalid
    
    chef = {
        id: "unknown",
        name: "Unknown Chef",
        bio: "",
        avatar_url: "",
        voice_style: "standard",
        specialties: [],
        dietary_tags: [],
        is_premium: false,
        source: "live" ' live, cache, fallback
    }
    
    ' 1. Map Core Fields (Safe Access)
    if json.DoesExist("id") then chef.id = json.id
    if json.DoesExist("name") then chef.name = json.name
    if json.DoesExist("bio") then chef.bio = json.bio
    if json.DoesExist("avatar_url") then chef.avatar_url = json.avatar_url
    if json.DoesExist("voice_style") then chef.voice_style = json.voice_style
    if json.DoesExist("is_premium") then chef.is_premium = json.is_premium
    
    ' 2. Handle Cloudinary/WebP Optimization
    ' If URL doesn't have format param, append it
    if chef.avatar_url <> "" and Instr(1, chef.avatar_url, "cloudinary") > 0
        if Instr(1, chef.avatar_url, "f_auto") = 0
            chef.avatar_url = chef.avatar_url + "?f_auto,q_auto,w_400"
        end if
    end if
    
    ' 3. Smart Parsing: CSV vs Array (The V2.1 Fix)
    ' Priority: Check CSV first (Roku Optimized), then fallback to Array
    
    ' Specialties
    if json.DoesExist("specialties_csv") and json.specialties_csv <> "" and json.specialties_csv <> invalid
        chef.specialties = json.specialties_csv.Split(",")
        print "[PARSER] Fast-parsed specialties from CSV"
    else if json.DoesExist("specialties") and Type(json.specialties) = "roArray"
        chef.specialties = json.specialties
        print "[PARSER] Slow-parsed specialties from Array"
    end if
    
    ' Dietary Tags
    if json.DoesExist("dietary_tags_csv") and json.dietary_tags_csv <> "" and json.dietary_tags_csv <> invalid
        chef.dietary_tags = json.dietary_tags_csv.Split(",")
    else if json.DoesExist("dietary_tags") and Type(json.dietary_tags) = "roArray"
        chef.dietary_tags = json.dietary_tags
    end if
    
    return chef
end function

' Parses a Recipe List
function ParseRecipeList(jsonArray as Object) as Object
    recipes = []
    
    if Type(jsonArray) <> "roArray" return recipes
    
    for each item in jsonArray
        recipe = {
            id: item.id,
            title: item.title,
            image_url: item.image_url,
            cook_time: "0 min",
            difficulty: "easy"
        }
        
        if item.DoesExist("cook_time_minutes") 
            recipe.cook_time = item.cook_time_minutes.ToStr() + " min"
        end if
        
        if item.DoesExist("difficulty_level")
            recipe.difficulty = item.difficulty_level
        end if
        
        recipes.Push(recipe)
    end for
    
    return recipes
end function
