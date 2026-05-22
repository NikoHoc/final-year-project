import { View, Text, TouchableOpacity } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

interface Props {
  message?: string;
}

export default function LoginReminder({ message = "Silakan login untuk mengakses halaman ini" }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-24 h-24 bg-bakso-background rounded-full items-center justify-center mb-6">
        <UserCircle size={48} color="#F59E0B" />
      </View>
      <Text className="text-2xl font-black text-bakso-text text-center mb-2">Belum Login</Text>
      <Text className="text-sm text-bakso-muted text-center mb-8">{message}</Text>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="w-full bg-bakso-primary py-4 rounded-2xl items-center shadow-sm"
      >
        <Text className="text-white font-bold text-base">Masuk / Daftar Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}