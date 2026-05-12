import { 
  LayoutDashboard, 
  Store, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  ClockAlert,
  TableCellsMerge,
  CreditCard,
  Warehouse,
  BanknoteArrowDown,
  ShoppingCart
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
    { title: "Laporan Transaksi", path: "/admin/transactions", icon: BanknoteArrowDown },
    { title: "Monitoring Stok", path: "/admin/stocks", icon: ClockAlert },
    { title: "Monitoring Mutasi", path: "/admin/mutations", icon: Warehouse },
  ],
  kasir: [
    { title: "Dashboard Kasir", path: "/kasir", icon: LayoutDashboard },
    { title: "Transaksi Online", path: "/kasir/online", icon: Receipt },
    { title: "Manajemen Meja", path: "/kasir/tables", icon: TableCellsMerge},
    { title: "Manajemen Menu", path: "/kasir/menus", icon: UtensilsCrossed},
    { title: "Laporan Transaksi", path: "/kasir/transactions", icon: BanknoteArrowDown },
    { title: "Pengeluaran Operasional", path: "/kasir/expenses", icon: ShoppingCart},
    { title: "Mutasi Stok", path: "/kasir/mutations", icon: Warehouse},
  ],
  pelayan: [
    { title: "Dashboard Pelayan", path: "/pelayan", icon: LayoutDashboard },
  ],
  pelanggan: [],
};
