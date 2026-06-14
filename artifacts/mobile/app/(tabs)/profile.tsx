import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuthContext } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

const ROLE_COLORS: Record<string, string> = {
  ceo: "#7c3aed", admin: "#dc2626", director: "#0891b2",
  team_leader: "#2563eb", sales: "#16a34a",
};

function MenuItem({ icon, label, onPress, destructive = false }: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Feather name={icon} size={18} color={destructive ? colors.destructive : colors.foreground} />
      <Text style={[styles.menuLabel, destructive && { color: colors.destructive }]}>{label}</Text>
      {!destructive && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const styles = makeStyles(colors);

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  }

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] ?? colors.primary;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top || 67 }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 34 + 60 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Info */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {user.title && <Text style={styles.title}>{user.title}</Text>}
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20` }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {user.role.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="user" label="My Profile" onPress={() => {}} />
          <View style={styles.separator} />
          <MenuItem icon="bell" label="Notifications" onPress={() => router.push("/(tabs)/notifications")} />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>More</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="bar-chart-2" label="My Performance" onPress={() => {}} />
          <View style={styles.separator} />
          <MenuItem icon="calendar" label="Daily Planner" onPress={() => {}} />
        </View>
      </View>

      <View style={[styles.menuSection, { marginTop: 8 }]}>
        <View style={styles.menuCard}>
          <MenuItem icon="log-out" label="Sign Out" onPress={handleSignOut} destructive />
        </View>
      </View>

      <Text style={styles.version}>PropOS CRM v1.0.0</Text>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20 },
    profileCard: {
      alignItems: "center", backgroundColor: colors.card,
      borderRadius: 16, padding: 24, marginBottom: 24,
      borderWidth: 1, borderColor: colors.border,
    },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      alignItems: "center", justifyContent: "center", marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: "bold" as const, color: "#fff" },
    name: { fontSize: 20, fontWeight: "bold" as const, color: colors.foreground },
    title: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    email: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
    roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 12 },
    roleText: { fontSize: 11, fontWeight: "700" as const },
    menuSection: { marginBottom: 16 },
    menuSectionTitle: { fontSize: 12, fontWeight: "600" as const, color: colors.mutedForeground, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 },
    menuCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden" as const },
    menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    menuLabel: { flex: 1, fontSize: 15, color: colors.foreground },
    separator: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
    version: { textAlign: "center", color: colors.mutedForeground, fontSize: 12, marginTop: 24 },
  });
}
