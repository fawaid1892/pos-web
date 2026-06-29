// API config — set NEXT_PUBLIC_BACKEND_URL in Railway env
const API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_API_URL || "http://localhost:8080";
export const API_BASE = API;
export const API_URL = `${API}/api/v1`;
export const API_WS = API.replace("http://", "ws://").replace("https://", "wss://") + "/api/v1/ws";
