import { 
  LayoutDashboard, 
  Store, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  ClockAlert,
  ClipboardList,
  TableCellsMerge,
  CreditCard
} from "lucide-react";
import { Role } from "@/types";

export interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export const SIDEBAR_ITEMS: Record<Role, SidebarItem[]> = {
  admin: [
    { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { title: "Manajemen Users", path: "/admin/users", icon: Users },
    { title: "Manajemen Depot", path: "/admin/depots", icon: Store },
    { title: "Manajemen Menu", path: "/admin/menus", icon: UtensilsCrossed },
    { title: "Metode Pembayaran", path: "/admin/payment-methods", icon: CreditCard },
    { title: "Laporan Transaksi", path: "/admin/transactions", icon: ClockAlert },
    { title: "Monitoring Stok", path: "/admin/stocks", icon: ClockAlert },
    { title: "Monitoring Mutasi", path: "/admin/mutations", icon: ClockAlert },
  ],
  kasir: [
    { title: "Dashboard Kasir", path: "/kasir", icon: LayoutDashboard },
    { title: "Manajemen Meja", path: "/kasir/tables", icon: TableCellsMerge},
    { title: "Manajemen Menu", path: "/kasir/menus", icon: UtensilsCrossed},
    { title: "Transaksi Online", path: "/kasir/online", icon: Receipt },
  ],
  pelayan: [
    { title: "Daftar Meja", path: "/pelayan", icon: LayoutDashboard },
    { title: "Pesanan Aktif", path: "/pelayan/orders", icon: ClipboardList },
  ],
  pelanggan: [],
};
