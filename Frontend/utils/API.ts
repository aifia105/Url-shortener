import axios from "axios";

axios.defaults.baseURL = (import.meta as any).env.VITE_BACKEND_URL;

export const shortenUrl = async (url: string, expirationDate?: Date) => {
  const payload = {
    originalUrl: url,
    expiresAt: expirationDate?.toISOString(),
  };

  const response = await axios.post("/url-shortener", payload);

  if (response.status !== 201) {
    throw new Error("Failed to shorten URL");
  }

  return response.data;
};
