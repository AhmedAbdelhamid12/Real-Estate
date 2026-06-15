import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Haptics from "expo-haptics";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useListNotifications } from "@workspace/api-client-react";

const ROLE_MAP: Record<string, { color: string; label: string }> = {
  ceo:         { color: "#7C3AED", label: "CEO" },
  admin:       { color: "#DC2626", label: "Admin" },
  director:    { color: "#0891B2", label: "Director" },
  team_leader: { color: "#2563EB", label: "Team Leader" },
  sales:       { color: "#16A34A", label: "Sales" },
};

function SectionItem({
  icon, label, subtitle, onPress, badge, destructive = false, accent = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  accent?: boolean;
}) {
  const { colors: c } = useColors();
  const iconColor = destructive ? c.danger : accent ? "#c8a84b" : c.primary;
  const iconBg = destructive ? `${c.danger}15` : accent ? "rgba(200,168,75,0.12)" : `${c.primary}12`;

  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={17} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: destructive ? c.danger : c.foreground, fontWeight: "500" }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: c.mutedForeground, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={{ backgroundColor: "#EF4444", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
      {!destructive && <Feather name="chevron-right" size={16} color={c.mutedForeground} />}
    </TouchableOpacity>
  );
}

function Divider() {
  const { colors } = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 66 }} />;
}

export default function MoreScreen() {
  const { colors: c } = useColors();
  const { isDark, toggleTheme } = useAppTheme();
  const { language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const { user, signOut } = useAuthContext();

  const { data: notifications = [] } = useListNotifications();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
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
  const initials = user.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader title="More" subtitle="All sections" />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Profile Mini Card */}
        <TouchableOpacity style={s.profileCard} activeOpacity={0.8}>
          <View style={[s.avatar, { backgroundColor: role.color }]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user.name}</Text>
            <Text style={s.profileMeta}>{user.email}</Text>
          </View>
          <View style={[s.rolePill, { backgroundColor: `${role.color}18` }]}>
            <Text style={[s.roleTxt, { color: role.color }]}>{role.label}</Text>
          </View>
        </TouchableOpacity>

        {/* Tools */}
        <Text style={s.sectionLabel}>TOOLS</Text>
        <View style={s.menuCard}>
          <SectionItem icon="calendar" label="Daily Planner" subtitle="Tasks & schedule" onPress={() => router.push("/planner")} />
          <Divider />
          <SectionItem icon="home" label="Resale Market" subtitle="Available units" onPress={() => router.push("/resale")} />
          <Divider />
          <SectionItem icon="users" label="Team" subtitle="Employees & agents" onPress={() => router.push("/team")} />
          <Divider />
          <SectionItem icon="bell" label="Notifications" subtitle="Alerts & updates" onPress={() => router.push("/(tabs)/notifications")} badge={unreadCount} />
        </View>

        {/* Settings */}
        <Text style={s.sectionLabel}>SETTINGS</Text>
        <View style={s.menuCard}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${c.primary}12`, alignItems: "center", justifyContent: "center" }}>
              <Feather name={isDark ? "sun" : "moon"} size={17} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: c.foreground, fontWeight: "500" }}>{isDark ? "Light Mode" : "Dark Mode"}</Text>
              <Text style={{ fontSize: 12, color: c.mutedForeground, marginTop: 1 }}>Switch theme</Text>
            </View>
            <View style={[s.togglePill, { backgroundColor: isDark ? "#c8a84b" : c.border }]}>
              <View style={[s.toggleThumb, { transform: [{ translateX: isDark ? 16 : 2 }] }]} />
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}
            onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await toggleLanguage(); }}
            activeOpacity={0.7}
          >
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${c.primary}12`, alignItems: "center", justifyContent: "center" }}>
              <Feather name="globe" size={17} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: c.foreground, fontWeight: "500" }}>
                {language === "en" ? "العربية" : "English"}
              </Text>
              <Text style={{ fontSize: 12, color: c.mutedForeground, marginTop: 1 }}>
                {language === "en" ? "التبديل إلى العربية" : "Switch to English"}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(201,168,76,0.15)", borderWidth: 1, borderColor: "rgba(201,168,76,0.3)" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#C9A84C" }}>{language === "en" ? "AR" : "EN"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={[s.menuCard, { marginBottom: 100 }]}>
          <SectionItem icon="log-out" label="Sign Out" onPress={handleSignOut} destructive />
        </View>

        <Text style={s.version}>TIL Real Estate Group CRM · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background },
    scroll:       { flex: 1 },
    content:      { paddingHorizontal: 20, paddingTop: 16 },

    profileCard:  { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    avatar:       { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    avatarText:   { fontSize: 18, fontWeight: "700", color: "#FFF" },
    profileInfo:  { flex: 1 },
    profileName:  { fontSize: 16, fontWeight: "700", color: c.foreground },
    profileMeta:  { fontSize: 12, color: c.mutedForeground, marginTop: 2 },
    rolePill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    roleTxt:      { fontSize: 11, fontWeight: "700" },

    sectionLabel: { fontSize: 11, fontWeight: "600", color: c.mutedForeground, marginBottom: 8, letterSpacing: 0.8 },
    menuCard:     { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },

    togglePill:   { width: 36, height: 22, borderRadius: 11, justifyContent: "center" },
    toggleThumb:  { width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFF", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },

    version:      { textAlign: "center", color: c.mutedForeground, fontSize: 12, marginTop: 8, marginBottom: 16 },
  });
}
