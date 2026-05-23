import { useState, useEffect, useCallback } from 'react';
import { getDepotMenus } from '../services/menu';
import { Menu } from '@/types';
import { supabaseRealtime } from '../config/supabaseClient';

export const useMenus = (depotId: number) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const extractCategories = (menuData: Menu[]) => {
    const uniqueCats: { id: number; name: string }[] = [];
    const seenIds = new Set();
    menuData.forEach((menu) => {
      if (menu.categories && !seenIds.has(menu.categories.id)) {
        seenIds.add(menu.categories.id);
        uniqueCats.push({ id: menu.categories.id, name: menu.categories.name });
      }
    });
    setCategories(uniqueCats);
  };

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDepotMenus(depotId);
      if (!data) return;
      setMenus(data);
      extractCategories(data);
    } catch (error) {
      console.error("Gagal load menu:", error);
    } finally {
      setIsLoading(false);
    }
  }, [depotId]);

  const silentRefetchMenus = useCallback(async () => {
    try {
      const data = await getDepotMenus(depotId);
      if (!data) return;
      setMenus(data);
      extractCategories(data);
    } catch (error) {
      console.error("Gagal silent refresh menu:", error);
    }
  }, [depotId]);

  useEffect(() => {
    fetchMenus();

    const channel = supabaseRealtime
      .channel(`realtime-depot-menus-${depotId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'depot_menus', filter: `depot_id=eq.${depotId}` },
        () => {
          // Trigger silent refresh saat kasir/owner melakukan INSERT, UPDATE, atau DELETE
          silentRefetchMenus();
        }
      )
      .subscribe();

    return () => { supabaseRealtime.removeChannel(channel); };
  }, [fetchMenus, depotId, silentRefetchMenus]);

  return { menus, categories, isLoading, refetch: fetchMenus };
};