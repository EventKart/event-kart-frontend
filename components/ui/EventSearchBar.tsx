import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import { Search } from 'lucide-react-native';

interface EventSearchBarProps {
  onQueryChange: (q: string) => void;
}

export function EventSearchBar({ onQueryChange }: EventSearchBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => onQueryChange(value), 400);
    return () => clearTimeout(t);
  }, [value, onQueryChange]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchWrapper,
          isFocused && styles.searchWrapperFocused]}>
        <Search
          size={20}
          color="#64748b"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.input}
          placeholder="Discover premium vendors..."
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={setValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => setValue('')}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    maxWidth: 1000,
    alignSelf: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingLeft: 16,
    paddingRight: 6,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchWrapperFocused: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    height: '100%',
    paddingVertical: 0, // Fixes vertical alignment on some Android versions
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  button: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});