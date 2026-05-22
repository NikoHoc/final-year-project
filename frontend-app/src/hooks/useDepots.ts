import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { getDepots } from '../services/depot';
import { Depot } from '../types';

export interface DepotWithDistance extends Depot {
  distance_km?: number | null;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useDepots = () => {
  const [depots, setDepots] = useState<DepotWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepots = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const depotData = await getDepots();

      let userLat: number | null = null;
      let userLon: number | null = null;
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        userLat = location.coords.latitude;
        userLon = location.coords.longitude;
      }

      const depotsWithDistance = depotData.map(depot => {
        let distance_km = null;
        if (userLat && userLon && depot.latitude && depot.longitude) {
          distance_km = calculateDistance(userLat, userLon, depot.latitude, depot.longitude);
        }
        return { ...depot, distance_km };
      });

      depotsWithDistance.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

      setDepots(depotsWithDistance);
    } catch (error) {
      console.error("Gagal memuat data cabang:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  return { depots, isLoading, refetch: fetchDepots };
};