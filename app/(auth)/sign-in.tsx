import { useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import PhoneInput from "react-native-phone-number-input";

import { requestPhoneOtp } from '@/lib/api/auth';
import { SERVICE_URLS } from '@/lib/api/base';
import { useAuthStore } from '@/store/authStore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function describeError(e: any): string {
  if (e?.response) {
    const status = e.response.status;
    const data = e.response.data;
    const detail = typeof data === 'string' ? data : data?.message ?? data?.error;
    return `Server returned ${status}${detail ? ` — ${detail}` : ''}.`;
  }
  if (e?.message?.includes('Network Error')) {
    return `Could not reach ${SERVICE_URLS.user}. Make sure the user-management service is running and reachable from this device.`;
  }
  if (e?.code === 'ECONNABORTED') {
    return 'Request timed out. Is the backend reachable from this device?';
  }
  return e?.message ?? 'Unknown error.';
}

export default function SignInScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [country, setCountry] = useState<Country>();
  const [visible, setVisible] = useState(false);

  const formattedNumber = phone.replace(/\D/g, '');
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    setVisible(false);
  };


  const handleSendOtp = async () => {
    if (formattedNumber.length < 7) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid phone number.');
        return;
      }
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${formattedNumber}`;
      const res = await requestPhoneOtp({ phoneNumber: fullNumber });
      setPendingPhone(fullNumber);
      router.push({
        pathname: '/(auth)/otp-verify',
        params: { devOtp: res.devOtp ?? '' },
      });
    } catch (e: any) {
      const msg = describeError(e);
      if (Platform.OS === 'web') {
        window.alert(`Could not send OTP — ${msg}`);
      } else {
        Alert.alert('Could not send OTP', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.borderView}>
            {/* TopAppBar */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>EventKart</Text>
              <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.flexGrow}
            >
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.heroSection}>
                  <Text style={styles.title}>Welcome</Text>
                  <Text style={styles.subtitle}>
                    Enter your phone number to continue or create a new account.
                  </Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <View style={styles.inputContainer}>
                    {/* Country Code (Simplified Selector) */}
                    <View style={styles.countrySelector} onPress={() => setVisible(true)}>
                      <Text style={styles.inputText}>{country?.callingCode[0] ? `+${country.callingCode[0]}` : '+91'}</Text>
                      {/*<MaterialIcons name="arrow-drop-down" size={20} color="#c6c6cd" />*/}
                    </View>

                    {/* Phone Input */}
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="(555) 000-0000"
                      placeholderTextColor="#c6c6cd"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>

                {/* Bottom Action Section */}

                <View style={styles.footer}>
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading || formattedNumber.length < 7}
                    activeOpacity={0.88}
                    style={[styles.submitButton, (loading || formattedNumber.length < 7) && styles.disabledButton]}>
                    <Text className="font-sans-sb text-button text-white uppercase tracking-wide">
                      {loading ? 'Sending…' : 'Send Verification Code'}
                    </Text>
                    {!loading && <ArrowRight size={18} color="#ffffff" />}
                  </TouchableOpacity>
                  {/*<TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Send Verification Code</Text>
                    <MaterialIcons name="send" size={30} color="white" />
                  </TouchableOpacity>*/}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
        </View>
          </SafeAreaView>
        );
      };

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
          paddingBottom: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
          backgroundColor: '#fcf8fa', // bg-background
        },
        flexGrow: {
          flex: 1,
        },
        header: {
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          backgroundColor: '#000000',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0', // border-slate-200/60
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        headerTitle: {
          fontSize: 30,
          fontWeight: '600',
          fontStyle: 'bold',
          color: '#ffffff',
          fontFamily: Platform.OS === 'ios' ? 'Noto Serif' : 'serif',
        },
        backButton: {
          padding: 8,
        },
        iconText: {
          fontFamily: 'Material Symbols Outlined', // Replace with icon library
          fontSize: 24,
          color: '#64748b',
        },
        placeholder: {
          width: 40,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 32,
        },
        heroSection: {
          marginTop: 40,
          marginBottom: 40,
          alignItems: 'center',
        },
        title: {
          fontSize: 30, // text-h2
          fontWeight: '500',
          color: '#000000',
          marginBottom: 8,
          fontFamily: Platform.OS === 'ios' ? 'Noto Serif' : 'serif',
        },
        subtitle: {
          fontSize: 16,
          color: '#45464d', // text-on-surface-variant
          textAlign: 'center',
          lineHeight: 24,
        },
        form: {
          flex: 1,
        },
        label: {
          fontSize: 12,
          fontWeight: '500',
          color: '#45464d',
          letterSpacing: 1,
          marginBottom: 8,
          paddingLeft: 4,
        },
        inputContainer: {
          flexDirection: 'row',
          gap: 8,
        },
        countrySelector: {
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#c6c6cd',
          borderRadius: 8,
          paddingHorizontal: 12,
          gap: 4,
        },
        phoneInput: {
          flex: 1,
          height: 50,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#c6c6cd',
          borderRadius: 8,
          paddingHorizontal: 16,
          fontSize: 16,
          color: '#1b1b1d',
        },
        inputText: {
          fontSize: 16,
          color: '#1b1b1d',
        },
        dropdownIcon: {
          fontFamily: 'Material Symbols Outlined', // Replace with icon library
          fontSize: 20,
          color: '#c6c6cd',
        },
        footer: {
          marginTop: 'auto',
          paddingTop: 24,
        },
        submitButton: {
          backgroundColor: '#000000', // bg-primary[cite: 2]
          height: 56,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        disabledButton: {
          backgroundColor: '#c6c6cd',
        },
        submitButtonText: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        buttonIcon: {
          fontSize: 18,
          color: '#ffffff',
        },
        loginRedirect: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 24,
          alignItems: 'center',
        },
        bodySm: {
          fontSize: 14,
          color: '#45464d',
        },
        linkText: {
          fontSize: 14,
          fontWeight: '600',
          color: '#000000',
        },
        borderView: {
          flex: 1,
          borderWidth: 1,
          borderColor: '#c6c6cd',
          borderRadius: 8,
          marginHorizontal: 16,
        },
      });