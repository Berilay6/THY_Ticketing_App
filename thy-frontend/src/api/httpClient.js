const BASE_URL = "http://localhost:8080/api"; // backend base

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Backend'ten error json dönüyorsa onu da okuyalım
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }

      const error = new Error(
        errorBody?.message || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    // 204 No Content vs durumlarda body olmayabilir
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("HTTP error:", err);
    throw err; // burada tekrar throw ediyoruz ki .catch() ile yakalayabilesin
  }
}

// Kolaylık için .get / .post yardımcıları
export function get(path) {
  return request(path, { method: "GET" });
}

export function post(path, body) {
  return request(path, { method: "POST", body });
}

// Gerekirse put/delete de ekleyebiliriz
export default {
  get,
  post,
};
