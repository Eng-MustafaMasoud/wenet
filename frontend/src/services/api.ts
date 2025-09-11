import axios from "axios";

// Dynamically determine backend URL based on current host
const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "192.168.1.3") {
      return "http://192.168.1.3:3000/api/v1";
    }
  }
  return "http://localhost:3000/api/v1";
};

// Use a consistent default for SSR, then update on client
const API_BASE_URL = "http://localhost:3000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests and update base URL on client
api.interceptors.request.use((config) => {
  // Update base URL on client side if needed
  if (
    typeof window !== "undefined" &&
    config.baseURL === "http://localhost:3000/api/v1"
  ) {
    const dynamicUrl = getBackendUrl();
    if (dynamicUrl !== config.baseURL) {
      config.baseURL = dynamicUrl;
    }
  }

  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors with friendly message and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("authToken");
      } catch {}
      // Show user-friendly message before redirecting
      const params = new URLSearchParams({
        reason: status === 401 ? "unauthorized" : "forbidden",
      });
      // Redirect to login with context
      if (typeof window !== "undefined") {
        window.location.href = `/login?${params.toString()}`;
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  role: "admin" | "employee";
  name?: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  rateNormal: number;
  rateSpecial: number;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

export interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export interface RushHour {
  id: string;
  weekDay: number;
  from: string;
  to: string;
}

export interface Vacation {
  id: string;
  name: string;
  from: string;
  to: string;
}

export interface Car {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Car[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
}

export interface Ticket {
  id: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt?: string;
  subscriptionId?: string;
}

export interface CheckinRequest {
  gateId: string;
  zoneId: string;
  type: "visitor" | "subscriber";
  subscriptionId?: string;
}

export interface CheckinResponse {
  ticket: Ticket;
  zoneState: Zone;
}

export interface CheckoutRequest {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}

export interface BreakdownItem {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: BreakdownItem[];
  amount: number;
  zoneState: Zone;
}

export interface AdminUpdate {
  adminId: string;
  action:
    | "category-rates-changed"
    | "zone-closed"
    | "zone-opened"
    | "vacation-added"
    | "rush-updated";
  targetType: "category" | "zone" | "vacation" | "rush";
  targetId: string;
  details?: any;
  timestamp: string;
}

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};

// Master Data API
export const masterApi = {
  getGates: async (): Promise<Gate[]> => {
    const response = await api.get("/master/gates");
    return response.data;
  },

  getZones: async (gateId: string): Promise<Zone[]> => {
    const response = await api.get(`/master/zones?gateId=${gateId}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/master/categories");
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/admin/categories");
    return response.data;
  },

  createCategory: async (category: Omit<Category, "id">): Promise<Category> => {
    const response = await api.post("/admin/categories", category);
    return response.data;
  },

  updateCategory: async (
    id: string,
    category: Partial<Category>
  ): Promise<Category> => {
    const response = await api.put(`/admin/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },

  // Zones
  getZones: async (): Promise<Zone[]> => {
    const response = await api.get("/admin/zones");
    return response.data;
  },

  createZone: async (
    zone: Omit<
      Zone,
      | "id"
      | "occupied"
      | "free"
      | "reserved"
      | "availableForVisitors"
      | "availableForSubscribers"
    >
  ): Promise<Zone> => {
    const response = await api.post("/admin/zones", zone);
    return response.data;
  },

  updateZone: async (id: string, zone: Partial<Zone>): Promise<Zone> => {
    const response = await api.put(`/admin/zones/${id}`, zone);
    return response.data;
  },

  updateZoneOpen: async (id: string, open: boolean): Promise<Zone> => {
    const response = await api.put(`/admin/zones/${id}/open`, { open });
    return response.data;
  },

  deleteZone: async (id: string): Promise<void> => {
    await api.delete(`/admin/zones/${id}`);
  },

  // Gates
  getGates: async (): Promise<Gate[]> => {
    const response = await api.get("/admin/gates");
    return response.data;
  },

  createGate: async (_gate: Omit<Gate, "id">): Promise<Gate> => {
    throw new Error(
      "Gate creation is not available in the current backend configuration. Please contact your system administrator to enable this feature."
    );
  },

  updateGate: async (_id: string, _gate: Partial<Gate>): Promise<Gate> => {
    throw new Error(
      "Gate editing is not available in the current backend configuration. Please contact your system administrator to enable this feature."
    );
  },

  deleteGate: async (_id: string): Promise<void> => {
    throw new Error(
      "Gate deletion is not available in the current backend configuration. Please contact your system administrator to enable this feature."
    );
  },

  // Rush Hours
  getRushHours: async (): Promise<RushHour[]> => {
    const response = await api.get("/admin/rush-hours");
    return response.data;
  },

  createRushHour: async (rushHour: Omit<RushHour, "id">): Promise<RushHour> => {
    const response = await api.post("/admin/rush-hours", rushHour);
    return response.data;
  },

  updateRushHour: async (
    id: string,
    rushHour: Partial<RushHour>
  ): Promise<RushHour> => {
    const response = await api.put(`/admin/rush-hours/${id}`, rushHour);
    return response.data;
  },

  deleteRushHour: async (id: string): Promise<void> => {
    await api.delete(`/admin/rush-hours/${id}`);
  },

  // Vacations
  getVacations: async (): Promise<Vacation[]> => {
    const response = await api.get("/admin/vacations");
    return response.data;
  },

  createVacation: async (vacation: Omit<Vacation, "id">): Promise<Vacation> => {
    const response = await api.post("/admin/vacations", vacation);
    return response.data;
  },

  updateVacation: async (
    id: string,
    vacation: Partial<Vacation>
  ): Promise<Vacation> => {
    const response = await api.put(`/admin/vacations/${id}`, vacation);
    return response.data;
  },

  deleteVacation: async (id: string): Promise<void> => {
    await api.delete(`/admin/vacations/${id}`);
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  createUser: async (user: Omit<User, "id">): Promise<User> => {
    const response = await api.post("/admin/users", user);
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get("/admin/subscriptions");
    return response.data;
  },

  createSubscription: async (
    subscription: Omit<Subscription, "id" | "currentCheckins">
  ): Promise<Subscription> => {
    const response = await api.post("/admin/subscriptions", subscription);
    return response.data;
  },

  updateSubscription: async (
    id: string,
    subscription: Partial<Subscription>
  ): Promise<Subscription> => {
    const response = await api.put(`/admin/subscriptions/${id}`, subscription);
    return response.data;
  },

  // Reports
  getParkingState: async (): Promise<Zone[]> => {
    const response = await api.get("/admin/reports/parking-state");
    return response.data;
  },

  // Tickets
  getTickets: async (status?: string): Promise<Ticket[]> => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get(`/admin/tickets${params}`);
    return response.data;
  },
};

// Subscription API
export const subscriptionApi = {
  getSubscription: async (id: string): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },
};

// Ticket API
export const ticketApi = {
  checkin: async (data: CheckinRequest): Promise<CheckinResponse> => {
    const response = await api.post("/tickets/checkin", data);
    return response.data;
  },

  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await api.post("/tickets/checkout", data);
    return response.data;
  },

  getTicket: async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
};
