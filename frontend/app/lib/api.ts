const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://syncguard-production.up.railway.app";
  
export async function registerUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Registration failed");
  }
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  return res.json();
}

export function saveToken(token: string) {
  localStorage.setItem("syncguard_token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("syncguard_token");
}

export function clearToken() {
  localStorage.removeItem("syncguard_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
export async function fetchRecords() {
  const res = await fetch(`${API_BASE}/records`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch records");
  return res.json();
}

export async function fetchSyncHistory() {
  const res = await fetch(`${API_BASE}/sync-history`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sync history");
  return res.json();
}

export async function triggerSync(org: string) {
  const res = await fetch(`${API_BASE}/sync-org/${org}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Sync failed");
  return res.json();
}

export async function askQuestion(question: string) {
  const res = await fetch(`${API_BASE}/ask?question=${encodeURIComponent(question)}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get an answer");
  return res.json();
}

export async function fetchActivity() {
  const res = await fetch(`${API_BASE}/activity`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}


export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch notifications");

  return res.json();
}



export async function markNotificationRead(id: number) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return res.json();
}

