import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAppTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";
import { ScreenHeader } from "@/components/ScreenHeader";

const ROLE_MAP: Record<string, { color: string; label: string }> = {
  ceo:         { color: "#7C3AED", label: "CEO" },
  admin:       { color: "#DC2626", label: "Admin" },
  director:    { color: "#0891B2", label: "Director" },
  team_leader: { color: "#2563EB", label: "Team Leader" },
  sales:       { color: "#16A34A", label: "Sales" },
};

function MenuItem({
  icon, label, subtitle, onPress, destructive = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors: c } = useColors();
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: destructive ? `${c.danger}15` : `${c.primary}10`,
        alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon} size={16} color={destructive ? c.danger : c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: destructive ? c.danger : c.foreground }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: c.mutedForeground, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {!destructive && <Feather name="chevron-right" size={16} color={c.mutedForeground} />}
    </TouchableOpacity>
  );
}

function Divider({ left = 60 }: { left?: number }) {
  const { colors } = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: left }} />;
}

export default function ProfileScreen() {
  const theme = useColors();
  const c = theme.colors;
  const { isDark, toggleTheme } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuthContext();

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

  const role = ROLE_MAP[user.role] ?? { color: c.primary, label: user.role };
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader
        title="Profile"
        subtitle={user.name}
        rightElement={
          <TouchableOpacity
            onPress={toggleTheme}
            style={[s.themeBtn, {
              backgroundColor: isDark ? "rgba(200,168,75,0.1)" : "rgba(200,168,75,0.15)",
              borderColor: isDark ? "rgba(200,168,75,0.25)" : "rgba(200,168,75,0.35)",
            }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name={isDark ? "sun" : "moon"} size={15} color="#c8a84b" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={s.heroCard}>
          <View style={s.avatarRing}>
            <View style={[s.avatar, { backgroundColor: role.color }]}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={s.name}>{user.name}</Text>
          {user.title && <Text style={s.title}>{user.title}</Text>}
          <Text style={s.email}>{user.email}</Text>
          <View style={[s.roleBadge, { backgroundColor: `${role.color}18` }]}>
            <View style={[s.roleIndicator, { backgroundColor: role.color }]} />
            <Text style={[s.roleText, { color: role.color }]}>{role.label}</Text>
          </View>
          <View style={s.statBar}>
            <View style={s.statItem}>
              <Feather name="star" size={14} color="#C9A84C" />
              <Text style={s.statLabel}>TIL Member</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={s.menuSection}>
          <Text style={s.sectionLabel}>ACCOUNT</Text>
          <View style={s.menuCard}>
            <MenuItem
              icon="user"
              label="My Profile"
              subtitle="View and edit personal info"
              onPress={() => {}}
            />
            <Divider />
            <MenuItem
              icon="bell"
              label="Notifications"
              subtitle="Manage your alerts"
              onPress={() => router.push("/(tabs)/notifications")}
            />
          </View>
        </View>

        {/* Performance */}
        <View style={s.menuSection}>
          <Text style={s.sectionLabel}>PERFORMANCE</Text>
          <View style={s.menuCard}>
            <MenuItem
              icon="bar-chart-2"
              label="My Performance"
              subtitle="Sales stats and targets"
              onPress={() => {}}
            />
            <Divider />
            <MenuItem
              icon="calendar"
              label="Daily Planner"
              subtitle="Tasks and schedule"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={s.menuSection}>
          <Text style={s.sectionLabel}>SETTINGS</Text>
          <View style={s.menuCard}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${c.primary}10`, alignItems: "center", justifyContent: "center" }}>
                <Feather name={isDark ? "sun" : "moon"} size={16} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: c.foreground }}>
                  {isDark ? "Light Mode" : "Dark Mode"}
                </Text>
                <Text style={{ fontSize: 12, color: c.mutedForeground, marginTop: 1 }}>
                  Switch theme
                </Text>
              </View>
              <View style={[s.togglePill, { backgroundColor: isDark ? c.accent : c.border }]}>
                <View style={[s.toggleThumb, { transform: [{ translateX: isDark ? 16 : 2 }] }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={[s.menuSection, { marginTop: 4, marginBottom: 100 }]}>
          <View style={s.menuCard}>
            <MenuItem icon="log-out" label="Sign Out" onPress={handleSignOut} destructive />
          </View>
        </View>

        <Text style={s.version}>TIL Real Estate Group CRM · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.background },
    scroll:        { flex: 1 },
    content:       { paddingHorizontal: 20, paddingTop: 16 },

    themeBtn: {
      width: 34, height: 34, borderRadius: 10,
      borderWidth: 1, alignItems: "center", justifyContent: "center",
    },

    heroCard:      {
      alignItems: "center", backgroundColor: c.card,
      borderRadius: 20, padding: 28, marginBottom: 24,
      borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 14, elevation: 5,
    },
    avatarRing:    {
      width: 92, height: 92, borderRadius: 28, marginBottom: 14,
      borderWidth: 2.5, borderColor: "#C9A84C",
      alignItems: "center", justifyContent: "center",
    },
    avatar:        { width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    avatarText:    { fontSize: 30, fontWeight: "700", color: "#FFFFFF" },
    name:          { fontSize: 20, fontWeight: "700", color: c.foreground },
    title:         { fontSize: 13, color: c.mutedForeground, marginTop: 2 },
    email:         { fontSize: 13, color: c.mutedForeground, marginTop: 3 },
    roleBadge:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 12 },
    roleIndicator: { width: 7, height: 7, borderRadius: 4 },
    roleText:      { fontSize: 12, fontWeight: "700" },
    statBar:       { flexDirection: "row", justifyContent: "center", borderTopWidth: 1, borderTopColor: c.border, marginTop: 16, paddingTop: 14, width: "100%" },
    statItem:      { flexDirection: "row", alignItems: "center", gap: 5 },
    statLabel:     { fontSize: 12, color: c.mutedForeground },

    menuSection:   { marginBottom: 16 },
    sectionLabel:  { fontSize: 11, fontWeight: "600", color: c.mutedForeground, marginBottom: 8, letterSpacing: 0.8 },
    menuCard:      { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },

    togglePill:    { width: 36, height: 22, borderRadius: 11, justifyContent: "center" },
    toggleThumb:   { width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },

    version:       { textAlign: "center", color: c.mutedForeground, fontSize: 12, marginTop: 8, marginBottom: 16 },
  });
}
