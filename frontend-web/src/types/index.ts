export type Role = 'admin' | 'owner' | 'kasir' | 'pelayan' | 'pelanggan';
export type TransactionType = 'dining' | 'online' | 'takeaway';
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
  owner_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  map_url?: string | null;
  shift1_start? : string | null;
  shift1_end? : string | null;
  shift2_start? : string | null;
  shift2_end? : string | null;
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
    id: number,
    name: string,
    type?: "food" | "drink" | "other"
  };
}

export interface DepotMenuResponse extends Menu {
  is_available: boolean;
  categories: Category | { id: number; name: string }; 
}

export interface Table {
  id: number;
  depot_id: number;
  table_number: string;
  is_active: boolean;
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
  tables?: {
    table_number: string;
  } | null;
  customer_id?: string | null; 
  customer_name?: string | null;
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
  is_settled?: boolean;
  transaction_items?: TransactionItem[];
  transaction_payments?: TransactionPayment[];
}

export interface TransactionPaymentItem {
  id: number;
  transaction_payment_id: number;
  transaction_item_id: number;
  quantity: number;
  price_at_time: number;
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

export interface CartItemPayload {
  menu_id: number;
  quantity: number;
  is_half_portion: boolean;
  note?: string;
  batch_number?: number;
  created_at?: string;
}

export interface CartItem extends CartItemPayload {
  id?: number;
  unique_id: string;
  menu: Menu;
  is_saved?: boolean;
  quantity_paid: number;
  price_at_time: number;
  serve_status?: 'cooking' | 'served';
}

export interface AddItemsPayload {
  customer_name?: string | null;
  items: CartItemPayload[];
}

export interface CreateTransactionPayload {
  depot_id: number;
  user_id?: string | null;
  type: "dining" | "online" | "takeaway";
  table_id?: number | null;
  customer_id?: string | null;
  customer_name?: string | null;
  pickup_method?: "pickup_self" | "driver" | null;
  use_tax?: boolean;
  items: CartItemPayload[];
}

export interface Expense {
  id: number;
  depot_id: number;
  created_by: string;
  item_name: string;
  amount: number;
  quantity: number;
  unit: string;
  expense_date: string;
  note?: string;
  created_at: string;
  is_settled?: boolean;
  profiles?: {
    full_name: string;
  };
}

export interface ExpensePayload {
  depot_id: number;
  item_name: string;
  amount: number;
  quantity: number;
  unit: string;
  expense_date: string;
  note?: string;
}

export interface StockMutation {
  id: number;
  created_by: string;
  requester_id: number; 
  provider_id: number;  
  item_name: string;
  requested_quantity: number;
  sent_quantity?: number | null;
  unit: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  requester_notes?: string;
  rejection_reason?: string;
  created_at: string;
  // Relasi
  requester?: { name: string };
  provider?: { name: string };
  creator?: { full_name: string };
}
export interface MutationPayload {
  requester_id: number;
  provider_id: number;
  item_name: string;
  requested_quantity: number;
  unit: string;
  requester_notes?: string;
}

export interface DailySettlement {
  id: string;
  depot_id: number;
  created_by: string | null;
  settlement_date: string;
  total_transactions: number;
  subtotal_amount: number;
  tax_amount: number;
  grand_total: number;
  total_expenses: number;
  net_income: number;
  created_at?: string;
  creator?: {
    full_name: string;
  };
  depot?: {
    id: number;
    name: string;
    address: string;
    phone_number: string;
  } | null;
}

export interface PaymentMethodSummary {
  method_name: string;
  transaction_count: number;
  total_net_amount: number;
}

export interface SettlementSummary {
  total_transactions: number;
  subtotal_amount: number;
  tax_amount: number;
  grand_total: number;
  total_expenses: number;
  net_income: number;
  payment_methods: PaymentMethodSummary[];
}
export interface ChartData {
  name: string;
  value: number;
}
export interface SettlementResponse {
  settlement?: DailySettlement;
  summary: SettlementSummary;
  transactions: Transaction[]; 
  expenses: Expense[];
}