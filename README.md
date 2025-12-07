# 3D Word Cloud – FastAPI + React Three Fiber

This project is an full-stack application that extracts keywords from any news article and visualizes them as a 3D word cloud  

It demonstrates a complete end-to-end flow 
where a user enters a URL, the backend processes the text using TF-IDF, and the frontend renders an interactive 3D visualization.

---

## Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React, Vite, TypeScript, React Three Fiber, TailwindCSS, Three.js|
| Backend | FastAPI, Python , TF-IDF, trafilatura lib|

---

## Project Structure

```plaintext
3d-word-cloud/
│
├── backend/
│   ├── src/
│   │   ├── main.py
│   │   ├── text_extraction.py
│   │   └── key.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   └── WordCloud3D.tsx
│   │   └── styles.css
│   └── package.json
│
├── package.json
└── README.md
````

---

## Backend Overview

The backend is built using **FastAPI** and handles the following:

* Fetches article text from a given URL
* Cleans and processes the text
* Extracts top keywords using **TF-IDF**
* Returns the results as a JSON response for frontend visualization

### **API Endpoints**

| Method | Endpoint   | Description                                                      |
| ------ | ---------- | ---------------------------------------------------------------- |
| POST   | `/analyze` | Accepts `{ "url": "<article_url>" }` and returns keyword weights |

---


## Setup

Install all dependencies:

```bash
npm run setup
```

This will:
- Install root dependencies 
- Install frontend dependencies
- Create Python virtual environment
- Install backend dependencies

## Running the Project

Start both frontend and backend servers:

```bash
npm run dev
```

This will start:
- Backend server on [http://localhost:8000](http://localhost:8000)
- Frontend server on [http://localhost:5173](http://localhost:5173)

## Full Application Flow

1. User enters a URL in the input box.
2. The frontend sends a `POST` request to `/analyze`.
3. The FastAPI backend fetches and cleans the article text.
4. TF-IDF analysis extracts top keywords.
5. Backend returns keyword-weight pairs.
6. The frontend visualizes them as an interactive **3D Word Cloud**.

---

## Features

* Simple URL input with pre-populated sample links
* Asynchronous API communication between frontend and backend
* Loading and error handling with user feedback
* TF-IDF-based keyword extraction and scoring
* Interactive 3D visualization using Three.js and React Three Fiber
* Clean, modular codebase for easy expansion

---

## Libraries Used

**Backend:** fastapi, uvicorn, trafilatura, scikit-learn, numpy, scipy

**Frontend:** react, vite, @react-three/fiber, @react-three/drei, three, tailwindcss

---

