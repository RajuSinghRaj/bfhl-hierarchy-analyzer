"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const arr = input.split(",").map(i => i.trim());

      const res = await fetch("/api/bfhl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: arr })
      });

      if (!res.ok) throw new Error("API failed");

      const result = await res.json();
      setData(result);
    } catch {
      setData({ error: "API Error" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">

      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-3xl p-8">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🌳 Hierarchy Analyzer
        </h1>

        {/* INPUT */}
        <textarea
          className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none p-4 rounded-xl mb-4 text-gray-800"
          rows={4}
          placeholder="Enter nodes like: A->B, B->C"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={`w-full py-3 rounded-xl font-semibold shadow-md transition ${
            input.trim()
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* OUTPUT */}
        {data && (
          <div className="mt-6 space-y-5">

            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-100 p-4 rounded-xl text-center shadow-sm">
                <p className="text-sm text-gray-600">Trees</p>
                <p className="text-xl font-bold text-indigo-700">
                  {data.summary.total_trees}
                </p>
              </div>

              <div className="bg-red-100 p-4 rounded-xl text-center shadow-sm">
                <p className="text-sm text-gray-600">Cycles</p>
                <p className="text-xl font-bold text-red-600">
                  {data.summary.total_cycles}
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-xl text-center shadow-sm">
                <p className="text-sm text-gray-600">Largest Root</p>
                <p className="text-xl font-bold text-green-600">
                  {data.summary.largest_tree_root || "-"}
                </p>
              </div>
            </div>

            {/* HIERARCHIES */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Hierarchies
              </h2>

              {data.hierarchies.map((h, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl mb-3 border shadow-sm">

                  <p className="font-semibold text-gray-800">
                    Root: {h.root}
                  </p>

                  {h.has_cycle ? (
                    <p className="text-red-500 font-medium mt-2">
                      ⚠ Cycle Detected
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        Depth: {h.depth}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Tree Structure
                      </p>

                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 text-sm overflow-auto border font-mono shadow-inner">
                        {JSON.stringify(h.tree, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* INVALID */}
            {data.invalid_entries.length > 0 && (
              <div className="bg-red-200 p-4 rounded-xl border shadow-sm">
                <p className="font-semibold text-red-700">
                  Invalid Entries:
                </p>
                <p className="text-black font-medium">
                  {data.invalid_entries.join(", ")}
                </p>
              </div>
            )}

            {/* DUPLICATES */}
            {data.duplicate_edges.length > 0 && (
              <div className="bg-yellow-200 p-4 rounded-xl border shadow-sm">
                <p className="font-semibold text-yellow-800">
                  Duplicate Edges:
                </p>
                <p className="text-black font-medium">
                  {data.duplicate_edges.join(", ")}
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}