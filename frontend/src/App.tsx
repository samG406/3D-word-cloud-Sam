import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { WordCloudScene, GalaxyBackground } from "./components/WordCloud3D";
import "./styles.css";

type KeywordData = { word: string; weight: number };

async function analyze(url: string): Promise<KeywordData[]> {
  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze: ${response.statusText}`);
  }

  const data = await response.json();
  return data.keywords;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    try {
      setLoading(true);
      setError(null);
      const data = await analyze(url);
      setKeywords(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      setError("Failed to paste from clipboard");
    }
  }

  return (
    <div className="relative w-full h-screen">
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 14], fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <color attach="background" args={["#0a0a1a"]} />
          <GalaxyBackground isStatic={true} />
        </Canvas>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-700 backdrop-blur-md border-b border-[#050608]">
        <div className="px-4 py-3">
          <h1 className="text-[#abf5fc] text-center text-2xl font-bold tracking-wide">3D Word Cloud</h1>
        </div>
      </div>

      <div className="fixed top-16 left-4 right-4 z-50 flex flex-wrap items-center justify-center gap-2 p-3 rounded-xl ">
        <strong className="text-[#abf5fc] text-sm font-semibold whitespace-nowrap">Enter news article URL:</strong>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="w-64 px-2 py-1.5 rounded-lg border-none bg-gray-800 text-[#cfe6ff] placeholder:text-[#86a5c0] focus:outline-none focus:ring-2 focus:ring-[#4a5568] focus:border-[#4a5568] text-sm"
        />
        <button 
          onClick={handlePaste}
          className="px-3.5 py-2.5 rounded-lg border border-[#21315a] bg-[#121a39] hover:bg-[#1a2342] hover:border-[#2a3f6a] text-[#cfe6ff] cursor-pointer transition-colors flex items-center justify-center"
          title="Paste URL"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
        </button>
        <button 
          onClick={run} 
          disabled={loading}
          className="px-3.5 py-2.5 rounded-lg border-0 bg-[#6b7280] hover:bg-[#5a6069] active:bg-[#4a4f56] text-[#00111b] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing…" : "Go"}
        </button>
        <select
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg border border-[#21315a] bg-[#121a39] hover:bg-[#1a2342] hover:border-[#2a3f6a] text-[#cfe6ff] text-sm font-semibold cursor-pointer transition-colors"
        >
          <option value="" disabled>Sample Links</option>
          <option value="https://www.cbsnews.com">www.cbsnews.com</option>
          <option value="https://www.cnn.com">www.cnn.com</option>
          <option value="https://www.nytimes.com">www.nytimes.com</option>
        </select>
        {error && (
          <span className="text-[#ff9aa2] text-sm">
            {error}
          </span>
        )}
      </div>

      <div className="relative w-full h-full pt-35 z-10">
        <WordCloudScene words={keywords} />
      </div>
    </div>
  );
}
