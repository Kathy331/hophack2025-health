from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import gem_route, user_route, items_route
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import all routes
from app.routes import gem_route, user_route, items_route

# Include routers
app.include_router(gem_route.router, prefix="/gem", tags=["gem"])
app.include_router(user_route.router, prefix="/user", tags=["user"])
app.include_router(items_route.router, prefix="/items", tags=["items"])

@app.get("/")
def health_check():
    return {"status": "ok"}
