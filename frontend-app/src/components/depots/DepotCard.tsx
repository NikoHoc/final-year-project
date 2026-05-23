import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { MapPin, Clock, Navigation, Bike, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { DepotWithDistance } from '@/hooks/useDepots';

interface DepotCardProps {
  depot: DepotWithDistance;
  isClosest: boolean;
}

export default function DepotCard({ depot, isClosest }: DepotCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('DepotMenu', { 
      depotId: depot.id, 
      depotName: depot.name 
    });
  };

  const openMap = () => {
    if (!depot.map_url) {
      Alert.alert("Informasi", "Lokasi depot ini belum ditambahkan oleh pemilik depot ini.");
      return;
    }
    
    Linking.openURL(depot.map_url).catch((err) => {
      console.log("Gagal membuka Google Maps:", err);
      Alert.alert("Terjadi Kesalahan", "Gagal membuka lokasi depot pada map.");
    });
  };

  const renderDistance = () => {
    if (!depot.latitude || !depot.longitude) return "Lokasi belum tersedia";
    if (depot.distance_km === undefined || depot.distance_km === null) return "Menghitung...";
    return `${depot.distance_km.toFixed(1)} km`;
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center flex-wrap gap-2 mb-1">
            <Text className="text-lg font-black text-bakso-text">{depot.name}</Text>
            
            {isClosest && depot.distance_km !== null && depot.distance_km !== undefined && (
              <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                <Text className="text-[9px] font-black text-white">TERDEKAT</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-start">
            <MapPin size={12} color="#9CA3AF" style={{ marginTop: 2, marginRight: 4 }} />
            <Text className="text-xs text-bakso-muted flex-1" numberOfLines={2}>
              {depot.address}
            </Text>
          </View>
        </View>
        
        <View className={`px-2 py-1 rounded-md border ${depot.is_open ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <Text className={`text-[10px] font-bold uppercase ${depot.is_open ? 'text-green-600' : 'text-red-600'}`}>
            {depot.is_open ? 'BUKA' : 'TUTUP'}
          </Text>
        </View>
      </View>
      <View className="my-3 space-y-2.5">
        <View className="flex-row items-start">
          <Clock size={12} color="#6B7280" style={{ marginRight: 6, marginTop: 2 }} />
          <View>
            <Text className="text-xs font-bold text-gray-600">Setiap Hari</Text>
            {!depot.shift1_start ? (
              <Text className="text-[11px] font-medium text-gray-400 mt-0.5">Belum diatur</Text>
            ) : (
              <>
                <Text className="text-[11px] font-medium text-gray-500 mt-0.5">
                  {depot.shift1_start.slice(0, 5)} - {depot.shift1_end?.slice(0, 5)}
                </Text>
                {depot.shift2_start && (
                  <Text className="text-[11px] font-medium text-gray-500 mt-0.5">
                    {depot.shift2_start.slice(0, 5)} - {depot.shift2_end?.slice(0, 5)}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3 pt-1.5">
          <View className="flex-row items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <ShoppingBag size={11} color="#DC2626" />
            <Text className="text-[10px] font-bold text-gray-600 ml-1.5">Ambil Sendiri</Text>
          </View>
          <View className="flex-row items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <Bike size={11} color="#F59E0B" />
            <Text className="text-[10px] font-bold text-gray-600 ml-1.5">Driver Sendiri</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-50 pt-3 mt-1">
        <Text className="text-xs font-bold text-bakso-secondary">
          📍 Jarak: {renderDistance()}
        </Text>

        <TouchableOpacity 
          onPress={openMap}
          className="flex-row items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl"
        >
          <Navigation size={12} color="#2563EB" />
          <Text className="text-xs font-bold text-blue-600 ml-1">Rute</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}