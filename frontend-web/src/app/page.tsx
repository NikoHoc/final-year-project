"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";
import { getUserData } from "@/utils/auth"; 

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUserData();

    if (!user) {
      router.replace("/login");
      return;
    }

    const roleRoutes: Record<Role, string> = {
      admin: "/admin",
      kasir: "/kasir",
      pelayan: "/pelayan",
      pelanggan: "/pelanggan",
    };

    router.replace(roleRoutes[user.role] || "/login");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 font-poppins">Mengalihkan...</p>
    </div>
  );
}
