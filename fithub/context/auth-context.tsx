"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { token: authToken, user: userData } = response.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem("token", authToken);

      // Set the default Authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return Promise.resolve();
    } catch (error: any) {
      console.error("Login error:", error);
      return Promise.reject(
        error.response?.data || { message: "Login failed" }
      );
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const { token: authToken, user: userData } = response.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem("token", authToken);

      // Set the default Authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return Promise.resolve();
    } catch (error: any) {
      console.error("Registration error:", error);
      return Promise.reject(
        error.response?.data || { message: "Registration failed" }
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);

    // Remove the default Authorization header
    delete axios.defaults.headers.common["Authorization"];

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
