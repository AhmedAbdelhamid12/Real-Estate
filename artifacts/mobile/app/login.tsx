import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
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

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top || 67 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Feather name="home" size={32} color={colors.primaryForeground} />
          </View>
          <Text style={styles.brand}>PropOS</Text>
          <Text style={styles.subtitle}>Real Estate CRM</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputBox}>
            <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@company.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputBox}>
            <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={colors.primaryForeground} />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { paddingBottom: insets.bottom + 34 }]}>
          PropOS CRM © 2026
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
    header: { alignItems: "center", marginBottom: 48 },
    logoBox: {
      width: 72, height: 72, borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
      marginBottom: 16,
      shadowColor: colors.primary, shadowOpacity: 0.3,
      shadowRadius: 16, elevation: 8,
    },
    brand: { fontSize: 28, fontWeight: "bold" as const, color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    form: { gap: 4 },
    label: { fontSize: 13, fontWeight: "600" as const, color: colors.foreground, marginBottom: 6 },
    inputBox: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: 12,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 14, height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: colors.foreground },
    eyeBtn: { padding: 4 },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: `${colors.destructive}15`,
      borderRadius: 8, padding: 10, marginTop: 8,
    },
    errorText: { color: colors.destructive, fontSize: 13, flex: 1 },
    loginBtn: {
      backgroundColor: colors.primary, borderRadius: 12,
      height: 52, alignItems: "center", justifyContent: "center",
      marginTop: 24,
      shadowColor: colors.primary, shadowOpacity: 0.3,
      shadowRadius: 12, elevation: 6,
    },
    loginBtnDisabled: { opacity: 0.7 },
    loginBtnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700" as const },
    footer: { textAlign: "center", color: colors.mutedForeground, fontSize: 12, marginTop: 48 },
  });
}
