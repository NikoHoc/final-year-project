"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Role, User } from "@/types";
import { SIDEBAR_ITEMS } from "@/utils/sidebarItems";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUserData } from "@/utils/auth";
import { useDepot } from "@/hooks/useDepot";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const user = getUserData();

    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserData(user);
    }
  }, []);

  const { depotName, isLoadingDepot } = useDepot(userData?.depot_id);

  if (!userData || userData.role === "pelanggan") return null;

  const role = userData.role as Role;
  const items = SIDEBAR_ITEMS[role] || [];

  const getSidebarTitle = () => {
    if (role === "admin") return "Admin - DBS";
    if (isLoadingDepot) return "Memuat...";
    if (depotName) return depotName;
    return "Depot POS";
  };

  return (
    <aside
      className={`bg-white shadow-xl h-screen fixed top-0 left-0 flex flex-col font-poppins z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-blue-600 font-montserrat transition-opacity duration-300">
            {getSidebarTitle()}
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 transition-opacity">
            Menu Utama
          </p>
        )}

        {items.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              title={isCollapsed ? item.title : ""}
              className={`flex items-center px-3 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className={isCollapsed ? "" : "mr-3"}>
                <Icon size={20} />
              </span>
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
