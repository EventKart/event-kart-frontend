import { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Star } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";

import { requestPhoneOtp } from "@/lib/api/auth";
import { SERVICE_URLS } from "@/lib/api/base";
import { useAuthStore } from "@/store/authStore";

const { width: SW, height: SH } = Dimensions.get("window");

function describeError(e: any): string {
  if (e?.response) {
    const status = e.response.status;
    const data = e.response.data;
    const detail =
      typeof data === "string" ? data : (data?.message ?? data?.error);
    return `Server returned ${status}${detail ? ` — ${detail}` : ""}.`;
  }
  if (e?.message?.includes("Network Error")) {
    return `Could not reach ${SERVICE_URLS.user}. Make sure the user-management service is running and reachable from this device.`;
  }
  if (e?.code === "ECONNABORTED") {
    return "Request timed out. Is the backend reachable from this device?";
  }
  return e?.message ?? "Unknown error.";
}

type BokehProps = {
  size: number;
  left: number;
  top: number;
  color: string;
  delay: number;
};

function BokehCircle({ size, left, top, color, delay }: BokehProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800 }),
          withTiming(0.25, { duration: 2800 }),
        ),
        -1,
        true,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 4000 }),
          withTiming(0.8, { duration: 4000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Reanimated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: left - size / 2,
          top: top - size / 2,
        },
        animStyle,
      ]}
    />
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const formattedNumber = phone.replace(/\D/g, "");

  const handleSendOtp = async () => {
    if (formattedNumber.length < 7) {
      if (Platform.OS === "web") {
        window.alert("Please enter a valid phone number.");
        return;
      }
      Alert.alert("Invalid number", "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${formattedNumber}`;
      const res = await requestPhoneOtp({ phoneNumber: fullNumber });
      setPendingPhone(fullNumber);
      router.push({
        pathname: "/(auth)/otp-verify",
        params: { devOtp: res.devOtp ?? "" },
      });
    } catch (e: any) {
      const msg = describeError(e);
      if (Platform.OS === "web") {
        window.alert(`Could not send OTP — ${msg}`);
      } else {
        Alert.alert("Could not send OTP", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Bokeh light layer */}
      <BokehCircle
        size={340}
        left={30}
        top={160}
        color="rgba(203,167,47,0.22)"
        delay={0}
      />
      <BokehCircle
        size={240}
        left={SW - 50}
        top={300}
        color="rgba(203,167,47,0.16)"
        delay={800}
      />
      <BokehCircle
        size={180}
        left={SW * 0.5}
        top={60}
        color="rgba(30,58,110,0.5)"
        delay={300}
      />
      <BokehCircle
        size={300}
        left={50}
        top={SH * 0.65}
        color="rgba(19,27,46,0.9)"
        delay={600}
      />
      <BokehCircle
        size={220}
        left={SW * 0.8}
        top={SH * 0.45}
        color="rgba(203,167,47,0.12)"
        delay={1200}
      />
      <BokehCircle
        size={140}
        left={SW * 0.3}
        top={SH * 0.8}
        color="rgba(203,167,47,0.18)"
        delay={500}
      />

      {/* Blur overlay — blurs the bokeh for a soft venue-lights effect */}
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          {/* Hero */}
          <Reanimated.View
            entering={FadeIn.delay(100).duration(900)}
            style={styles.hero}
          >
            <View style={styles.badge}>
              <Star size={9} color="#cba72f" fill="#cba72f" />
              <Text style={styles.badgeText}>EVENTKART</Text>
              <Star size={9} color="#cba72f" fill="#cba72f" />
            </View>
            <Text style={styles.heroTitle}>{"Where Events\nCome Alive"}</Text>
            <Text style={styles.heroSub}>
              Seamlessly discover, book & manage events
            </Text>
          </Reanimated.View>

          {/* Glass card */}
          <Reanimated.View
            entering={FadeInUp.delay(280).duration(650)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your phone number to continue
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <View style={styles.inputRow}>
                <View style={styles.dialCode}>
                  <Text style={styles.dialCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, focused && styles.inputFocused]}
                  placeholder="000 0000000"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  selectionColor="#cba72f"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading || formattedNumber.length < 7}
              activeOpacity={0.85}
              style={[
                styles.cta,
                (loading || formattedNumber.length < 7) && styles.ctaDisabled,
              ]}
            >
              <Text style={styles.ctaText}>
                {loading ? "Sending…" : "Send Verification Code"}
              </Text>
              {!loading && <ArrowRight size={18} color="#131b2e" />}
            </TouchableOpacity>
          </Reanimated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Hero
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(203,167,47,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.3)",
    marginBottom: 22,
  },
  badgeText: {
    fontSize: 11,
    color: "#cba72f",
    letterSpacing: 2.5,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 54,
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Card
  card: {
    marginHorizontal: 16,
    marginBottom: 28,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(11,16,34,0.88)",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.18)",
    shadowColor: "#cba72f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 24,
  },

  // Field
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#cba72f",
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  dialCode: {
    height: 50,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  dialCodeText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#ffffff",
  },
  inputFocused: {
    borderColor: "#cba72f",
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  // CTA
  cta: {
    height: 54,
    backgroundColor: "#cba72f",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#cba72f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDisabled: {
    backgroundColor: "rgba(203,167,47,0.28)",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
    letterSpacing: 0.3,
  },
});
