"use client";

// Save token to localStorage
export function setToken(t) {
    if (t) localStorage.setItem("token", t);
}

// Get token from localStorage
export function getToken() {
    if (typeof window === "undefined") return null; // server-safe
    return localStorage.getItem("token");
}

// API fetch wrapper
export async function apiFetch(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            ...options.headers,
        },
    });

    // Handle 401 automatically if needed
    if (res.status === 401) {
        console.warn("Unauthorized - token might be invalid or expired");
        return { error: "Unauthorized" };
    }

    return res.json();
}
