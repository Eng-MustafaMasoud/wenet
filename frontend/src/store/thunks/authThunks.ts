import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/services/api";
import { setAuthTokens } from "@/utils/cookies";

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.login(credentials);

      // Handle different response structures from backend
      const user = response.user || response.data?.user;
      const accessToken =
        response.accessToken ||
        response.token ||
        response.data?.accessToken ||
        response.data?.token;
      const refreshToken = response.refreshToken || response.data?.refreshToken;

      if (!user || !accessToken) {
        throw new Error("Invalid response from server");
      }

      // Store tokens in cookies
      setAuthTokens(accessToken, refreshToken);

      return {
        user,
        token: accessToken,
        refreshToken,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Clear tokens from cookies
      const { clearAuthTokens } = await import("@/utils/cookies");
      clearAuthTokens();

      return true;
    } catch (error: any) {
      return rejectWithValue("Logout failed");
    }
  }
);
