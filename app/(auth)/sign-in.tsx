import { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  useWindowDimensions,
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
import { useIsWide } from "@/hooks/useIsWide";

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
  const { width: winW, height: winH } = useWindowDimensions();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const isWide = useIsWide();
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

  // ── Web: full-viewport overlay, brand above + card below ─────────────────
  if (isWide) {
    return (
      <View
        style={{
          position: "fixed" as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#0b1020",
          overflow: "hidden",
        }}
      >
        <StatusBar style="light" />

        {/* Bokeh scaled to viewport */}
        <BokehCircle size={winW * 0.32} left={winW * 0.08} top={winH * 0.15} color="rgba(203,167,47,0.22)" delay={0}    />
        <BokehCircle size={winW * 0.26} left={winW * 0.92} top={winH * 0.58} color="rgba(203,167,47,0.16)" delay={700}  />
        <BokehCircle size={winW * 0.20} left={winW * 0.55} top={winH * 0.07} color="rgba(30,58,110,0.45)"  delay={300}  />
        <BokehCircle size={winW * 0.28} left={winW * 0.28} top={winH * 0.76} color="rgba(19,27,46,0.88)"   delay={600}  />
        <BokehCircle size={winW * 0.18} left={winW * 0.72} top={winH * 0.84} color="rgba(203,167,47,0.14)" delay={1000} />

        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Centered content column */}
        <View style={web.centered}>
          {/* Brand */}
          <Reanimated.View entering={FadeIn.delay(100).duration(900)} style={web.brand}>
            <View style={web.badge}>
              <Star size={9} color="#cba72f" fill="#cba72f" />
              <Text style={web.badgeText}>EVENTKART</Text>
              <Star size={9} color="#cba72f" fill="#cba72f" />
            </View>
            <Text style={web.heroTitle}>{"Where Events\nCome Alive"}</Text>
            <Text style={web.heroSub}>Seamlessly discover, book & manage events</Text>
          </Reanimated.View>

          {/* Form card */}
          <Reanimated.View entering={FadeInUp.delay(280).duration(600)} style={web.card}>
            <Text style={web.cardTitle}>Sign In</Text>
            <Text style={web.cardSub}>Enter your phone number to continue</Text>

            <Text style={web.label}>PHONE NUMBER</Text>
            <View style={web.inputRow}>
              <View style={web.dialCode}>
                <Text style={web.dialCodeText}>+91</Text>
              </View>
              <TextInput
                style={[web.input, focused && web.inputFocused]}
                placeholder="000 0000000"
                placeholderTextColor="#c6c6cd"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor="#cba72f"
              />
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading || formattedNumber.length < 7}
              activeOpacity={0.85}
              style={[
                web.cta,
                (loading || formattedNumber.length < 7) && web.ctaDisabled,
              ]}
            >
              <Text style={web.ctaText}>
                {loading ? "Sending…" : "Send Verification Code"}
              </Text>
              {!loading && <ArrowRight size={18} color="#ffffff" />}
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      </View>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────────────────
  return (
    <View style={mob.root}>
      <StatusBar style="light" />

      <BokehCircle size={340} left={winW * 0.06}  top={160}         color="rgba(203,167,47,0.22)" delay={0}    />
      <BokehCircle size={240} left={winW * 0.88}  top={300}         color="rgba(203,167,47,0.16)" delay={800}  />
      <BokehCircle size={180} left={winW * 0.5}   top={60}          color="rgba(30,58,110,0.5)"   delay={300}  />
      <BokehCircle size={300} left={winW * 0.1}   top={winH * 0.65} color="rgba(19,27,46,0.9)"    delay={600}  />
      <BokehCircle size={220} left={winW * 0.8}   top={winH * 0.45} color="rgba(203,167,47,0.12)" delay={1200} />
      <BokehCircle size={140} left={winW * 0.3}   top={winH * 0.8}  color="rgba(203,167,47,0.18)" delay={500}  />
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={mob.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={mob.flex}
        >
          <Reanimated.View
            entering={FadeIn.delay(100).duration(900)}
            style={mob.hero}
          >
            <View style={mob.badge}>
              <Star size={9} color="#cba72f" fill="#cba72f" />
              <Text style={mob.badgeText}>EVENTKART</Text>
              <Star size={9} color="#cba72f" fill="#cba72f" />
            </View>
            <Text style={mob.heroTitle}>{"Where Events\nCome Alive"}</Text>
            <Text style={mob.heroSub}>
              Seamlessly discover, book & manage events
            </Text>
          </Reanimated.View>

          <Reanimated.View
            entering={FadeInUp.delay(280).duration(650)}
            style={mob.card}
          >
            <Text style={mob.cardTitle}>Sign In</Text>
            <Text style={mob.cardSubtitle}>
              Enter your phone number to continue
            </Text>

            <View style={mob.field}>
              <Text style={mob.fieldLabel}>PHONE NUMBER</Text>
              <View style={mob.inputRow}>
                <View style={mob.dialCode}>
                  <Text style={mob.dialCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[mob.input, focused && mob.inputFocused]}
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
                mob.cta,
                (loading || formattedNumber.length < 7) && mob.ctaDisabled,
              ]}
            >
              <Text style={mob.ctaText}>
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

// ── Web styles ────────────────────────────────────────────────────────────────
const web = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 32,
  },
  brand: {
    alignItems: "center",
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
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 11,
    color: "#cba72f",
    letterSpacing: 2.5,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 64,
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1b1b1d",
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "#45464d",
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#45464d",
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dialCode: {
    height: 50,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#c6c6cd",
    borderRadius: 10,
  },
  dialCodeText: {
    fontSize: 16,
    color: "#1b1b1d",
    fontWeight: "600",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#c6c6cd",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1b1b1d",
  },
  inputFocused: {
    borderColor: "#cba72f",
    borderWidth: 1.5,
    backgroundColor: "#ffffff",
  },
  cta: {
    height: 52,
    backgroundColor: "#131b2e",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaDisabled: {
    backgroundColor: "#c6c6cd",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mob = StyleSheet.create({
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
