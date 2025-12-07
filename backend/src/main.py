from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List
from .text_extraction import fetch_and_extract
from .key import extract_keywords

app = FastAPI(title="3D Word Cloud API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: HttpUrl

class WordWeight(BaseModel):
    word: str
    weight: float

class AnalyzeResponse(BaseModel):
    words: List[WordWeight]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    try:
        text = fetch_and_extract(str(req.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fetch failed: {e}")

    if not text or len(text.split()) < 50:
        raise HTTPException(status_code=422, detail="Not enough article text extracted")

    try:
        words = extract_keywords(text, top_k=60)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyword extraction failed: {e}")

    return {"words": words}
