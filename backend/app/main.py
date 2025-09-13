from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import gem_route

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(gem_route.router, prefix="/gem", tags=["gem"])

@app.get("/")
def health_check():
    return {"status": "ok"}
