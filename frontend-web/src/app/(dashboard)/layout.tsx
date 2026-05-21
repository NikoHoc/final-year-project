"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "@/contexts/SessionContext";
import GlobalRealtimeNotification from "@/components/notifications/GlobalRealtimeNotification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      toast.error("Akses ditolak: Anda tidak memiliki izin ke halaman tersebut!");
      router.replace(window.location.pathname); 
    }
  }, [searchParams, router]);

  return (
    <SessionProvider>
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
          <GlobalRealtimeNotification />
          <main className="p-6 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
