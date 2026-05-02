import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Trash2 } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
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

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-6 pb-2">
        <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
          Portfolio
        </Text>
        <Text className="font-serif-bold text-h2 text-surface-on mt-1">Showcase your work</Text>
        <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
          High quality photos help you stand out and win bookings.
        </Text>
      </View>

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
    </Screen>
  );
}
