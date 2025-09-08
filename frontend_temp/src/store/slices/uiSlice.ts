import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  modals: {
    ticketModal: boolean;
    checkoutModal: boolean;
    userModal: boolean;
    categoryModal: boolean;
    zoneModal: boolean;
    rushHourModal: boolean;
    vacationModal: boolean;
  };
  loading: {
    global: boolean;
    gate: boolean;
    checkout: boolean;
    admin: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  modals: {
    ticketModal: false,
    checkoutModal: false,
    userModal: false,
    categoryModal: false,
    zoneModal: false,
    rushHourModal: false,
    vacationModal: false,
  },
  loading: {
    global: false,
    gate: false,
    checkout: false,
    admin: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(-10);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setModal: (state, action: PayloadAction<{
      modal: keyof UIState['modals'];
      open: boolean;
    }>) => {
      state.modals[action.payload.modal] = action.payload.open;
    },
    setLoading: (state, action: PayloadAction<{
      type: keyof UIState['loading'];
      loading: boolean;
    }>) => {
      state.loading[action.payload.type] = action.payload.loading;
    },
    clearUIState: (state) => {
      state.sidebarOpen = false;
      state.notifications = [];
      state.modals = {
        ticketModal: false,
        checkoutModal: false,
        userModal: false,
        categoryModal: false,
        zoneModal: false,
        rushHourModal: false,
        vacationModal: false,
      };
      state.loading = {
        global: false,
        gate: false,
        checkout: false,
        admin: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setModal,
  setLoading,
  clearUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
