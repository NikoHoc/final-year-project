import { useState, useEffect } from 'react';
import { Depot } from '../types';
import { supabaseRealtime } from '../config/supabaseClient';
import { getDepotDetail } from '@/services/depot';

export const useDepotDetail = (depotId: number) => {
  const [depot, setDepot] = useState<Depot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepot = async () => {
      try {
        setIsLoading(true);

        const depotData = await getDepotDetail(depotId);
        if (depotData) setDepot(depotData);
      } catch (error) {
        console.error("Gagal load detail depot:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepot();

    const channel = supabaseRealtime
      .channel(`realtime-depot-${depotId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'depots', filter: `id=eq.${depotId}` },
        (payload: any) => {
          setDepot((prev) => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => { supabaseRealtime.removeChannel(channel); };
  }, [depotId]);

  return { depot, isLoading };
};