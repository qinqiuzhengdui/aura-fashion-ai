from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os

from backend.sourcing import run_sourcing
from backend.llm_services import generate_assets_from_prompt, analyze_features_from_images

app = FastAPI(title="AURA Fashion AI API")

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

@app.post("/api/source_images")
async def source_images(req: SourcingRequest):
    try:
        results = await run_sourcing(req.prompt)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_images")
async def generate_images(req: GenerateRequest):
    try:
        results = await generate_assets_from_prompt(req.prompt, req.selectedImages)
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
