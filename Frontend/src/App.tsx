import { useState } from "react";
import { shortenUrl } from "../utils/API";
import { toast } from "react-toastify";

function App() {
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [url, setUrl] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShortenUrl = async () => {
    if (!url) {
      toast.warn("Please enter a URL to shorten");
      return;
    }
    setIsLoading(true);
    try {
      const expDate = expirationDate ? new Date(expirationDate) : undefined;
      const result = await shortenUrl(url, expDate);
      setShortenedUrl(result.shortUrl);
    } catch (error) {
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setExpirationDate("");
    setShortenedUrl("");
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-5 text-gray-800">URL Shortener</h1>
      <div className="w-full flex flex-col gap-4 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 text-base outline-none focus:border-blue-500 transition"
          placeholder="Paste your long URL here..."
        />
        {url && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 text-base outline-none focus:border-blue-500 transition"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleShortenUrl}
            disabled={isLoading || !url}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Shortening..." : "Shorten URL"}
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          >
            Reset
          </button>
        </div>
      </div>
      {shortenedUrl && (
        <div className="w-full bg-gray-50 rounded-lg p-4 flex flex-col items-start gap-2 min-h-[48px]">
          <span className="text-base text-gray-600 font-medium">
            Shortened URL:
          </span>
          <a
            href={shortenedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-blue-600 break-all hover:text-blue-800 underline transition"
          >
            {shortenedUrl}
          </a>
          {expirationDate && (
            <>
              <span className="text-sm text-gray-500 font-medium">
                Expires:
              </span>
              <span className="text-sm text-gray-700">
                {new Date(expirationDate).toLocaleString()}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
