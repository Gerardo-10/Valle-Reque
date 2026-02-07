// src/api/auth.ts
export async function login(username: string, password: string) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error de autenticación");
  }

  return data.user;
}