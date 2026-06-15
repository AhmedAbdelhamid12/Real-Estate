import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAppTheme } from "@/contexts/ThemeContext";
import { customFetch } from "@workspace/api-client-react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const RESEND_COOLDOWN = 60;

function useCountdown() {
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [start]);

  return { seconds, start, canResend: seconds === 0 };
}

export default function VerifyEmailScreen() {
  const theme = useColors();
  const c = theme.colors;
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const { seconds, start: startCountdown, canResend } = useCountdown();

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(30);
  const headingOpacity = useSharedValue(0);

  useEffect(() => {
    headingOpacity.value = withTiming(1, { duration: 400, easing: EASE });
    cardOpacity.value = withDelay(120, withTiming(1, { duration: 500, easing: EASE }));
    cardY.value = withDelay(120, withTiming(0, { duration: 500, easing: EASE }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const headingStyle = useAnimatedStyle(() => ({ opacity: headingOpacity.value }));

  async function handleVerify() {
    setError("");
    if (code.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setIsLoading(true);
    try {
      await customFetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/login");
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.data?.error ?? err?.message ?? "Verification failed. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setIsResending(true);
    try {
      await customFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      startCountdown();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err?.data?.error ?? err?.message ?? "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  }

  const s = makeStyles(isDark);

  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <View style={[s.goldRule, { backgroundColor: c.accent }]} />
      <View style={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

        <Animated.View style={[s.header, headingStyle]}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Feather name="shield" size={isSmallScreen ? 22 : 26} color="#060D18" />
            </View>
          </View>
          <Text style={[s.brand, { color: c.accent }]}>PropOS</Text>
          <View style={s.brandRule} />
          <Text style={[s.subtitle, { color: isDark ? "#4E7A9A" : "#4A7A9B" }]}>Email verification</Text>
        </Animated.View>

        <Animated.View style={[s.formCard, { backgroundColor: isDark ? c.card : "#FFFFFF" }, cardStyle]}>
          <Text style={[s.welcome, { color: c.foreground }]}>Verify your email</Text>
          <Text style={[s.welcomeSub, { color: c.mutedForeground }]}>
            Enter the 6-digit code sent to{email ? "\n" : " your email"}
          </Text>
          {!!email && (
            <Text style={[s.emailText, { color: c.accent }]}>{email}</Text>
          )}

          <Text style={[s.label, { color: focused ? c.accent : c.mutedForeground, marginTop: 20 }]}>Verification Code</Text>
          <View style={[s.codeBox, { backgroundColor: c.muted, borderColor: focused ? c.accent : c.border }]}>
            <TextInput
              style={[s.codeInput, { color: c.foreground }]}
              placeholder="0 0 0 0 0 0"
              placeholderTextColor={c.mutedForeground}
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>

          {!!error && (
            <View style={[s.errorBox, { backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", borderColor: "rgba(239,68,68,0.3)" }]}>
              <Feather name="alert-circle" size={14} color="#ef4444" />
              <Text style={[s.errorText, { color: "#ef4444" }]}>{error}</Text>
            </View>
          )}

          <View style={s.btnWrap}>
            <TouchableOpacity
              style={[s.verifyBtn, { borderColor: code.length === 6 ? c.accent : c.border }, (isLoading || code.length !== 6) && s.btnDisabled]}
              onPress={handleVerify}
              disabled={isLoading || code.length !== 6}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={c.accent} />
                : <Text style={[s.verifyBtnText, { color: code.length === 6 ? c.accent : c.mutedForeground }]}>Verify Email</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={s.resendRow}>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={[s.backText, { color: c.mutedForeground }]}>← Back to Sign In</Text>
            </TouchableOpacity>

            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                {isResending
                  ? <ActivityIndicator size="small" color={c.accent} />
                  : <Text style={[s.resendText, { color: c.accent }]}>Resend code</Text>
                }
              </TouchableOpacity>
            ) : (
              <Text style={[s.countdownText, { color: c.mutedForeground }]}>
                Resend in <Text style={{ color: c.accent }}>{seconds}s</Text>
              </Text>
            )}
          </View>
        </Animated.View>

      </View>
    </View>
  );
}

function makeStyles(isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1, justifyContent: "center", paddingHorizontal: isSmallScreen ? 16 : 24 },
    goldRule: { position: "absolute", top: 0, left: 0, right: 0, height: 2, opacity: 0.7 },
    header: { alignItems: "center", marginBottom: 28 },
    logoOuter: { width: isSmallScreen ? 64 : 72, height: isSmallScreen ? 64 : 72, borderRadius: 20, backgroundColor: "rgba(201,168,76,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 1, borderColor: "rgba(200,168,75,0.3)" },
    logoInner: { width: isSmallScreen ? 50 : 56, height: isSmallScreen ? 50 : 56, borderRadius: 15, backgroundColor: "#C9A84C", alignItems: "center", justifyContent: "center" },
    brand: { fontSize: isSmallScreen ? 22 : 24, fontWeight: "700" },
    brandRule: { width: 32, height: 1, backgroundColor: "rgba(200,168,75,0.4)", marginVertical: 8 },
    subtitle: { fontSize: isSmallScreen ? 12 : 13 },
    formCard: { borderRadius: 16, padding: isSmallScreen ? 20 : 24, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 24, elevation: 10, borderWidth: 1, borderColor: "rgba(200,168,75,0.12)" },
    welcome: { fontSize: isSmallScreen ? 19 : 21, fontWeight: "700", marginBottom: 4 },
    welcomeSub: { fontSize: 13, lineHeight: 20 },
    emailText: { fontSize: 14, fontWeight: "600", marginBottom: 4, marginTop: 2 },
    label: { fontSize: 11, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 },
    codeBox: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 16, height: 64, alignItems: "center", justifyContent: "center" },
    codeInput: { fontSize: 32, fontWeight: "700", letterSpacing: 12, textAlign: "center", width: "100%" },
    errorBox: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1 },
    errorText: { fontSize: 13, flex: 1 },
    btnWrap: { marginTop: 20 },
    verifyBtn: { borderRadius: 12, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1, backgroundColor: "transparent" },
    btnDisabled: { opacity: 0.5 },
    verifyBtnText: { fontSize: 13, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
    resendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 },
    backText: { fontSize: 13 },
    resendText: { fontSize: 13, fontWeight: "600" },
    countdownText: { fontSize: 12 },
  });
}
