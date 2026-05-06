export type Role = 'admin' | 'kasir' | 'pelayan' | 'pelanggan';
export type TransactionType = 'onsite' | 'online' | 'takeaway';
export type OrderStatus = 'pending' | 'confirmed' | 'cooking' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';
export type PickupMethod = 'dine_in' | 'pickup_self' | 'driver';

export interface User {
  id: string; 
  full_name?: string;
  username?: string;
  role: Role;
  phone_number?: string;
  email?: string;
  depot_id?: number | null; 
  created_at?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  role: "admin" | "kasir" | "pelayan" | "pelanggan";
  depot_id: number | null;
  created_at: string;
  depots?: {
    name: string;
  } | null;
}

export interface Depot {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  is_open?: boolean;
  payment_configs?: PaymentConfig | null;
  created_at?: string;
}

export interface PaymentConfig {
  id: number;
  depot_id: number;
  merchant_id: string;
  midtrans_server_key: string;
  midtrans_client_key: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  type?: "food" | "drink" | "other";
  created_at?: string;
  updated_at?: string;
}

export interface Menu {
  id: number;
  category_id: number;
  name: string;
  price: number;
  half_price?: number;
  image_url?: string;
  description?: string;
  categories?: { 
    name: string,
    type?: "food" | "drink" | "other"
  };
}

export interface Table {
  id: number;
  depot_id: number;
  table_number: string;
  status: "Available" | "Occupied" | "Reserved";
  created_at?: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: string;
  menu_id: number;
  quantity: number;
  quantity_paid: number;
  price_at_time: number;
  is_half_portion: boolean;
  note?: string;
  is_printed?: boolean;
  batch_number?: number;
  created_at?: string;
  menus?: Menu;
  serve_status?: 'cooking' | 'served';
}

export interface Transaction {
  id: string; 
  depot_id: number;
  user_id?: string | null; 
  table_id?: number | null; 
  customer_id?: string | null; 
  type: TransactionType;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  pickup_method?: PickupMethod;
  pickup_notes?: string;
  midtrans_order_id?: string;
  payment_method?: string;
  snap_token?: string;
  midtrans_url?: string;
  rejection_reason?: string;
  created_at: string;
  transaction_items?: TransactionItem[];
  transaction_payments?: TransactionPayment[];
}

export interface TransactionPayment {
  id: number;
  transaction_id: string;
  payment_method_id: number;
  paid_amount: number;
  change_amount: number;
  created_at: string;
  payment_methods?: { name: string };
  transaction_payment_items?: TransactionPaymentItem[];
}

export interface TransactionPaymentItem {
  id: number;
  transaction_payment_id: number;
  transaction_item_id: number;
  quantity: number;
  price_at_time: number;
}

export interface CartItemPayload {
  menu_id: number;
  quantity: number;
  is_half_portion: boolean;
  note?: string;
  batch_number?: number;
  created_at?: string;
}

export interface CreateTransactionPayload {
  depot_id: number;
  user_id?: string | null;
  type: "onsite" | "online" | "takeaway";
  table_id?: number | null;
  customer_id?: string | null;
  pickup_method?: "dine_in" | "pickup_self" | "driver" | null;
  use_tax?: boolean;
  items: CartItemPayload[];
}

export interface DepotMenuResponse extends Menu {
  is_available: boolean;
  categories: Category | { id: number; name: string }; 
}