import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Alert,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAppTheme } from "@/contexts/ThemeContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { customFetch } from "@workspace/api-client-react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export default function RegisterScreen() {
  const theme = useColors();
  const c = theme.colors;
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(30);
  const headingOpacity = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 500, easing: EASE };
    headingOpacity.value = withTiming(1, { duration: 400, easing: EASE });
    cardOpacity.value = withDelay(120, withTiming(1, cfg));
    cardY.value = withDelay(120, withTiming(0, cfg));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const headingStyle = useAnimatedStyle(() => ({ opacity: headingOpacity.value }));

  async function handleRegister() {
    setError("");
    if (!name.trim()) { setError("Full name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setIsLoading(true);
    try {
      await customFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || undefined, password }),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.data?.error ?? err?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const s = makeStyles(isDark);

  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <View style={[s.goldRule, { backgroundColor: c.accent }]} />
      <KeyboardAwareScrollViewCompat style={s.container} contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

        <Animated.View style={[s.header, headingStyle]}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Feather name="user-plus" size={isSmallScreen ? 22 : 26} color="#060D18" />
            </View>
          </View>
          <Text style={[s.brand, { color: c.accent }]}>PropOS</Text>
          <View style={s.brandRule} />
          <Text style={[s.subtitle, { color: isDark ? "#4E7A9A" : "#4A7A9B" }]}>Create your account</Text>
        </Animated.View>

        <Animated.View style={[s.formCard, { backgroundColor: isDark ? c.card : "#FFFFFF" }, cardStyle]}>
          <Text style={[s.welcome, { color: c.foreground }]}>Join PropOS</Text>
          <Text style={[s.welcomeSub, { color: c.mutedForeground }]}>Fill in your details to get started</Text>

          <Text style={[s.label, { color: focusedField === "name" ? c.accent : c.mutedForeground }]}>Full Name *</Text>
          <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "name" ? c.accent : c.border }]}>
            <Feather name="user" size={16} color={focusedField === "name" ? c.accent : c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="Ahmed Mohamed"
              placeholderTextColor={c.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={[s.label, { color: focusedField === "email" ? c.accent : c.mutedForeground, marginTop: 14 }]}>Email Address *</Text>
          <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "email" ? c.accent : c.border }]}>
            <Feather name="mail" size={16} color={focusedField === "email" ? c.accent : c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="ahmed@company.com"
              placeholderTextColor={c.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={[s.label, { color: focusedField === "phone" ? c.accent : c.mutedForeground, marginTop: 14 }]}>Phone Number</Text>
          <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "phone" ? c.accent : c.border }]}>
            <Feather name="phone" size={16} color={focusedField === "phone" ? c.accent : c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="+20 1XX XXX XXXX"
              placeholderTextColor={c.mutedForeground}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={[s.label, { color: focusedField === "password" ? c.accent : c.mutedForeground, marginTop: 14 }]}>Password *</Text>
          <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "password" ? c.accent : c.border }]}>
            <Feather name="lock" size={16} color={focusedField === "password" ? c.accent : c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="Min. 8 characters"
              placeholderTextColor={c.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={c.mutedForeground} />
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={[s.errorBox, { backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", borderColor: "rgba(239,68,68,0.3)" }]}>
              <Feather name="alert-circle" size={14} color="#ef4444" />
              <Text style={[s.errorText, { color: "#ef4444" }]}>{error}</Text>
            </View>
          )}

          <View style={s.btnWrap}>
            <TouchableOpacity style={[s.registerBtn, isLoading && s.btnDisabled]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? <ActivityIndicator color="#060D18" /> : <Text style={s.registerBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={s.footerLinks}>
          <Text style={[s.footerText, { color: c.mutedForeground }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={[s.link, { color: c.accent }]}> Sign In</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function makeStyles(isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: isSmallScreen ? 16 : 24 },
    goldRule: { position: "absolute", top: 0, left: 0, right: 0, height: 2, opacity: 0.7 },
    header: { alignItems: "center", marginBottom: 28 },
    logoOuter: { width: isSmallScreen ? 64 : 72, height: isSmallScreen ? 64 : 72, borderRadius: 20, backgroundColor: "rgba(201,168,76,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 1, borderColor: "rgba(200,168,75,0.3)" },
    logoInner: { width: isSmallScreen ? 50 : 56, height: isSmallScreen ? 50 : 56, borderRadius: 15, backgroundColor: "#C9A84C", alignItems: "center", justifyContent: "center" },
    brand: { fontSize: isSmallScreen ? 22 : 24, fontWeight: "700" },
    brandRule: { width: 32, height: 1, backgroundColor: "rgba(200,168,75,0.4)", marginVertical: 8 },
    subtitle: { fontSize: isSmallScreen ? 12 : 13 },
    formCard: { borderRadius: 16, padding: isSmallScreen ? 20 : 24, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 24, elevation: 10, borderWidth: 1, borderColor: "rgba(200,168,75,0.12)" },
    welcome: { fontSize: isSmallScreen ? 19 : 21, fontWeight: "700", marginBottom: 4 },
    welcomeSub: { fontSize: 13, marginBottom: 22 },
    label: { fontSize: 11, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
    inputBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, height: 48 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15 },
    eyeBtn: { padding: 4 },
    errorBox: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1 },
    errorText: { fontSize: 13, flex: 1 },
    btnWrap: { marginTop: 22 },
    registerBtn: { backgroundColor: "#C9A84C", borderRadius: 12, height: 50, alignItems: "center", justifyContent: "center", shadowColor: "#C9A84C", shadowOpacity: 0.4, shadowRadius: 12, elevation: 7 },
    btnDisabled: { opacity: 0.65 },
    registerBtnText: { color: "#060D18", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
    footerLinks: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
    footerText: { fontSize: 13 },
    link: { fontSize: 13, fontWeight: "600" },
  });
}
