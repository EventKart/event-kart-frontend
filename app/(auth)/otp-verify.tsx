import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { ChevronLeft, ShieldCheck } from "lucide-react-native";
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

import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/api/auth";
import { SERVICE_URLS } from "@/lib/api/base";
import { useAuthStore } from "@/store/authStore";
import { isProfileComplete } from "@/types";

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
    return `Could not reach ${SERVICE_URLS.user}. Check that the user-management service is running and reachable from this device.`;
  }
  return e?.message ?? "Unknown error.";
}

function showError(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
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

function OTPBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const LENGTH = 6;
  const inputs = useRef<Array<TextInput | null>>([]);
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] ?? ""),
  );

  useEffect(() => {
    const expected = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");
    setSlots((prev) => (prev.join("") === expected.join("") ? prev : expected));
  }, [value]);

  useEffect(() => {
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, []);

  const commit = (next: string[]) => {
    setSlots(next);
    onChange(next.join(""));
  };

  const handleChange = (idx: number, text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = [...slots];
      let pos = idx;
      for (const d of digits) {
        if (pos >= LENGTH) break;
        next[pos++] = d;
      }
      commit(next);
      inputs.current[Math.min(pos, LENGTH - 1)]?.focus();
      return;
    }
    const ch = digits.slice(-1);
    const next = [...slots];
    next[idx] = ch;
    commit(next);
    if (ch && idx < LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  return (
    <View style={otpStyles.row}>
      {slots.map((char, idx) => (
        <View key={idx} style={otpStyles.cell}>
          <TextInput
            ref={(el) => {
              inputs.current[idx] = el;
            }}
            value={char}
            onChangeText={(t) => handleChange(idx, t)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !char && idx > 0) {
                inputs.current[idx - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={Platform.OS === "web" ? undefined : 1}
            selectionColor="#cba72f"
            style={[
              otpStyles.input,
              char ? otpStyles.inputFilled : otpStyles.inputEmpty,
              Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
            ]}
          />
          {idx === 2 && <View style={otpStyles.separator} />}
        </View>
      ))}
    </View>
  );
}

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ devOtp?: string }>();
  const phone = useAuthStore((s) => s.pendingPhone);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [otp, setOtp] = useState(params.devOtp ?? "");
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!phone) router.replace("/(auth)/sign-in");
  }, [phone, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleVerify = async () => {
    if (!phone) return;
    if (otp.length !== 6) {
      showError("Invalid code", "Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    let res: Awaited<ReturnType<typeof verifyPhoneOtp>>;
    try {
      res = await verifyPhoneOtp({ phoneNumber: phone, otp });
      if (__DEV__) console.log("[auth] verify-otp succeeded", res);
    } catch (e: any) {
      if (__DEV__)
        console.warn(
          "[auth] verify-otp failed",
          e?.response?.data ?? e?.message,
        );
      setLoading(false);
      showError("Could not verify", describeError(e));
      return;
    }
    setToken(res.token);
    if (res.user) setUser(res.user);
    setLoading(false);
    const verifiedUser = res.user;
    if (!isProfileComplete(verifiedUser)) {
      router.replace("/complete-profile");
    } else if (verifiedUser?.role === "VENDOR") {
      router.replace("/(vendor)/dashboard");
    } else {
      router.replace("/(user)/search");
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    try {
      const res = await requestPhoneOtp({ phoneNumber: phone });
      if (res.devOtp) setOtp(res.devOtp);
      setSeconds(60);
    } catch (e: any) {
      showError("Could not resend", describeError(e));
    } finally {
      setResending(false);
    }
  };

  const masked =
    phone && phone.length > 4
      ? `${phone.slice(0, 3)} ••• ${phone.slice(-3)}`
      : (phone ?? "");

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Bokeh light layer — mirrored/offset from sign-in for variety */}
      <BokehCircle
        size={280}
        left={SW - 40}
        top={120}
        color="rgba(203,167,47,0.18)"
        delay={200}
      />
      <BokehCircle
        size={200}
        left={40}
        top={280}
        color="rgba(203,167,47,0.14)"
        delay={1000}
      />
      <BokehCircle
        size={160}
        left={SW * 0.5}
        top={SH * 0.15}
        color="rgba(30,58,110,0.45)"
        delay={500}
      />
      <BokehCircle
        size={320}
        left={SW * 0.85}
        top={SH * 0.6}
        color="rgba(19,27,46,0.85)"
        delay={700}
      />
      <BokehCircle
        size={180}
        left={SW * 0.2}
        top={SH * 0.7}
        color="rgba(203,167,47,0.15)"
        delay={300}
      />

      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <Reanimated.View
          entering={FadeIn.delay(50).duration(600)}
          style={styles.topBar}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Reanimated.View>

        {/* Hero */}
        <Reanimated.View
          entering={FadeIn.delay(100).duration(900)}
          style={styles.hero}
        >
          <View style={styles.iconRing}>
            <ShieldCheck size={28} color="#cba72f" strokeWidth={1.5} />
          </View>
          <Text style={styles.heroTitle}>Check your{"\n"}phone</Text>
          <Text style={styles.heroSub}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.heroPhone}>{masked}</Text>
          </Text>
        </Reanimated.View>

        {/* Glass card */}
        <Reanimated.View
          entering={FadeInUp.delay(280).duration(650)}
          style={styles.card}
        >
          <OTPBoxes value={otp} onChange={setOtp} />

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.cta, loading && styles.ctaLoading]}
          >
            <Text style={styles.ctaText}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            {seconds > 0 ? (
              <Text style={styles.resendTimer}>
                {" "}
                Resend in 00:{seconds.toString().padStart(2, "0")}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                <Text style={styles.resendLink}>
                  {resending ? "Resending…" : " Resend Code"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {params.devOtp ? (
            <View style={styles.devBanner}>
              <Text style={styles.devBannerTitle}>Dev mode</Text>
              <Text style={styles.devBannerBody}>
                OTP <Text style={styles.devBannerOtp}>{params.devOtp}</Text>{" "}
                autofilled above.
              </Text>
            </View>
          ) : null}
        </Reanimated.View>
      </SafeAreaView>
    </View>
  );
}

const otpStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    width: 46,
    height: 56,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
  },
  inputEmpty: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  inputFilled: {
    borderWidth: 1.5,
    borderColor: "#cba72f",
    backgroundColor: "rgba(203,167,47,0.08)",
  },
  separator: {
    width: 12,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 2,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  safeArea: {
    flex: 1,
  },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },

  // Hero
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(203,167,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 50,
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 22,
  },
  heroPhone: {
    color: "#cba72f",
    fontWeight: "600",
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

  // CTA
  cta: {
    height: 54,
    backgroundColor: "#cba72f",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#cba72f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaLoading: {
    backgroundColor: "rgba(203,167,47,0.4)",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
    letterSpacing: 0.3,
  },

  // Resend
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  resendLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  resendTimer: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  resendLink: {
    fontSize: 13,
    color: "#cba72f",
    fontWeight: "600",
  },

  // Dev banner
  devBanner: {
    marginTop: 20,
    backgroundColor: "rgba(203,167,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.25)",
    borderRadius: 10,
    padding: 14,
  },
  devBannerTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#cba72f",
    textAlign: "center",
    marginBottom: 4,
  },
  devBannerBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  devBannerOtp: {
    color: "#cba72f",
    fontWeight: "700",
  },
});
