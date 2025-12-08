import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await api.get("auth/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // If token is invalid, maybe clear it? For now just log.
    }
  };

  const login = async (email, password) => {
    const res = await api.post("auth/login/", { email, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    await fetchUser();
  };

  const register = async (email, username, password) => {
    await api.post("auth/register/", { email, username, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
