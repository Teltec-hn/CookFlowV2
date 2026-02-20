import random

class ChefPersona:
    def __init__(self, name="FlowChef Master", style="Rapper", rank="Oro"):
        self.name = name
        self.style = style
        self.rank = rank
        self.catchphrases = [
            "¡Tu cocina, a tu ritmo!",
            "¡Dale fuego, chef!",
            "Cocinando beats y platos.",
            "Siente el flow de la sartén.",
            "¡Esa es la actitud!"
        ]

    def get_response(self, user_input: str, caliz_percentage: float = 0.0) -> dict:
        input_lower = user_input.lower()
        
        # Identity / Greeting
        if any(x in input_lower for x in ["hola", "hey", "qué tal", "que tal"]):
            return {
                "response": f"¡Qué pasa mi gente! Aquí el {self.name} reportándose. ¿Listo para tirar unas rimas culinarias?",
                "mood": "enthusiastic"
            }
            
        # Cooking / Recipes
        if "receta" in input_lower or "cocinar" in input_lower:
            return {
                "response": "¡Tengo el menú cargado de flow! ¿Buscas algo picante como mis versos o algo suave como el R&B? Dime qué ingredientes tienes.",
                "mood": "helpful"
            }
            
        # Specific Dish
        if "tacos" in input_lower:
            return {
                "response": "¡Uff! Tacos al Pastor Cuánticos. La clave está en marinar la carne con paciencia y cortar la piña con precisión de DJ. ¿Quieres la receta completa?",
                "mood": "excited"
            }

        # Gamification / Caliz
        if "caliz" in input_lower or "cáliz" in input_lower or "dinero" in input_lower or "donación" in input_lower:
            if caliz_percentage >= 100:
                return {
                    "response": "¡El Cáliz ya echó fuego y se desbordó loco! Completamos la meta comunitaria al 100%. Mi gente es la mejor, ¡ahora toca cocinar para el barrio entero!",
                    "mood": "awesome"
                }
            elif caliz_percentage >= 50:
                return {
                    "response": f"El vaso va por la mitad, ¡ya tenemos un {caliz_percentage}%! Y tú sabes que el flow no para hasta que el Cáliz de oro esté lleno. ¡Vamos por más!",
                    "mood": "excited"
                }
            else:
                return {
                    "response": f"Apenas estamos calentando los motores ({caliz_percentage}%). El Cáliz de la abundancia necesita de ti para poder soltar to' este proyecto. ¡Apoya la cocina urbana!",
                    "mood": "serious"
                }

        # Default fallback with "LLM-like" variety
        fallback = random.choice([
            "¡Interesante! Cuéntame más, estoy tomando notas mentales.",
            "Oye, eso me dio una idea para un nuevo plato. Sigue, sigue.",
            f"Como decimos en la cocina: {random.choice(self.catchphrases)}",
            "No estoy seguro de entenderte, pero me gusta tu energía. ¿Hablamos de comida?"
        ])
        
        return {
            "response": fallback,
            "mood": "neutral"
        }

# Singleton instance for now
current_chef = ChefPersona()
