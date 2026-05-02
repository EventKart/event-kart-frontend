import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useInvitations } from '@/hooks/useInvitations';

export default function CreateInvitationScreen() {
  const router = useRouter();
  const { create, sendBulk } = useInvitations();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [emails, setEmails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give your event a name to get started.');
      return;
    }
    setSubmitting(true);
    try {
      const inv = await create({
        title: title.trim(),
        date: date.trim() || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      const list = emails
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter(Boolean);
      if (list.length) {
        await sendBulk(inv.id, list);
        Alert.alert('Invites sent', `${list.length} invitation${list.length > 1 ? 's' : ''} dispatched.`);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Could not create', e?.message ?? 'Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-4 pb-10 gap-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
        >
          <ArrowLeft size={20} color="#1b1b1d" />
        </Pressable>

        <Text className="font-serif-bold text-h2 text-surface-on">Create invitation</Text>
        <Text className="font-sans text-body-md text-surface-on-variant">
          Set up your event. You can invite guests now or later.
        </Text>

        <View className="gap-4 mt-2">
          <Input
            label="Event Title"
            placeholder="Aanya & Rohan — The Wedding"
            value={title}
            onChangeText={setTitle}
          />
          <Input label="Date" placeholder="2026-12-12" value={date} onChangeText={setDate} />
          <Input
            label="Location"
            placeholder="The Marigold Estate, Bengaluru"
            value={location}
            onChangeText={setLocation}
          />

          <View className="gap-1">
            <Text className="text-surface-on-variant font-sans-md text-label-md uppercase tracking-wider">
              Description
            </Text>
            <View className="bg-surface-container-lowest rounded-lg border border-outline-variant px-4 py-3">
              <TextInput
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                placeholder="A weekend of celebrations…"
                placeholderTextColor="#76777d"
                className="font-sans text-body-md text-surface-on min-h-[80px]"
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="gap-1">
            <Text className="text-surface-on-variant font-sans-md text-label-md uppercase tracking-wider">
              Guest Emails (comma or newline separated)
            </Text>
            <View className="bg-surface-container-lowest rounded-lg border border-outline-variant px-4 py-3">
              <TextInput
                multiline
                numberOfLines={4}
                value={emails}
                onChangeText={setEmails}
                placeholder="aanya@example.com, rohan@example.com"
                placeholderTextColor="#76777d"
                autoCapitalize="none"
                keyboardType="email-address"
                className="font-sans text-body-md text-surface-on min-h-[80px]"
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View className="mt-2">
          <Button label="Create & Send" loading={submitting} onPress={handleSubmit} />
        </View>
      </View>
    </Screen>
  );
}
