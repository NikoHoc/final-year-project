// src/components/auth/LoginReminderModal.tsx
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

export default function LoginReminderModal({ visible, onClose }: any) {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View style={{ opacity: fadeAnim }} className="flex-1 bg-black/60 justify-center items-center p-6">
        <View className="bg-white rounded-3xl p-8 w-full items-center shadow-2xl">
          <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-6 border border-amber-100">
            <UserCircle size={40} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-black text-gray-800 mb-2">Opss! Belum Login</Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            Silakan login untuk mulai memesan hidangan favorit Anda.
          </Text>
          
          <TouchableOpacity 
            onPress={() => { onClose(); navigation.navigate('Login'); }}
            className="w-full bg-bakso-primary py-4 rounded-xl items-center mb-3"
          >
            <Text className="text-white font-bold text-base">Login Sekarang</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="w-full py-4 rounded-xl items-center">
            <Text className="text-gray-500 font-bold text-sm">Batal</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}