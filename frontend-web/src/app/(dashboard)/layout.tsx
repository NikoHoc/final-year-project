"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { getToken, getUserData } from "@/utils/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUserData();

    if (!token || !user) {
      toast.error("Akses ditolak: silahkan login terlebih dahulu!");
      router.replace("/login");
      return;
    }

    const role = user.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      toast.error("Akses Ditolak: Mencoba mengakses halaman admin!");
      router.replace(`/${role}`);
    } else if (pathname.startsWith("/kasir") && role !== "kasir") {
      toast.error("Akses Ditolak: Mencoba mengakses halaman kasir!");
      router.replace(`/${role}`);
    } else if (pathname.startsWith("/pelayan") && role !== "pelayan") {
      toast.error("Akses Ditolak: Mencoba mengakses halaman pelayan!");
      router.replace(`/${role}`);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-poppins animate-pulse">
          Memverifikasi akses...
        </p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
