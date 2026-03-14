import { 
  LayoutDashboard, 
  Store, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  ClipboardList
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
    { title: "Manajemen Depot", path: "/admin/depots", icon: Store },
    { title: "Manajemen Users", path: "/admin/users", icon: Users },
    { title: "Manajemen Menu", path: "/admin/menus", icon: UtensilsCrossed },
  ],
  kasir: [
    { title: "Dashboard Kasir", path: "/kasir", icon: LayoutDashboard },
    { title: "Transaksi Online", path: "/kasir/online", icon: Receipt },
  ],
  pelayan: [
    { title: "Daftar Meja", path: "/pelayan", icon: LayoutDashboard },
    { title: "Pesanan Aktif", path: "/pelayan/orders", icon: ClipboardList },
  ],
  pelanggan: [],
};
