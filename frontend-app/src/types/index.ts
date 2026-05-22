export type Role = 'pelanggan';

export interface User {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  email: string;
  role: Role;
}

export interface Depot {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
}