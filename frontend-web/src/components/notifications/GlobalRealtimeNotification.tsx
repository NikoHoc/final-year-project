"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "@/contexts/SessionContext";
import { supabaseRealtime } from "@/config/supabaseClient";
import { BellRing, X } from "lucide-react";

export default function GlobalRealtimeNotification() {
  const { user, isLoadingSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoadingSession || !user?.depot_id) return;
    if (user.role !== "owner" && user.role !== "kasir") return;

    const notifyChannel = supabaseRealtime
      .channel(`global-notify-${user.depot_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `depot_id=eq.${user.depot_id}`,
        },
        (payload) => {
          const newData = payload.new;

          if (newData.type === "online" && newData.order_status === "pending") {
            
            try {
              const audio = new Audio("/public/audio/new_order.mp3");
              audio.play();
            } catch (error) {
              console.error("Gagal memutar audio:", error);
            }

            const isAlreadyOnOnlinePage = pathname.includes("online-transactions");
            
            if (!isAlreadyOnOnlinePage) {
              toast.custom(
                (t) => (
                  <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-100 overflow-hidden`}>
                    <div className="flex-1 w-0 p-4">
                      <div className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BellRing className="text-blue-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-black text-gray-900">Pesanan Online Baru!</p>
                          <p className="mt-1 text-xs text-gray-500">Ada pelanggan yang memesan via aplikasi. Segera cek dan konfirmasi.</p>
                          <button
                            onClick={() => {
                              toast.dismiss(t.id);
                              router.push(`/${user.role}/online-transactions`);
                            }}
                            className="mt-3 w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                          >
                            Buka Halaman Persetujuan
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-l border-gray-100">
                      <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ),
                { duration: 8000, position: "top-right" } 
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseRealtime.removeChannel(notifyChannel);
    };
  }, [user, isLoadingSession, pathname, router]);

  return null;
}