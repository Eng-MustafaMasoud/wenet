import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  hydrate,
} from "@/store/slices/authSlice";
import { User } from "@/types/api";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("authSlice", () => {
  const mockUser: User = {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    role: "admin",
    firstName: "Test",
    lastName: "User",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockToken = "mock-jwt-token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = authReducer(undefined, { type: "unknown" });
      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe("loginStart", () => {
    it("should set loading to true and clear error", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Previous error",
      };

      const state = authReducer(initialState, loginStart());
      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });
    });
  });

  describe("loginSuccess", () => {
    it("should set user, token, and authenticated status", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      };

      const action = loginSuccess({ user: mockUser, token: mockToken });
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    });

    it("should save to localStorage", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      };

      authReducer(
        initialState,
        loginSuccess({ user: mockUser, token: mockToken })
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "authToken",
        mockToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
    });
  });

  describe("loginFailure", () => {
    it("should set error and reset authentication state", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      };

      const errorMessage = "Login failed";
      const state = authReducer(initialState, loginFailure(errorMessage));

      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
    });
  });

  describe("logout", () => {
    it("should reset all state to initial values", () => {
      const initialState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const state = authReducer(initialState, logout());

      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });

    it("should clear localStorage", () => {
      const initialState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      authReducer(initialState, logout());

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("clearError", () => {
    it("should clear error message", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Some error",
      };

      const state = authReducer(initialState, clearError());

      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe("updateUser", () => {
    it("should update user data", () => {
      const initialState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const updatedUser: User = {
        ...mockUser,
        firstName: "Updated",
        lastName: "Name",
      };

      const state = authReducer(initialState, updateUser(updatedUser));

      expect(state.user).toEqual(updatedUser);
    });

    it("should save updated user to localStorage", () => {
      const initialState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const updatedUser: User = {
        ...mockUser,
        firstName: "Updated",
        lastName: "Name",
      };

      authReducer(initialState, updateUser(updatedUser));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(updatedUser)
      );
    });
  });

  describe("hydrate", () => {
    it("should restore state from localStorage when token exists", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "authToken") return mockToken;
        if (key === "user") return JSON.stringify(mockUser);
        return null;
      });

      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      const state = authReducer(initialState, hydrate());

      expect(state).toEqual({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "authToken") return mockToken;
        if (key === "user") return "invalid-json";
        return null;
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      const state = authReducer(initialState, hydrate());

      expect(state).toEqual({
        user: null,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error parsing saved user:",
        expect.any(Error)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");

      consoleSpy.mockRestore();
    });

    it("should handle missing localStorage data", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      const state = authReducer(initialState, hydrate());

      expect(state).toEqual(initialState);
    });
  });
});
