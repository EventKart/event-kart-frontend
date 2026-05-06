import { Alert, Platform, Pressable, ScrollView, Text, View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, LogOut, Mail, Phone, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Badge } from '@/components/ui/Badge';
import { logoutUser } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useMedia } from '@/hooks/useMedia';

export default function VendorPortfolio() {
  const vendor = useAuthStore((s) => s.vendor);
  const ownerId = vendor?.id;
  const { items, upload, remove } = useMedia({ ownerId });

  const handleAdd = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload portfolio media.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    await upload({
      uri: asset.uri,
      name: asset.fileName ?? `portfolio-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      tags: ['portfolio'],
    });
  };

  const confirmRemove = (id: string) => {
    Alert.alert('Remove image?', 'This will remove the image from your portfolio.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    const doSignOut = () => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) void logoutUser(currentToken).catch(() => {});
      signOut();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of EventKart? You will need to sign in again.')) doSignOut();
      return;
    }
    Alert.alert('Sign out', 'You will need to sign in again to use EventKart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: doSignOut },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <StatusBar style="dark" />
      <View className="h-16 flex-row items-center justify-between px-6 bg-white border-b border-outline-variant/60 shadow-sm">
        <View className="w-10" />
        <Text className="font-serif-bold text-[22px] text-surface-on">EventKart</Text>
        <View className="w-10" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-5 pt-6 pb-2">
        <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
          Portfolio
        </Text>
        <Text className="font-serif-bold text-h2 text-surface-on mt-1">Showcase your work</Text>
        <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
          High quality photos help you stand out and win bookings.
        </Text>
      </View>

      {/* Vendor Contact Info */}
      {vendor ? (
        <View className="mx-5 mt-2 mb-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <View className="flex-row items-center gap-2 pb-3 border-b border-surface-variant mb-4">
            <Text className="font-serif-bold text-h3 text-surface-on">Contact Information</Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center gap-3 p-2">
              <Mail size={18} color="#45464d" />
              <View>
                <Text className="font-sans-md text-label-md text-surface-on-variant">Email Address</Text>
                <Text className="font-sans-md text-body-md text-surface-on mt-0.5">
                  {vendor.email || 'Not set'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3 p-2">
              <Phone size={18} color="#45464d" />
              <View>
                <Text className="font-sans-md text-label-md text-surface-on-variant">Phone Number</Text>
                <Text className="font-sans-md text-body-md text-surface-on mt-0.5">
                  {vendor.contactNumber || 'Not set'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View className="px-5 pt-4 pb-10">
        <View className="flex-row flex-wrap -mx-1">
          <View className="w-1/2 px-1 mb-2">
            <Pressable
              onPress={handleAdd}
              className="aspect-square rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low items-center justify-center active:bg-surface-container"
            >
              <View className="w-12 h-12 rounded-full bg-tertiary-fixed items-center justify-center">
                <ImagePlus size={20} color="#4e3d00" />
              </View>
              <Text className="font-sans-sb text-body-sm text-surface-on mt-2">Add photo</Text>
              <Text className="font-sans text-label-md text-surface-on-variant mt-1">JPG · PNG · 10MB</Text>
            </Pressable>
          </View>

          {items.map((m) => (
            <View key={m.id} className="w-1/2 px-1 mb-2">
              <View className="aspect-square rounded-xl overflow-hidden bg-surface-container-high">
                <Image source={{ uri: m.thumbnailUrl ?? m.fileUrl }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2 left-2">
                  <Badge label={m.id.startsWith('local-') ? 'Pending Sync' : 'Live'} tone={m.id.startsWith('local-') ? 'warning' : 'success'} />
                </View>
                <Pressable
                  onPress={() => confirmRemove(m.id)}
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-surface-container-lowest/95 items-center justify-center"
                >
                  <Trash2 size={16} color="#ba1a1a" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <Pressable
        onPress={handleSignOut}
        className="mx-5 mb-4 bg-surface-container-lowest rounded-xl border border-error/20 p-5 flex-row items-center active:bg-error-container/30"
      >
        <View className="w-10 h-10 rounded-full bg-error-container/50 items-center justify-center mr-4">
          <LogOut size={18} color="#ba1a1a" />
        </View>
        <Text className="flex-1 font-sans-sb text-body-md text-error">Sign Out</Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
