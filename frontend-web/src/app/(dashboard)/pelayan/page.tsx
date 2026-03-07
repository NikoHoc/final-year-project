"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";

export default function PelayanPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="p-8 font-poppins min-h-screen bg-gray-100">
      <div className="mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold font-montserrat text-blue-600 mb-6">
          Halaman Pelayan
        </h1>

        <p className="mb-4 text-gray-600">
          Berhasil masuk! Ini adalah data Anda:
        </p>

        {userData ? (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-black">
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong> {userData.email || "Tidak ada email"}
              </li>
              <li>
                <strong>Nama:</strong> {userData.full_name || "Tidak ada nama"}
              </li>
              <li>
                <strong>Role:</strong>
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded uppercase">
                  {userData.role}
                </span>
              </li>
              <li>
                <strong>Depot ID:</strong> {userData.depot_id || "Semua Cabang"}
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-red-500">
            Memuat data user atau Anda belum login...
          </p>
        )}
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-medium rounded-lg transition-colors flex justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
}
