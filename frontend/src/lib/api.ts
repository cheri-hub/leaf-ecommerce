const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5228";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `API error: ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      if (parsed.message) message = parsed.message;
    } catch {
      // use default message
    }
    throw new ApiError(res.status, message);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
