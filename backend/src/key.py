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
    """Preprocess text by converting to lowercase."""
    return text.lower()

def extract_keywords(text: str, top_k: int = 60) -> List[Dict]:
    docs = [p.strip() for p in re.split(r"\n+", text) if len(p.split()) >= 5]
    if not docs:
        docs = [text]

    # Use preprocessor for lowercasing, token_pattern for regex matching, stop_words for filtering
    vectorizer = TfidfVectorizer(
        preprocessor=_preprocessor,
        token_pattern=r"[a-z]{4,}",  # Match lowercase words with 4+ letters (excludes 3-letter words like "off")
        stop_words=list(STOPWORDS),
        lowercase=False  # Already handled by preprocessor
    )

    X = vectorizer.fit_transform(docs)

    #          word1  word2  word3  ...
    # doc1:   0.5    0.0    0.3
    # doc2:   0.0    0.7    0.2
    # doc3:   0.3    0.4    0.0

    tfidf = np.asarray(X.mean(axis=0)).ravel()

    # If X is:
    #        python  machine  learning
    # doc1:   0.5     0.0      0.3
    # doc2:   0.0     0.7      0.2
    # doc3:   0.3     0.4      0.0
    # 
    # Mean:   (0.5+0.0+0.3)/3  (0.0+0.7+0.4)/3  (0.3+0.2+0.0)/3
    #      =   0.267           0.367           0.167

    terms = np.array(vectorizer.get_feature_names_out())
    # vectorizer.get_feature_names_out() = array(['python', 'machine', 'learning', 'data', 'science', ...])  # word names in order
    # Index 0 = 'python' has score 0.12
    # Index 1 = 'machine' has score 0.45
    # Index 2 = 'learning' has score 0.23

    # Original arrays:
    # tfidf = [0.12, 0.45, 0.23, 0.78, 0.09, 0.56]  # scores
    # terms = ['a',  'b',  'c',  'd',  'e',  'f']   # words
    # Index:  0     1     2     3     4     5

    # After argsort(-tfidf):
    # sorted_indices = [3, 5, 1, 2, 0, 4]

# Time complexity: O(n log n) for n elements.
# Memory: Creates a new integer array of the same length.


    idx = np.argsort(-tfidf)[:top_k]
    top_terms = terms[idx]
    top_scores = tfidf[idx]

    if top_scores.max() > 0:
        weights = (top_scores - top_scores.min()) / (top_scores.max() - top_scores.min() + 1e-9)

        #top_scores = np.array([0.91, 0.67, 0.43, 0.25])

        # Step 1: Find min and max
        #min_val = 0.25
        #max_val = 0.91
        #range_val = 0.91 - 0.25 = 0.66

        # Step 2: Shift to zero
        #shifted = [0.91 - 0.25, 0.67 - 0.25, 0.43 - 0.25, 0.25 - 0.25]
                #= [0.66, 0.42, 0.18, 0.0]

        # Step 3: Divide by range (with epsilon)
        #weights = [0.66 / (0.66 + 1e-9), 0.42 / (0.66 + 1e-9), 0.18 / (0.66 + 1e-9), 0.0 / (0.66 + 1e-9)]
                #= [0.999999..., 0.636363..., 0.272727..., 0.0]
                #≈ [1.0, 0.6364, 0.2727, 0.0]
    else:
        weights = np.zeros_like(top_scores)

    
    return [{"word": w, "weight": float(round(float(s), 4))} for w, s in zip(top_terms, weights)]
