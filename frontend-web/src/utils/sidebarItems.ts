import { 
  LayoutDashboard, 
  Store, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  ClockAlert,
  CreditCard,
  Warehouse,
  BanknoteArrowDown,
  ShoppingCart,
  ScrollText,
  IdCardLanyard,
  Smartphone,
  Soup,
  Dices,
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
    { title: "Master Menu", path: "/admin/menus", icon: Soup },
    { title: "Depot", path: "/admin/depots", icon: Store },
    { title: "Pegawai", path: "/admin/employees", icon: IdCardLanyard },
    { title: "Pelanggan", path: "/admin/customers", icon: Users },
    { title: "Metode Pembayaran", path: "/admin/payment-methods", icon: CreditCard },
    { title: "Transaksi", path: "/admin/transactions", icon: BanknoteArrowDown },
    { title: "Pengeluaran Operasional", path: "/admin/expenses", icon: ClockAlert },
    { title: "Mutasi Stok", path: "/admin/mutations", icon: Warehouse },
  ],
  owner: [
    { title: "Dashboard", path: "/owner", icon: LayoutDashboard },
    { title: "Transaksi Onsite", path: "/owner/onsite-transactions", icon: UtensilsCrossed },
    { title: "Transaksi Online", path: "/owner/online-transactions", icon: Smartphone },
    { title: "Manajemen Meja", path: "/owner/tables", icon: Dices },
    { title: "Settlement Harian", path: "/owner/settlement", icon: BanknoteArrowDown },
    { title: "Laporan & Analitik", path: "/owner/reports", icon: ScrollText },
    { title: "Pengeluaran Operasional", path: "/owner/expenses", icon: ShoppingCart },
    { title: "Mutasi Stok", path: "/owner/mutations", icon: Warehouse },
    { title: "Pengaturan Cabang", path: "/owner/depot", icon: Store }, 
  ],
  kasir: [
    { title: "Transaksi Onsite", path: "/kasir", icon: UtensilsCrossed },
    { title: "Transaksi Online", path: "/kasir/online-transactions", icon: Smartphone },
    { title: "Master Menu", path: "/kasir/menus", icon: Soup},
    { title: "Settlement Harian", path: "/kasir/settlement", icon: BanknoteArrowDown},
    { title: "Laporan Transaksi", path: "/kasir/reports", icon: ScrollText},
  ],
  pelayan: [
    { title: "Transaksi Onsite", path: "/pelayan", icon: UtensilsCrossed },
    { title: "Transaksi Online", path: "/pelayan/online-transactions", icon: Smartphone },
  ],
  pelanggan: [],
};
