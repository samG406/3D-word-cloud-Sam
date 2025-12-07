from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from .key import extract_keywords
from .text_extraction import fetch_and_extract

app = FastAPI(title="3D Word Cloud API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArticleAnalysisRequest(BaseModel):
    url: HttpUrl

class KeywordData(BaseModel):
    word: str
    weight: float

class ArticleAnalysisResponse(BaseModel):
    keywords: List[KeywordData]

@app.post("/analyze", response_model=ArticleAnalysisResponse)
def analyze_article(request: ArticleAnalysisRequest):
    try:
        extracted_text = fetch_and_extract(str(request.url))
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Fetch failed: {error}")

    if not extracted_text or len(extracted_text.split()) < 50:
        raise HTTPException(status_code=422, detail="Not enough article text extracted")

    try:
        keyword_list = extract_keywords(extracted_text, top_k=60)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Keyword extraction failed: {error}")

    return {"keywords": keyword_list}
