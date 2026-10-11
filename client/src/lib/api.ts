const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
}

type ApiRequestOptions = RequestInit & {
    token?: string;
};

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { token, headers, ...requestOptions } = options;

    const response = await fetch(`${API_URL}${path}`, {
        ...requestOptions,
        headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
        },
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
                ? data.message
                : `API request failed: ${response.status}`;

        throw new Error(message);
    }

    return data as T;
}