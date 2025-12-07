from typing import List, Dict
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

STOPWORDS = set("""
the of and to in a is for that on with as by be are was were this it from at an or has have had
not but they you we their our his her its who which will would can could should may might into
about over under between more most other some any each per than also been being because during
new said one two three four five six seven eight nine ten after before month year years
""".split())

def _preprocessor(text: str) -> str:
    return text.lower()

def extract_keywords(text: str, top_k: int = 60) -> List[Dict]:
    docs = [p.strip() for p in re.split(r"\n+", text) if len(p.split()) >= 5]
    if not docs:
        docs = [text]

    vectorizer = TfidfVectorizer(
        preprocessor=_preprocessor,
        token_pattern=r"[a-z]{4,}",
        stop_words=list(STOPWORDS),
        lowercase=False
    )

    X = vectorizer.fit_transform(docs)
    tfidf = np.asarray(X.mean(axis=0)).ravel()
    terms = np.array(vectorizer.get_feature_names_out())

    idx = np.argsort(-tfidf)[:top_k]
    top_terms = terms[idx]
    top_scores = tfidf[idx]

    if top_scores.max() > 0:
        weights = (top_scores - top_scores.min()) / (top_scores.max() - top_scores.min() + 1e-9)
    else:
        weights = np.zeros_like(top_scores)

    
    return [{"word": w, "weight": float(round(float(s), 4))} for w, s in zip(top_terms, weights)]
