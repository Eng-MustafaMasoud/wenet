import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Zone, Gate, Ticket, Subscription } from '@/types/api';

interface GateState {
  currentGate: Gate | null;
  zones: Zone[];
  selectedZone: Zone | null;
  currentTicket: Ticket | null;
  subscription: Subscription | null;
  subscriptionError: string | null;
  checkinType: 'visitor' | 'subscriber';
  subscriptionId: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: GateState = {
  currentGate: null,
  zones: [],
  selectedZone: null,
  currentTicket: null,
  subscription: null,
  subscriptionError: null,
  checkinType: 'visitor',
  subscriptionId: '',
  isLoading: false,
  error: null,
};

const gateSlice = createSlice({
  name: 'gate',
  initialState,
  reducers: {
    setCurrentGate: (state, action: PayloadAction<Gate>) => {
      state.currentGate = action.payload;
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
    setSelectedZone: (state, action: PayloadAction<Zone | null>) => {
      state.selectedZone = action.payload;
    },
    setCheckinType: (state, action: PayloadAction<'visitor' | 'subscriber'>) => {
      state.checkinType = action.payload;
      state.selectedZone = null;
      state.subscription = null;
      state.subscriptionError = null;
      state.subscriptionId = '';
    },
    setSubscriptionId: (state, action: PayloadAction<string>) => {
      state.subscriptionId = action.payload;
    },
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
      state.subscriptionError = null;
    },
    setSubscriptionError: (state, action: PayloadAction<string | null>) => {
      state.subscriptionError = action.payload;
    },
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearGateState: (state) => {
      state.currentGate = null;
      state.zones = [];
      state.selectedZone = null;
      state.currentTicket = null;
      state.subscription = null;
      state.subscriptionError = null;
      state.checkinType = 'visitor';
      state.subscriptionId = '';
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentGate,
  setZones,
  updateZone,
  setSelectedZone,
  setCheckinType,
  setSubscriptionId,
  setSubscription,
  setSubscriptionError,
  setCurrentTicket,
  setLoading,
  setError,
  clearGateState,
} = gateSlice.actions;

export default gateSlice.reducer;
