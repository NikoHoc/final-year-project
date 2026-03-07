import { useState, useEffect } from "react";
import { depotService } from "../services/depotService";

export const useDepot = (depotId?: number | null) => {
  const [depotName, setDepotName] = useState<string | null>(null);
  const [isLoadingDepot, setIsLoadingDepot] = useState(false);

  useEffect(() => {
    if (!depotId) return;

    const fetchDepotName = async () => {
      setIsLoadingDepot(true);
      try {
        const res = await depotService.getById(depotId);

        if (res.status && res.data) {
          setDepotName(res.data.name); 
        }
      } catch (error) {
        console.error("Gagal mengambil data depot:", error);
        setDepotName("Depot POS");
      } finally {
        setIsLoadingDepot(false);
      }
    };

    fetchDepotName();
  }, [depotId]);

  return { depotName, isLoadingDepot };
};