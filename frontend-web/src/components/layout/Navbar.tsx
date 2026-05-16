"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { SIDEBAR_ITEMS } from "@/utils/sidebarItems"; 
import { useSession } from "@/contexts/SessionContext";

export default function Navbar() {
  const { logout } = useAuth();
  const { user: userData } = useSession();
  const pathname = usePathname();

  let pageTitle = "Dashboard";
  if (userData && userData.role !== "pelanggan") {
    const items = SIDEBAR_ITEMS[userData.role] || [];

    const matchedItem = [...items]
      .sort((a, b) => b.path.length - a.path.length)
      .find(
        (item) =>
          pathname === item.path || pathname.startsWith(`${item.path}/`),
      );

    if (matchedItem) {
      pageTitle = matchedItem.title;
    }
  }

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-40 font-poppins">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-800 font-montserrat tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
            <UserIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 leading-tight">
              {userData?.full_name || "-"}
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
              {userData?.role || "-"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </header>
  );
}
