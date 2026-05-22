import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import LoginReminder from '../../components/auth/LoginReminder';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">Profil Saya</Text>
      </View>

      {!user ? (
        <LoginReminder message="Masuk ke akun Anda untuk mengelola profil dan pengaturan aplikasi." />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Halo, {user.full_name}</Text>
        </View>
      )}
    </View>
  );
}