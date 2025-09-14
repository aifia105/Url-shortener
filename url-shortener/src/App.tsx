import { useState } from "react";

function App() {
  const [shortenedUrl, setShortenedUrl] = useState("example.com/abcd1234");
  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-5 text-gray-800">URL Shortener</h1>
      <div className="w-full flex flex-col gap-4 mb-6">
        <input
          type="text"
          className="px-4 py-3 rounded-lg border border-gray-300 text-base outline-none focus:border-blue-500 transition"
          placeholder="Paste your long URL here..."
        />
        <div className="flex gap-3 justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Shorten URL
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
            Reset
          </button>
        </div>
      </div>
      {shortenedUrl && (
        <div className="w-full bg-gray-50 rounded-lg p-4 flex flex-col items-start gap-2 min-h-[48px]">
          <span className="text-base text-gray-600 font-medium">
            Shortened URL:
          </span>
          <span className="text-lg text-blue-600 break-all">
            {shortenedUrl}
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
