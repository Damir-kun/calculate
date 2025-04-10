import { type User } from "../components/AuthProvider";

export const getAuthToken = () => {
  return localStorage.getItem("token") ?? null
}

export const getUserData = (): User|null => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error(e)
    return null
  }
}

export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token)
}

export const removeAuthToken = () => {
  localStorage.getItem("token")
}
