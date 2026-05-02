import { Image, Text, View } from 'react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  className?: string;
}

function initialsFor(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

export function Avatar({ uri, name, size = 48, className = '' }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={className}
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`bg-secondary-container items-center justify-center ${className}`}
    >
      <Text
        style={{ fontSize: size * 0.4 }}
        className="font-sans-sb text-secondary-on-container uppercase"
      >
        {initialsFor(name)}
      </Text>
    </View>
  );
}
