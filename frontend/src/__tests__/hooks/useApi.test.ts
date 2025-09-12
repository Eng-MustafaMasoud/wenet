import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogin, useGates, useZones, useAllZones } from "@/hooks/useApi";
import * as api from "@/services/api";

// Mock the API module
jest.mock("@/services/api", () => ({
  authApi: {
    login: jest.fn(),
  },
  masterApi: {
    getGates: jest.fn(),
    getZones: jest.fn(),
  },
  api: {
    get: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useApi hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useLogin", () => {
    it("should return mutation object", () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("mutate");
      expect(result.current).toHaveProperty("mutateAsync");
      expect(result.current).toHaveProperty("isPending");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("isSuccess");
    });

    it("should call authApi.login when mutate is called", async () => {
      const mockLogin = jest
        .fn()
        .mockResolvedValue({ data: { user: {}, token: "token" } });
      (api.authApi.login as jest.Mock).mockImplementation(mockLogin);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const loginData = { username: "test", password: "password" };
      result.current.mutate(loginData);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(loginData);
      });
    });
  });

  describe("useGates", () => {
    it("should return query object", () => {
      const { result } = renderHook(() => useGates(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("error");
    });

    it("should call masterApi.getGates", async () => {
      const mockGates = [{ id: "1", name: "Gate 1" }];
      const mockGetGates = jest.fn().mockResolvedValue(mockGates);
      (api.masterApi.getGates as jest.Mock).mockImplementation(mockGetGates);

      renderHook(() => useGates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockGetGates).toHaveBeenCalled();
      });
    });
  });

  describe("useZones", () => {
    it("should return query object", () => {
      const { result } = renderHook(() => useZones("gate1"), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("error");
    });

    it("should call masterApi.getZones with gateId", async () => {
      const mockZones = [{ id: "1", name: "Zone 1" }];
      const mockGetZones = jest.fn().mockResolvedValue(mockZones);
      (api.masterApi.getZones as jest.Mock).mockImplementation(mockGetZones);

      renderHook(() => useZones("gate1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockGetZones).toHaveBeenCalledWith("gate1");
      });
    });

    it("should not call API when gateId is empty", () => {
      const mockGetZones = jest.fn();
      (api.masterApi.getZones as jest.Mock).mockImplementation(mockGetZones);

      renderHook(() => useZones(""), {
        wrapper: createWrapper(),
      });

      expect(mockGetZones).not.toHaveBeenCalled();
    });
  });

  describe("useAllZones", () => {
    it("should return query object", () => {
      const { result } = renderHook(() => useAllZones(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("error");
    });

    it("should call api.get with correct endpoint", async () => {
      const mockZones = [{ id: "1", name: "Zone 1" }];
      const mockGet = jest.fn().mockResolvedValue({ data: mockZones });
      (api.api.get as jest.Mock).mockImplementation(mockGet);

      renderHook(() => useAllZones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/master/zones");
      });
    });
  });
});
