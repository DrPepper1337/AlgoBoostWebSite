const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
