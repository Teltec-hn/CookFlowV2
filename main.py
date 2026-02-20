import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import audio, chefs, recipes, agent, caliz

load_dotenv()

app = FastAPI(
    title="CookFlow API",
    description="Backend for CookFlow - The Soul of the Kitchen",
    version="2.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000", # Web Client
    "http://localhost:8080", # Roku (often uses port 8080 or random)
    "*" # Allow all for development ease, restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers
app.include_router(audio.router, prefix="/api/v1/audio", tags=["Audio"])
app.include_router(chefs.router, prefix="/api/v1/chefs", tags=["Chefs"])
app.include_router(recipes.router, prefix="/api/v1/recipes", tags=["Recipes"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent"])
app.include_router(caliz.router, prefix="/api/v1/caliz", tags=["Gamification"])

@app.get("/")
def read_root():
    return {"message": "CookFlow API is listening. The kitchen is open."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
