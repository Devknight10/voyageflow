export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'traveler' | 'admin';
  created_at?: string;
}

export interface Destination {
  id: number;
  name: string;
  title: string;
  category: 'stays' | 'experiences' | 'attractions' | string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  price: number;
  unit: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  description: string;
  amenities: string[];
  is_featured: boolean;
  is_wishlisted?: boolean;
  dist_km?: number | null;
}

export interface TransportService {
  id: number;
  provider_id: number;
  provider_name?: string;
  name: string;
  type: 'car' | 'taxi' | 'bus' | 'train' | 'airport_transfer' | 'rental' | 'bike' | 'boat' | string;
  vehicle_model: string;
  capacity: number;
  base_fare: number;
  per_km_rate: number;
  image_url: string;
  cancellation_policy: string;
  rating: number;
  current_lat?: number;
  current_lng?: number;
  is_available: boolean;
  features: string[];
  dist_km?: number | null;
  estimated_price?: number;
}

export interface RouteCalculationResponse {
  distance_km: number;
  duration_mins: number;
  origin_name: string;
  dest_name: string;
  origin_coords: [number, number];
  dest_coords: [number, number];
  polyline_coords: [number, number][];
  estimated_fares: Record<string, number>;
}

export interface PassengerDetail {
  name: string;
  age?: number;
  gender?: string;
}

export interface Booking {
  id: number;
  reference_code: string;
  user_id: number;
  booking_type: 'transport' | 'destination' | string;
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
  passenger_details: PassengerDetail[];
  subtotal: number;
  tax_amount: number;
  fees_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | string;
  cancellation_reason?: string;
  created_at: string;
  payment_status?: string;
  payment_method?: string;
}

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  gateway: string;
  key_id: string;
  booking_reference: string;
}

export interface Receipt {
  receipt_number: string;
  booking_reference: string;
  transaction_id: string;
  order_id: string;
  date: string;
  customer_name: string;
  customer_email: string;
  item_booked: string;
  travel_date: string;
  pickup: string;
  dropoff: string;
  subtotal: number;
  tax: number;
  fees: number;
  discount: number;
  total_paid: number;
  currency: string;
  payment_method: string;
  gateway: string;
  status: string;
}

export interface AdminStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  total_users: number;
  total_destinations: number;
  total_transport_vehicles: number;
  recent_bookings: Booking[];
}
