// API Types based on the API documentation

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

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  active: boolean;
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
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt?: string;
  subscriptionId?: string;
}

export interface CheckinRequest {
  gateId: string;
  zoneId: string;
  type: 'visitor' | 'subscriber';
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
  rateMode: 'normal' | 'special';
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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors: Record<string, string[]>;
}

// WebSocket Types
export interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'zone-update' | 'admin-update';
  payload: any;
}

export interface WSSubscribeMessage {
  type: 'subscribe';
  payload: {
    gateId: string;
  };
}

export interface WSUnsubscribeMessage {
  type: 'unsubscribe';
  payload: {
    gateId: string;
  };
}

export interface WSZoneUpdateMessage {
  type: 'zone-update';
  payload: Zone;
}

export interface WSAdminUpdateMessage {
  type: 'admin-update';
  payload: {
    adminId: string;
    action: 'category-rates-changed' | 'zone-closed' | 'zone-opened' | 'vacation-added' | 'rush-updated';
    targetType: 'category' | 'zone' | 'vacation' | 'rush';
    targetId: string;
    details?: any;
    timestamp: string;
  };
}

// Admin Report Types
export interface ParkingStateReport {
  zones: Array<Zone & {
    subscriberCount: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: 'success';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
