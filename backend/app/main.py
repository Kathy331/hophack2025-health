from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routes import gem_route, user_route 
from app.routes import gem_route, user_route

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gem_route.router, prefix="/gem", tags=["gem"])
app.include_router(user_route.router, prefix="/user", tags=["user"])  # new user endpoints
app.include_router(items_route.router, prefix="/item", tags=["item"])

@app.get("/")
def health_check():
    return {"status": "ok"}
