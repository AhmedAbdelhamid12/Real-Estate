import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const theme = useColors();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  const s = styles(c, insets.bottom);

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top || 60 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Feather name="home" size={28} color={theme.brand.navyDark} />
            </View>
          </View>
          <Text style={s.brand}>TIL Group</Text>
          <Text style={s.subtitle}>Real Estate CRM Platform</Text>
        </View>

        {/* Form Card */}
        <View style={s.formCard}>
          <Text style={s.welcome}>Welcome back</Text>
          <Text style={s.welcomeSub}>Sign in to your account</Text>

          <Text style={s.label}>Email Address</Text>
          <View style={[s.inputBox, email ? s.inputBoxFocused : null]}>
            <Feather name="mail" size={16} color={c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="you@company.com"
              placeholderTextColor={c.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[s.label, { marginTop: 16 }]}>Password</Text>
          <View style={[s.inputBox, password ? s.inputBoxFocused : null]}>
            <Feather name="lock" size={16} color={c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={c.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={c.mutedForeground} />
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Feather name="alert-circle" size={14} color={c.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.loginBtn, isLoading && s.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={theme.brand.navyDark} />
              : <Text style={s.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          TIL Real Estate Group © {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function styles(c: ReturnType<typeof useColors>["colors"], bottomInset: number) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.sidebarBg },
    scroll:        { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: bottomInset + 24 },
    header:        { alignItems: "center", marginBottom: 36 },
    logoOuter:     {
      width: 76, height: 76, borderRadius: 22,
      backgroundColor: "rgba(201,168,76,0.18)",
      alignItems: "center", justifyContent: "center",
      marginBottom: 16,
    },
    logoInner:     {
      width: 60, height: 60, borderRadius: 16,
      backgroundColor: "#C9A84C",
      alignItems: "center", justifyContent: "center",
      shadowColor: "#C9A84C", shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
    },
    brand:         { fontSize: 26, fontWeight: "700" as const, color: "#C9A84C", letterSpacing: 0.5 },
    subtitle:      { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 },

    formCard:      {
      backgroundColor: c.card, borderRadius: 20, padding: 24,
      shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 24, elevation: 10,
    },
    welcome:       { fontSize: 22, fontWeight: "700" as const, color: c.foreground, marginBottom: 4 },
    welcomeSub:    { fontSize: 14, color: c.mutedForeground, marginBottom: 24 },

    label:         { fontSize: 13, fontWeight: "600" as const, color: c.foreground, marginBottom: 6 },
    inputBox:      {
      flexDirection: "row", alignItems: "center",
      backgroundColor: c.muted, borderRadius: 12,
      borderWidth: 1.5, borderColor: c.border,
      paddingHorizontal: 14, height: 50,
    },
    inputBoxFocused: { borderColor: c.accent },
    inputIcon:     { marginRight: 10 },
    input:         { flex: 1, fontSize: 15, color: c.foreground },
    eyeBtn:        { padding: 6 },

    errorBox:      {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: c.dangerMuted,
      borderRadius: 10, padding: 12, marginTop: 12,
      borderWidth: 1, borderColor: `${c.danger}30`,
    },
    errorText:     { color: c.danger, fontSize: 13, flex: 1 },

    loginBtn:      {
      backgroundColor: "#C9A84C", borderRadius: 13,
      height: 52, alignItems: "center", justifyContent: "center",
      marginTop: 24,
      shadowColor: "#C9A84C", shadowOpacity: 0.40, shadowRadius: 14, elevation: 7,
    },
    loginBtnDisabled: { opacity: 0.65 },
    loginBtnText:  { color: "#0A1E38", fontSize: 16, fontWeight: "700" as const, letterSpacing: 0.3 },

    footer:        { textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 32 },
  });
}
