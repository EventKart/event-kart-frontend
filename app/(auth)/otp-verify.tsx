import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
  dark,
}: {
  value: string;
  onChange: (v: string) => void;
  dark: boolean;
}) {
  const LENGTH = 6;
  const inputs = useRef<Array<TextInput | null>>([]);
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] ?? ""),
  );

  useEffect(() => {
    const expected = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");
    setSlots((prev) =>
      prev.join("") === expected.join("") ? prev : expected,
    );
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

  const emptyBorder = dark
    ? "rgba(255,255,255,0.12)"
    : "#c6c6cd";
  const bg = dark ? "rgba(255,255,255,0.06)" : "#f9f9f9";
  const textColor = dark ? "#ffffff" : "#1b1b1d";
  const sepColor = dark ? "rgba(255,255,255,0.2)" : "#c6c6cd";

  return (
    <View style={otp.row}>
      {slots.map((char, idx) => (
        <View key={idx} style={otp.cell}>
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
              otp.input,
              {
                color: textColor,
                backgroundColor: char ? (dark ? "rgba(203,167,47,0.08)" : "#ffffff") : bg,
                borderWidth: char ? 1.5 : 1,
                borderColor: char ? "#cba72f" : emptyBorder,
              },
              Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
            ]}
          />
          {idx === 2 && (
            <View style={[otp.sep, { backgroundColor: sepColor }]} />
          )}
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
  const { width: winW, height: winH } = useWindowDimensions();
  const isWide = useIsWide();

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
        console.warn("[auth] verify-otp failed", e?.response?.data ?? e?.message);
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

  const resendRow = (light: boolean) => (
    <View style={light ? web.resendRow : mob.resendRow}>
      <Text style={light ? web.resendLabel : mob.resendLabel}>
        Didn't receive the code?
      </Text>
      {seconds > 0 ? (
        <Text style={light ? web.resendTimer : mob.resendTimer}>
          {" "}Resend in 00:{seconds.toString().padStart(2, "0")}
        </Text>
      ) : (
        <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
          <Text style={light ? web.resendLink : mob.resendLink}>
            {resending ? "Resending…" : " Resend Code"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const devBannerNode = (light: boolean) =>
    params.devOtp ? (
      <View style={light ? web.devBanner : mob.devBanner}>
        <Text style={light ? web.devTitle : mob.devTitle}>Dev mode</Text>
        <Text style={light ? web.devBody : mob.devBody}>
          OTP{" "}
          <Text style={light ? web.devOtp : mob.devOtp}>{params.devOtp}</Text>{" "}
          autofilled above.
        </Text>
      </View>
    ) : null;

  // ── Web: full-viewport overlay ────────────────────────────────────────────
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

        <BokehCircle size={winW * 0.30} left={winW * 0.9}  top={winH * 0.15} color="rgba(203,167,47,0.2)"  delay={200}  />
        <BokehCircle size={winW * 0.24} left={winW * 0.1}  top={winH * 0.6}  color="rgba(203,167,47,0.15)" delay={900}  />
        <BokehCircle size={winW * 0.18} left={winW * 0.5}  top={winH * 0.06} color="rgba(30,58,110,0.45)"  delay={400}  />
        <BokehCircle size={winW * 0.26} left={winW * 0.72} top={winH * 0.78} color="rgba(19,27,46,0.85)"   delay={700}  />
        <BokehCircle size={winW * 0.16} left={winW * 0.25} top={winH * 0.88} color="rgba(203,167,47,0.13)" delay={1100} />

        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={web.centered}>
          {/* Back */}
          <Reanimated.View entering={FadeIn.delay(50).duration(600)} style={web.backRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={web.backBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={16} color="rgba(255,255,255,0.6)" />
              <Text style={web.backText}>Back</Text>
            </TouchableOpacity>
          </Reanimated.View>

          {/* Brand */}
          <Reanimated.View entering={FadeIn.delay(100).duration(900)} style={web.brand}>
            <View style={web.iconRing}>
              <ShieldCheck size={30} color="#cba72f" strokeWidth={1.5} />
            </View>
            <Text style={web.heroTitle}>{"Check your\nphone"}</Text>
            <Text style={web.heroSub}>
              We sent a 6-digit code to{" "}
              <Text style={web.heroPhone}>{masked}</Text>
            </Text>
          </Reanimated.View>

          {/* Form card */}
          <Reanimated.View entering={FadeInUp.delay(280).duration(600)} style={web.card}>
            <OTPBoxes value={otp} onChange={setOtp} dark={false} />

            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.85}
              style={[web.cta, loading && web.ctaLoading]}
            >
              <Text style={web.ctaText}>
                {loading ? "Verifying…" : "Verify & Continue"}
              </Text>
            </TouchableOpacity>

            {resendRow(true)}
            {devBannerNode(true)}
          </Reanimated.View>
        </View>
      </View>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────────────────
  return (
    <View style={mob.root}>
      <StatusBar style="light" />

      <BokehCircle size={280} left={winW * 0.9}  top={120}         color="rgba(203,167,47,0.18)" delay={200}  />
      <BokehCircle size={200} left={winW * 0.1}  top={280}         color="rgba(203,167,47,0.14)" delay={1000} />
      <BokehCircle size={160} left={winW * 0.5}  top={winH * 0.15} color="rgba(30,58,110,0.45)"  delay={500}  />
      <BokehCircle size={320} left={winW * 0.85} top={winH * 0.6}  color="rgba(19,27,46,0.85)"   delay={700}  />
      <BokehCircle size={180} left={winW * 0.2}  top={winH * 0.7}  color="rgba(203,167,47,0.15)" delay={300}  />
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={mob.safeArea}>
        <View style={mob.inner}>
          <Reanimated.View entering={FadeIn.delay(50).duration(600)} style={mob.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={mob.backBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
              <Text style={mob.backText}>Back</Text>
            </TouchableOpacity>
          </Reanimated.View>

          <Reanimated.View
            entering={FadeIn.delay(100).duration(900)}
            style={mob.hero}
          >
            <View style={mob.iconRing}>
              <ShieldCheck size={28} color="#cba72f" strokeWidth={1.5} />
            </View>
            <Text style={mob.heroTitle}>Check your{"\n"}phone</Text>
            <Text style={mob.heroSub}>
              We sent a 6-digit code to{"\n"}
              <Text style={mob.heroPhone}>{masked}</Text>
            </Text>
          </Reanimated.View>

          <Reanimated.View
            entering={FadeInUp.delay(280).duration(650)}
            style={mob.card}
          >
            <OTPBoxes value={otp} onChange={setOtp} dark={true} />

            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.85}
              style={[mob.cta, loading && mob.ctaLoading]}
            >
              <Text style={mob.ctaText}>
                {loading ? "Verifying…" : "Verify & Continue"}
              </Text>
            </TouchableOpacity>

            {resendRow(false)}
            {devBannerNode(false)}
          </Reanimated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── OTP row ───────────────────────────────────────────────────────────────────
const otp = StyleSheet.create({
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
    borderRadius: 10,
  },
  sep: {
    width: 12,
    height: 1.5,
    marginHorizontal: 2,
  },
});

// ── Web styles ────────────────────────────────────────────────────────────────
const web = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  backRow: {
    width: "100%",
    maxWidth: 440,
    alignItems: "flex-start",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  brand: {
    alignItems: "center",
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(203,167,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 60,
    fontFamily: Platform.OS === "ios" ? "Noto Serif" : "serif",
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 24,
  },
  heroPhone: {
    color: "#cba72f",
    fontWeight: "600",
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
  cta: {
    height: 52,
    backgroundColor: "#131b2e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLoading: {
    backgroundColor: "#c6c6cd",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },
  resendLabel: { fontSize: 13, color: "#45464d" },
  resendTimer: { fontSize: 13, color: "#45464d" },
  resendLink: { fontSize: 13, color: "#cba72f", fontWeight: "600" },
  devBanner: {
    marginTop: 18,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.3)",
    borderRadius: 10,
    padding: 14,
  },
  devTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#7a5c00",
    textAlign: "center",
    marginBottom: 4,
  },
  devBody: { fontSize: 13, color: "#5a4400", textAlign: "center" },
  devOtp: { fontWeight: "700" },
});

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mob = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b1020" },
  safeArea: { flex: 1 },
  inner: { flex: 1, justifyContent: "space-between" },
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backText: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
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
  heroPhone: { color: "#cba72f", fontWeight: "600" },
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
  ctaLoading: { backgroundColor: "rgba(203,167,47,0.4)", shadowOpacity: 0, elevation: 0 },
  ctaText: { fontSize: 14, fontWeight: "700", color: "#131b2e", letterSpacing: 0.3 },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  resendLabel: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  resendTimer: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  resendLink: { fontSize: 13, color: "#cba72f", fontWeight: "600" },
  devBanner: {
    marginTop: 20,
    backgroundColor: "rgba(203,167,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.25)",
    borderRadius: 10,
    padding: 14,
  },
  devTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#cba72f",
    textAlign: "center",
    marginBottom: 4,
  },
  devBody: { fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" },
  devOtp: { color: "#cba72f", fontWeight: "700" },
});
