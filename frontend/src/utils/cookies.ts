"use client";

// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

export const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  setCookie("accessToken", accessToken, 1); // 1 day for access token
  if (refreshToken) {
    setCookie("refreshToken", refreshToken, 30); // 30 days for refresh token
  }
};

export const getAuthTokens = () => {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");
  return { accessToken, refreshToken };
};

export const clearAuthTokens = () => {
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
};

export const isAuthenticated = (): boolean => {
  const { accessToken } = getAuthTokens();
  return !!accessToken;
};
