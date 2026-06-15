import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useAppTheme } from "@/contexts/ThemeContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375;

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export default function LoginScreen() {
  const theme = useColors();
  const c = theme.colors;
  const { isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  // Animation values
  const logoOpacity  = useSharedValue(0);
  const logoY        = useSharedValue(-24);
  const logoScale    = useSharedValue(0.85);
  const headingOpacity = useSharedValue(0);
  const headingY     = useSharedValue(20);
  const cardOpacity  = useSharedValue(0);
  const cardY        = useSharedValue(36);
  const footerOpacity = useSharedValue(0);
  const btnScale     = useSharedValue(1);
  const errorShake   = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 600, easing: EASE };
    logoOpacity.value  = withTiming(1, cfg);
    logoY.value        = withTiming(0, cfg);
    logoScale.value    = withSpring(1, { damping: 14, stiffness: 120 });
    headingOpacity.value = withDelay(120, withTiming(1, cfg));
    headingY.value     = withDelay(120, withTiming(0, cfg));
    cardOpacity.value  = withDelay(220, withTiming(1, { duration: 550, easing: EASE }));
    cardY.value        = withDelay(220, withTiming(0, { duration: 550, easing: EASE }));
    footerOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing: EASE }));
  }, []);

  const logoStyle    = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }, { scale: logoScale.value }],
  }));
  const headingStyle = useAnimatedStyle(() => ({
    opacity: headingOpacity.value,
    transform: [{ translateY: headingY.value }],
  }));
  const cardStyle    = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const footerStyle  = useAnimatedStyle(() => ({ opacity: footerOpacity.value }));
  const btnStyle     = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const shakeStyle   = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(errorShake.value, [0, 0.25, 0.5, 0.75, 1], [0, -8, 8, -5, 0]) }],
  }));

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      triggerShake();
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
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  function triggerShake() {
    errorShake.value = 0;
    errorShake.value = withTiming(1, { duration: 420, easing: Easing.linear });
  }

  function handlePressIn() {
    btnScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }
  function handlePressOut() {
    btnScale.value = withSpring(1, { damping: 14, stiffness: 200 });
  }

  const s = makeStyles(c, focusedField, isDark);

  return (
    <KeyboardAwareScrollViewCompat
      style={[s.container, { backgroundColor: c.sidebarBg }]}
      contentContainerStyle={[
        s.scroll,
        { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
      bottomOffset={24}
    >
      {/* Gold accent line at top */}
      <View style={s.goldRule} />

      {/* Theme toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[s.themeToggle, { top: insets.top + 12 }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name={isDark ? "sun" : "moon"} size={16} color="#c8a84b" />
      </TouchableOpacity>

      {/* Header / Logo */}
      <Animated.View style={[s.header, logoStyle]}>
        <View style={s.logoOuter}>
          <View style={s.logoInner}>
            <Feather name="home" size={isSmallScreen ? 22 : 26} color={c.sidebarActiveFg} />
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[s.headingBlock, headingStyle]}>
        <Text style={s.brand}>TIL Group</Text>
        <View style={s.brandRule} />
        <Text style={s.subtitle}>Real Estate Intelligence Platform</Text>
      </Animated.View>

      {/* Form Card */}
      <Animated.View style={[s.formCard, { backgroundColor: c.card }, cardStyle]}>
        <Text style={[s.welcome, { color: c.foreground }]}>Welcome back</Text>
        <Text style={[s.welcomeSub, { color: c.mutedForeground }]}>
          Sign in to your account
        </Text>

        {/* Email */}
        <Text style={[s.label, { color: focusedField === "email" ? c.accent : c.mutedForeground }]}>
          Email Address
        </Text>
        <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "email" ? c.accent : c.border }]}>
          <Feather name="mail" size={16} color={focusedField === "email" ? c.accent : c.mutedForeground} style={s.inputIcon} />
          <TextInput
            style={[s.input, { color: c.foreground }]}
            placeholder="you@company.com"
            placeholderTextColor={c.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Password */}
        <Text style={[s.label, { color: focusedField === "password" ? c.accent : c.mutedForeground, marginTop: 14 }]}>
          Password
        </Text>
        <View style={[s.inputBox, { backgroundColor: c.muted, borderColor: focusedField === "password" ? c.accent : c.border }]}>
          <Feather name="lock" size={16} color={focusedField === "password" ? c.accent : c.mutedForeground} style={s.inputIcon} />
          <TextInput
            style={[s.input, { color: c.foreground }]}
            placeholder="••••••••"
            placeholderTextColor={c.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={s.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={c.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Error */}
        {!!error && (
          <Animated.View style={[s.errorBox, { backgroundColor: c.dangerMuted, borderColor: `${c.danger}30` }, shakeStyle]}>
            <Feather name="alert-circle" size={14} color={c.danger} />
            <Text style={[s.errorText, { color: c.danger }]}>{error}</Text>
          </Animated.View>
        )}

        {/* Login Button */}
        <Animated.View style={[s.btnWrap, btnStyle]}>
          <TouchableOpacity
            style={[s.loginBtn, isLoading && s.loginBtnDisabled]}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
            activeOpacity={1}
          >
            {isLoading ? (
              <ActivityIndicator color={c.sidebarActiveFg} />
            ) : (
              <Text style={s.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[{ marginTop: 20, alignItems: "center", gap: 12 }, footerStyle]}>
        <TouchableOpacity onPress={() => router.push("/forgot-password")} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
          <Text style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,31,56,0.5)", fontSize: 13 }}>
            Forgot password?
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,31,56,0.45)", fontSize: 13 }}>New to PropOS?  </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={{ color: "#C9A84C", fontSize: 13, fontWeight: "600" }}>Create account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.Text style={[s.footer, footerStyle]}>
        TIL Real Estate Group © {new Date().getFullYear()}
      </Animated.Text>
    </KeyboardAwareScrollViewCompat>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"], _focusedField: string | null, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: isSmallScreen ? 16 : 24,
    },

    goldRule: {
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 2,
      backgroundColor: "#c8a84b",
      opacity: 0.7,
    },

    themeToggle: {
      position: "absolute",
      right: 20,
      zIndex: 20,
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(200,168,75,0.1)" : "rgba(200,168,75,0.15)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(200,168,75,0.25)" : "rgba(200,168,75,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },

    header: { alignItems: "center", marginBottom: 8 },
    headingBlock: { alignItems: "center", marginBottom: 28 },

    logoOuter: {
      width: isSmallScreen ? 64 : 72,
      height: isSmallScreen ? 64 : 72,
      borderRadius: 20,
      backgroundColor: "rgba(201,168,76,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "rgba(200,168,75,0.3)",
    },
    logoInner: {
      width: isSmallScreen ? 50 : 56,
      height: isSmallScreen ? 50 : 56,
      borderRadius: 15,
      backgroundColor: "#C9A84C",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#C9A84C",
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 8,
    },

    brand: {
      fontSize: isSmallScreen ? 22 : 24,
      fontWeight: "700" as const,
      color: "#C9A84C",
      letterSpacing: 0.5,
    },
    brandRule: {
      width: 32, height: 1,
      backgroundColor: "rgba(200,168,75,0.4)",
      marginVertical: 8,
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 13,
      color: isDark ? "#4E7A9A" : "#4A7A9B",
      letterSpacing: 0.3,
    },

    formCard: {
      borderRadius: 16,
      padding: isSmallScreen ? 20 : 24,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 10,
      borderWidth: 1,
      borderColor: "rgba(200,168,75,0.12)",
    },

    welcome: {
      fontSize: isSmallScreen ? 19 : 21,
      fontWeight: "700" as const,
      marginBottom: 4,
    },
    welcomeSub: { fontSize: 13, marginBottom: 22 },

    label: {
      fontSize: 11,
      fontWeight: "600" as const,
      marginBottom: 6,
      textTransform: "uppercase" as const,
      letterSpacing: 0.6,
    },
    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      height: 48,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15 },
    eyeBtn: { padding: 4 },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 10,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
    },
    errorText: { fontSize: 13, flex: 1 },

    btnWrap: { marginTop: 22 },
    loginBtn: {
      backgroundColor: "#C9A84C",
      borderRadius: 12,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#C9A84C",
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 7,
    },
    loginBtnDisabled: { opacity: 0.65 },
    loginBtnText: {
      color: "#060D18",
      fontSize: 15,
      fontWeight: "700" as const,
      letterSpacing: 0.3,
    },

    footer: {
      textAlign: "center",
      color: isDark ? "rgba(255,255,255,0.22)" : "rgba(15,31,56,0.35)",
      fontSize: 12,
      marginTop: 28,
    },
  });
}
