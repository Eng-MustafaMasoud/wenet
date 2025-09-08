import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Zone, Category, Gate, RushHour, Vacation, Subscription, Ticket } from '@/types/api';

interface AdminState {
  users: User[];
  zones: Zone[];
  categories: Category[];
  gates: Gate[];
  rushHours: RushHour[];
  vacations: Vacation[];
  subscriptions: Subscription[];
  tickets: Ticket[];
  parkingStateReport: Zone[];
  adminUpdates: Array<{
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    timestamp: string;
    details?: any;
  }>;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  zones: [],
  categories: [],
  gates: [],
  rushHours: [],
  vacations: [],
  subscriptions: [],
  tickets: [],
  parkingStateReport: [],
  adminUpdates: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    setZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload;
    },
    updateZone: (state, action: PayloadAction<Zone>) => {
      const index = state.zones.findIndex(zone => zone.id === action.payload.id);
      if (index !== -1) {
        state.zones[index] = action.payload;
      }
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(category => category.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    setGates: (state, action: PayloadAction<Gate[]>) => {
      state.gates = action.payload;
    },
    setRushHours: (state, action: PayloadAction<RushHour[]>) => {
      state.rushHours = action.payload;
    },
    setVacations: (state, action: PayloadAction<Vacation[]>) => {
      state.vacations = action.payload;
    },
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
    setParkingStateReport: (state, action: PayloadAction<Zone[]>) => {
      state.parkingStateReport = action.payload;
    },
    addAdminUpdate: (state, action: PayloadAction<{
      adminId: string;
      action: string;
      targetType: string;
      targetId: string;
      timestamp: string;
      details?: any;
    }>) => {
      state.adminUpdates.unshift(action.payload);
      // Keep only last 50 updates
      if (state.adminUpdates.length > 50) {
        state.adminUpdates = state.adminUpdates.slice(0, 50);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAdminState: (state) => {
      state.users = [];
      state.zones = [];
      state.categories = [];
      state.gates = [];
      state.rushHours = [];
      state.vacations = [];
      state.subscriptions = [];
      state.tickets = [];
      state.parkingStateReport = [];
      state.adminUpdates = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  setZones,
  updateZone,
  setCategories,
  updateCategory,
  setGates,
  setRushHours,
  setVacations,
  setSubscriptions,
  setTickets,
  setParkingStateReport,
  addAdminUpdate,
  setLoading,
  setError,
  clearAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;
