from typing import List, Dict
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def _preprocessor(text: str) -> str:
    return text.lower()

def extract_keywords(text: str, top_k: int = 60) -> List[Dict]:
    paragraphs = [paragraph.strip() for paragraph in re.split(r"\n+", text) if len(paragraph.split()) >= 5]
    if not paragraphs:
        paragraphs = [text]

    vectorizer = TfidfVectorizer(
        preprocessor=_preprocessor,
        token_pattern=r"[a-z]{4,}",
        stop_words='english',
        lowercase=False
    )

    document_matrix = vectorizer.fit_transform(paragraphs)
    mean_tfidf_scores = np.asarray(document_matrix.mean(axis=0)).ravel()
    vocabulary = np.array(vectorizer.get_feature_names_out())

    top_indices = np.argsort(-mean_tfidf_scores)[:top_k]
    selected_terms = vocabulary[top_indices]
    selected_scores = mean_tfidf_scores[top_indices]

    if selected_scores.max() > 0:
        normalized_weights = (selected_scores - selected_scores.min()) / (selected_scores.max() - selected_scores.min() + 1e-9)
    else:
        normalized_weights = np.zeros_like(selected_scores)

    
    return [{"word": term, "weight": float(round(float(weight), 4))} for term, weight in zip(selected_terms, normalized_weights)]
