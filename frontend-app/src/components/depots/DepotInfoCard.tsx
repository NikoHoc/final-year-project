import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { MapPin, Clock, PhoneCall } from 'lucide-react-native';
import { Depot } from '@/types';

interface Props {
  depot: Depot | null;
}

export default function DepotInfoCard({ depot }: Props) {
  if (!depot) return null;

  const handleWhatsApp = () => {
    if (!depot.phone_number) return;
    let formattedPhone = depot.phone_number.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }
    const message = `Halo Admin ${depot.name}, saya ingin bertanya.`;
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(waUrl).then((supported) => {
      if (supported) Linking.openURL(waUrl);
      else Alert.alert("Gagal Membuka WhatsApp", "Terjadi kesalahan dalam membuka url.");
    });
  };

  const handleMap = async () => {
    if (!depot.map_url) {
      Alert.alert("Informasi", "Lokasi peta belum diatur oleh pemilik cabang ini.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(depot.map_url);
      if (supported) {
        await Linking.openURL(depot.map_url);
      } else {
        throw new Error();
      }
    } catch (err) {
      Alert.alert("Gagal Membuka Peta", "Link rute tidak valid atau tidak ada aplikasi peta yang mendukung.");
    }
  };

  return (
    <View className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mx-4 mt-2">
      <View className={`w-full py-2 items-center ${depot.is_open ? 'bg-green-500' : 'bg-red-500'}`}>
        <Text className="text-white font-black text-[10px] tracking-widest uppercase">
          {depot.is_open ? '🟢 SEDANG BUKA - BISA DIPESAN' : '🔴 SEDANG TUTUP'}
        </Text>
      </View>

      <View className="p-4 space-y-3">
        <Text className="text-2xl font-black text-gray-800">{depot.name}</Text>
        
        <View className="flex-row items-start">
          <MapPin size={16} color="#9CA3AF" style={{ marginTop: 2, marginRight: 8 }} />
          <Text className="text-sm text-gray-500 flex-1">{depot.address}</Text>
        </View>

        <TouchableOpacity onPress={handleWhatsApp} className="flex-row items-center active:opacity-60">
          <PhoneCall size={16} color="#25D366" style={{ marginRight: 8 }} />
          <Text className="text-sm font-bold text-green-600 underline">{depot.phone_number} (Chat WA)</Text>
        </TouchableOpacity>

        <View className="flex-row items-start">
          <Clock size={16} color="#F59E0B" style={{ marginTop: 2, marginRight: 8 }} />
          <View>
            <Text className="text-sm font-bold text-gray-600">Setiap Hari</Text>
            {depot.shift1_start ? (
              <>
                <Text className="text-xs text-gray-500 mt-1">{depot.shift1_start.slice(0,5)} - {depot.shift1_end?.slice(0,5)}</Text>
                {depot.shift2_start && (
                  <Text className="text-xs text-gray-500">{depot.shift2_start.slice(0,5)} - {depot.shift2_end?.slice(0,5)}</Text>
                )}
              </>
            ) : (
              <Text className="text-xs text-gray-400 mt-1">Jam belum diatur</Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleMap}
          className="mt-2 bg-blue-50 py-2.5 rounded-xl border border-blue-100 items-center"
        >
          <Text className="font-bold text-blue-600 text-xs">Buka Rute Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}