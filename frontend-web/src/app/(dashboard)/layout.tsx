"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    const role = user.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      router.replace(`/${role}`);
    } else if (pathname.startsWith("/kasir") && role !== "kasir") {
      router.replace(`/${role}`);
    } else if (pathname.startsWith("/pelayan") && role !== "pelayan") {
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
  
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
