import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375;

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

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: c.sidebarBg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Logo */}
        <View style={s.header}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Feather name="home" size={isSmallScreen ? 22 : 26} color={theme.brand.navyDark} />
            </View>
          </View>
          <Text style={s.brand}>TIL Group</Text>
          <Text style={s.subtitle}>Real Estate CRM Platform</Text>
        </View>

        {/* Form Card */}
        <View style={[s.formCard, { backgroundColor: c.card }]}>
          <Text style={[s.welcome, { color: c.foreground }]}>Welcome back</Text>
          <Text style={[s.welcomeSub, { color: c.mutedForeground }]}>
            Sign in to your account
          </Text>

          {/* Email */}
          <Text style={[s.label, { color: c.foreground }]}>Email Address</Text>
          <View
            style={[
              s.inputBox,
              { backgroundColor: c.muted, borderColor: email ? c.accent : c.border },
            ]}
          >
            <Feather name="mail" size={16} color={c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="you@company.com"
              placeholderTextColor={c.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={[s.label, { color: c.foreground, marginTop: 14 }]}>
            Password
          </Text>
          <View
            style={[
              s.inputBox,
              { backgroundColor: c.muted, borderColor: password ? c.accent : c.border },
            ]}
          >
            <Feather name="lock" size={16} color={c.mutedForeground} style={s.inputIcon} />
            <TextInput
              style={[s.input, { color: c.foreground }]}
              placeholder="••••••••"
              placeholderTextColor={c.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={c.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && (
            <View
              style={[
                s.errorBox,
                { backgroundColor: c.dangerMuted, borderColor: `${c.danger}30` },
              ]}
            >
              <Feather name="alert-circle" size={14} color={c.danger} />
              <Text style={[s.errorText, { color: c.danger }]}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[s.loginBtn, isLoading && s.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.brand.navyDark} />
            ) : (
              <Text style={s.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          TIL Real Estate Group © {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: isSmallScreen ? 16 : 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoOuter: {
    width: isSmallScreen ? 64 : 72,
    height: isSmallScreen ? 64 : 72,
    borderRadius: 20,
    backgroundColor: "rgba(201,168,76,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoInner: {
    width: isSmallScreen ? 50 : 56,
    height: isSmallScreen ? 50 : 56,
    borderRadius: 15,
    backgroundColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C9A84C",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: {
    fontSize: isSmallScreen ? 22 : 24,
    fontWeight: "700" as const,
    color: "#C9A84C",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: isSmallScreen ? 12 : 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },

  formCard: {
    borderRadius: 20,
    padding: isSmallScreen ? 20 : 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  welcome: {
    fontSize: isSmallScreen ? 19 : 21,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },

  loginBtn: {
    backgroundColor: "#C9A84C",
    borderRadius: 13,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    shadowColor: "#C9A84C",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 7,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnText: {
    color: "#0A1E38",
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },

  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    marginTop: 28,
  },
});
