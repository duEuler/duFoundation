import { apiRequest } from "./queryClient";
import type { LoginRequest } from "@shared/schema";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "user";
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  sessionId: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    // Store session ID in localStorage
    if (data.sessionId) {
      localStorage.setItem("sessionId", data.sessionId);
    }
    
    return data;
  },

  async logout(): Promise<void> {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        localStorage.removeItem("sessionId");
      }
    }
  },

  async getCurrentUser(): Promise<{ user: AuthUser } | null> {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return null;

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        localStorage.removeItem("sessionId");
        return null;
      }

      return await response.json();
    } catch (error) {
      localStorage.removeItem("sessionId");
      return null;
    }
  },

  getSessionId(): string | null {
    return localStorage.getItem("sessionId");
  },
};
