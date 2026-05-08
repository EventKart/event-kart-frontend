import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import Reanimated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";

import { updateUser } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import { useIsWide } from "@/hooks/useIsWide";
import type { Role } from "@/types";

// ─── Bokeh circle ────────────────────────────────────────────────────────────

function BokehCircle({
  size,
  left,
  top,
  color,
  delay,
}: {
  size: number;
  left: number;
  top: number;
  color: string;
  delay: number;
}) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  opacity.value = withDelay(
    delay,
    withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2800 }),
        withTiming(0.3, { duration: 2800 }),
      ),
      -1,
      true,
    ),
  );
  scale.value = withDelay(
    delay,
    withRepeat(
      withSequence(
        withTiming(1.18, { duration: 3200 }),
        withTiming(0.82, { duration: 3200 }),
      ),
      -1,
      true,
    ),
  );

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    left,
    top,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Reanimated.View style={style} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function showAlert(title: string, message: string, onConfirm?: () => void) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onConfirm?.();
    return;
  }
  if (onConfirm) {
    Alert.alert(title, message, [{ text: "Continue", onPress: onConfirm }]);
  } else {
    Alert.alert(title, message);
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CreateProfileScreen() {
  const router = useRouter();
  const isWide = useIsWide();
  const { width: winW, height: winH } = useWindowDimensions();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setRoleInStore = useAuthStore((s) => s.setRole);

  const [roleChoice, setRoleChoice] = useState<Role>("USER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  const valid = firstName.trim().length >= 1 && lastName.trim().length >= 1;

  const handleSubmit = async () => {
    if (!valid) {
      showAlert(
        "Almost there",
        "Please enter your first and last name to continue.",
      );
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setRoleInStore(roleChoice);

    const goNext = () => {
      if (roleChoice === "VENDOR") {
        router.replace("/(auth)/vendor-onboard/step-1-type");
      } else {
        router.replace("/(user)/search");
      }
    };

    try {
      const updated = await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      setUser({ ...updated, role: roleChoice });
      goNext();
    } catch {
      setUser({
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || user.email,
        address: address.trim() || user.address,
        role: roleChoice,
      });
      showAlert(
        "Saved locally",
        "Could not sync to the server right now. Your profile has been saved on this device and will sync when the connection is restored.",
        goNext,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Web layout ─────────────────────────────────────────────────────────────

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

        {/* Bokeh */}
        <BokehCircle
          size={winW * 0.28}
          left={winW * 0.05}
          top={winH * 0.1}
          color="rgba(203,167,47,0.2)"
          delay={0}
        />
        <BokehCircle
          size={winW * 0.22}
          left={winW * 0.72}
          top={winH * 0.05}
          color="rgba(80,60,160,0.25)"
          delay={600}
        />
        <BokehCircle
          size={winW * 0.18}
          left={winW * 0.55}
          top={winH * 0.6}
          color="rgba(203,167,47,0.15)"
          delay={1200}
        />
        <BokehCircle
          size={winW * 0.24}
          left={winW * 0.1}
          top={winH * 0.65}
          color="rgba(60,80,200,0.2)"
          delay={400}
        />
        <BokehCircle
          size={winW * 0.16}
          left={winW * 0.82}
          top={winH * 0.45}
          color="rgba(203,167,47,0.18)"
          delay={900}
        />

        <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Scrollable centered column */}
        <ScrollView
          contentContainerStyle={web.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <Reanimated.View
            entering={FadeIn.delay(80).duration(800)}
            style={web.brand}
          >
            <View style={web.goldBar} />
            <Text style={web.brandTitle}>EventKart</Text>
            <Text style={web.brandSub}>Create your profile</Text>
          </Reanimated.View>

          {/* Card */}
          <Reanimated.View
            entering={FadeInUp.delay(260).duration(600)}
            style={web.card}
          >
            {/* Role toggle */}
            <View style={web.roleRow}>
              <Pressable
                onPress={() => setRoleChoice("USER")}
                style={[
                  web.roleTab,
                  roleChoice === "USER" && web.roleTabActive,
                ]}
              >
                <Text
                  style={[
                    web.roleTabText,
                    roleChoice === "USER" && web.roleTabTextActive,
                  ]}
                >
                  I am a Planner
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRoleChoice("VENDOR")}
                style={[
                  web.roleTab,
                  roleChoice === "VENDOR" && web.roleTabActive,
                ]}
              >
                <Text
                  style={[
                    web.roleTabText,
                    roleChoice === "VENDOR" && web.roleTabTextActive,
                  ]}
                >
                  I am a Vendor
                </Text>
              </Pressable>
            </View>

            {/* Name row */}
            <View style={web.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={web.label}>First Name</Text>
                <TextInput
                  style={web.input}
                  placeholder="Sarah"
                  placeholderTextColor="#9ca3af"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  autoFocus
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={web.label}>Last Name</Text>
                <TextInput
                  ref={lastNameRef}
                  style={web.input}
                  placeholder="Jenkins"
                  placeholderTextColor="#9ca3af"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

            {/* Email */}
            <View style={web.fieldGroup}>
              <Text style={web.label}>Email Address (optional)</Text>
              <TextInput
                ref={emailRef}
                style={web.input}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus()}
              />
            </View>

            {/* Address */}
            <View style={web.fieldGroup}>
              <Text style={web.label}>City / Address</Text>
              <TextInput
                ref={addressRef}
                style={web.input}
                placeholder="Bengaluru, Karnataka"
                placeholderTextColor="#9ca3af"
                value={address}
                onChangeText={setAddress}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {/* Vendor hint */}
            {roleChoice === "VENDOR" ? (
              <View style={web.vendorHint}>
                <Text style={web.vendorHintTitle}>Next: Business details</Text>
                <Text style={web.vendorHintBody}>
                  After this step we'll walk you through your vendor profile,
                  services, and documents.
                </Text>
              </View>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!valid || submitting}
              style={[web.cta, (!valid || submitting) && { opacity: 0.45 }]}
              activeOpacity={0.85}
            >
              <Text style={web.ctaText}>
                {submitting
                  ? "Saving…"
                  : roleChoice === "VENDOR"
                    ? "Continue to Vendor Setup"
                    : "Get Started"}
              </Text>
            </TouchableOpacity>
          </Reanimated.View>
        </ScrollView>
      </View>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────

  return (
    <View style={mob.root}>
      <StatusBar style="light" />

      {/* Bokeh */}
      <BokehCircle
        size={260}
        left={-60}
        top={80}
        color="rgba(203,167,47,0.22)"
        delay={0}
      />
      <BokehCircle
        size={200}
        left={220}
        top={160}
        color="rgba(80,60,160,0.28)"
        delay={700}
      />
      <BokehCircle
        size={180}
        left={140}
        top={420}
        color="rgba(203,167,47,0.18)"
        delay={1400}
      />
      <BokehCircle
        size={220}
        left={-40}
        top={560}
        color="rgba(60,80,200,0.22)"
        delay={400}
      />
      <BokehCircle
        size={160}
        left={260}
        top={600}
        color="rgba(203,167,47,0.15)"
        delay={1000}
      />

      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={mob.inner}>
              {/* Header */}
              <Reanimated.View
                entering={FadeIn.delay(80).duration(700)}
                style={mob.header}
              >
                <View style={mob.goldBar} />
                <Text style={mob.title}>Create your{"\n"}profile</Text>
                <Text style={mob.subtitle}>
                  Tell us about yourself to get started on EventKart.
                </Text>
              </Reanimated.View>

              {/* Card */}
              <Reanimated.View
                entering={FadeInUp.delay(240).duration(600)}
                style={mob.card}
              >
                {/* Role toggle */}
                <View style={mob.roleRow}>
                  <Pressable
                    onPress={() => setRoleChoice("USER")}
                    style={[
                      mob.roleTab,
                      roleChoice === "USER" && mob.roleTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        mob.roleTabText,
                        roleChoice === "USER" && mob.roleTabTextActive,
                      ]}
                    >
                      I am a Planner
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setRoleChoice("VENDOR")}
                    style={[
                      mob.roleTab,
                      roleChoice === "VENDOR" && mob.roleTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        mob.roleTabText,
                        roleChoice === "VENDOR" && mob.roleTabTextActive,
                      ]}
                    >
                      I am a Vendor
                    </Text>
                  </Pressable>
                </View>

                {/* Name row */}
                <View style={mob.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={mob.label}>First Name</Text>
                    <TextInput
                      style={mob.input}
                      placeholder="Sarah"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                      autoFocus
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={mob.label}>Last Name</Text>
                    <TextInput
                      ref={lastNameRef}
                      style={mob.input}
                      placeholder="Jenkins"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={mob.fieldGroup}>
                  <Text style={mob.label}>Email (optional)</Text>
                  <TextInput
                    ref={emailRef}
                    style={mob.input}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => addressRef.current?.focus()}
                  />
                </View>

                {/* Address */}
                <View style={mob.fieldGroup}>
                  <Text style={mob.label}>City / Address</Text>
                  <TextInput
                    ref={addressRef}
                    style={mob.input}
                    placeholder="Bengaluru, Karnataka"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={address}
                    onChangeText={setAddress}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>

                {/* Vendor hint */}
                {roleChoice === "VENDOR" ? (
                  <View style={mob.vendorHint}>
                    <Text style={mob.vendorHintTitle}>
                      Next: Business details
                    </Text>
                    <Text style={mob.vendorHintBody}>
                      After this step we'll walk you through your vendor
                      profile, services, and documents.
                    </Text>
                  </View>
                ) : null}

                {/* CTA */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!valid || submitting}
                  style={[mob.cta, (!valid || submitting) && { opacity: 0.45 }]}
                  activeOpacity={0.85}
                >
                  <Text style={mob.ctaText}>
                    {submitting
                      ? "Saving…"
                      : roleChoice === "VENDOR"
                        ? "Continue to Vendor Setup"
                        : "Get Started"}
                  </Text>
                </TouchableOpacity>
              </Reanimated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const mob = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  goldBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cba72f",
    marginBottom: 4,
  },
  title: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 34,
    lineHeight: 42,
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 22,
    marginTop: 4,
  },
  card: {
    backgroundColor: "rgba(11,16,32,0.88)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.25)",
    padding: 20,
    gap: 16,
  },
  roleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  roleTabActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  roleTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
  },
  roleTabTextActive: {
    color: "#ffffff",
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldGroup: {
    gap: 0,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(203,167,47,0.9)",
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#ffffff",
  },
  vendorHint: {
    backgroundColor: "rgba(203,167,47,0.1)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(203,167,47,0.2)",
    gap: 4,
  },
  vendorHintTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#cba72f",
  },
  vendorHintBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(203,167,47,0.8)",
    lineHeight: 19,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#cba72f",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#131b2e",
  },
});

const web = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  brand: {
    alignItems: "center",
    marginBottom: 28,
    gap: 6,
  },
  goldBar: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#cba72f",
    marginBottom: 2,
  },
  brandTitle: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 32,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  brandSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    gap: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  roleRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  roleTabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  roleTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  roleTabTextActive: {
    color: "#131b2e",
  },
  nameRow: {
    flexDirection: "row",
    gap: 14,
  },
  fieldGroup: {
    gap: 0,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#1b1b1d",
  },
  vendorHint: {
    backgroundColor: "#fffbea",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
    gap: 4,
  },
  vendorHintTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#92400e",
  },
  vendorHintBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#78350f",
    lineHeight: 19,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#131b2e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#ffffff",
  },
});
