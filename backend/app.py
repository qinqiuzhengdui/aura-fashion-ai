from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os

from backend.sourcing import run_sourcing
from backend.llm_services import generate_assets_from_prompt, analyze_features_from_images
from backend.db import init_db, save_sourcing_record, save_generation_record, get_generation_history

app = FastAPI(title="AURA Fashion AI API")

# Initialize DB on startup
@app.on_event("startup")
async def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SourcingRequest(BaseModel):
    prompt: str

class GenerateRequest(BaseModel):
    prompt: str
    selectedImages: List[str]

@app.get("/api/history/generation")
async def fetch_generation_history():
    try:
        results = get_generation_history()
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/source_images")
async def source_images(req: SourcingRequest):
    try:
        results = await run_sourcing(req.prompt)
        # Save sourcing results to database
        save_sourcing_record(req.prompt, results)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_images")
async def generate_images(req: GenerateRequest):
    try:
        results = await generate_assets_from_prompt(req.prompt, req.selectedImages)
        # Save generation results to database
        save_generation_record(req.prompt, results)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze_features")
async def analyze_features(req: GenerateRequest):
    try:
        results = await analyze_features_from_images(req.prompt, req.selectedImages)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount the static files (frontend)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8080, reload=True)
