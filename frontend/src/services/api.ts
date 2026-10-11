import {
  User, Destination, TransportService, RouteCalculationResponse,
  Booking, PaymentOrder, Receipt, AdminStats
} from './types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('voyageflow_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('voyageflow_token', token);
  } else {
    localStorage.removeItem('voyageflow_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status} error`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; database: string }>('/health'),

  // Auth
  demoLogin: (role: 'traveler' | 'admin' = 'traveler') =>
    request<{ access_token: string; user: User }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { username: string; email: string; password: string; full_name?: string; phone?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  // Destinations
  getDestinations: (params?: {
    query?: string;
    category?: string;
    city?: string;
    max_price?: number;
    min_rating?: number;
    sort_by?: string;
    lat?: number;
    lng?: number;
    featured_only?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          q.append(k, String(v));
        }
      });
    }
    return request<Destination[]>(`/destinations?${q.toString()}`);
  },

  getDestinationById: (id: number) => request<Destination>(`/destinations/${id}`),

  // Transportation
  getTransportServices: (params?: {
    type?: string;
    capacity?: number;
    max_price?: number;
    lat?: number;
    lng?: number;
    trip_distance_km?: number;
    available_only?: boolean;
    sort_by?: string;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          q.append(k, String(v));
        }
      });
    }
    return request<TransportService[]>(`/transport?${q.toString()}`);
  },

  getTransportServiceById: (id: number) => request<TransportService>(`/transport/${id}`),

  // Routing & Proximity
  calculateRoute: (data: {
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    origin_name?: string;
    dest_name?: string;
  }) =>
    request<RouteCalculationResponse>('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNearbyAll: (lat: number, lng: number) =>
    request<any[]>(`/nearby?lat=${lat}&lng=${lng}`),

  // Bookings
  createBooking: (data: {
    booking_type: string;
    item_id: number;
    item_name: string;
    pickup_location?: string;
    dropoff_location?: string;
    pickup_lat?: number;
    pickup_lng?: number;
    dropoff_lat?: number;
    dropoff_lng?: number;
    travel_date: string;
    travel_time?: string;
    passengers_count: number;
    passenger_details: { name: string; age?: number; gender?: string }[];
    subtotal: number;
    coupon_code?: string;
  }) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUserBookings: () => request<Booking[]>('/bookings'),

  getBookingById: (id: number) => request<Booking>(`/bookings/${id}`),

  cancelBooking: (id: number, reason: string = 'User initiated cancellation') =>
    request<{ success: boolean; message: string; refund_amount: number }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Payments
  createPaymentOrder: (booking_id: number, gateway: string = 'SANDBOX', payment_method: string = 'CARD') =>
    request<PaymentOrder>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ booking_id, gateway, payment_method }),
    }),

  verifyPayment: (data: {
    order_id: string;
    payment_id: string;
    signature: string;
    simulate_fail?: boolean;
  }) =>
    request<{ success: boolean; status: string; message: string; booking_reference: string; receipt_url?: string }>(
      '/payments/verify',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getReceipt: (bookingRef: string) => request<Receipt>(`/payments/receipt/${bookingRef}`),

  // Wishlist
  toggleWishlist: (destination_id: number) =>
    request<{ destination_id: number; is_saved: boolean; total_saved: number }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ destination_id }),
    }),

  getWishlist: () => request<Destination[]>('/wishlist'),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),

  getAllBookings: (status?: string) =>
    request<Booking[]>(`/admin/bookings${status ? `?status=${status}` : ''}`),

  updateBookingStatus: (id: number, status: string) =>
    request<{ success: boolean; booking_id: number; new_status: string }>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  toggleTransportAvailability: (id: number, is_available: boolean) =>
    request<{ success: boolean; service_id: number; is_available: boolean }>(`/admin/transport/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available }),
    }),
};
