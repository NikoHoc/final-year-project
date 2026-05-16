"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, Depot } from "@/types";
import { useDepots } from "@/hooks/useDepot";

interface SessionContextType {
  user: User | null;
  depot: Depot | null;
  isLoadingSession: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  depot: null,
  isLoadingSession: true,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [depot, setDepot] = useState<Depot | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const { fetchDepotById } = useDepots();

  useEffect(() => {
    const initSession = async () => {
      try {
        const userCookie = Cookies.get("user");
        if (userCookie) {
          const parsedUser = JSON.parse(userCookie);
          setUser(parsedUser);

          if (parsedUser.depot_id) {
            const depotData = await fetchDepotById(parsedUser.depot_id);
            setDepot(depotData);
          }
        }
      } catch (error) {
        console.error("Gagal inisialisasi sesi:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    initSession();
  }, [fetchDepotById]);

  return (
    <SessionContext.Provider value={{ user, depot, isLoadingSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);