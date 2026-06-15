import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListUsers } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";

const ROLES = ["all", "ceo", "admin", "director", "team_leader", "sales"];

const ROLE_MAP: Record<string, { color: string; label: string }> = {
  ceo:         { color: "#7C3AED", label: "CEO" },
  admin:       { color: "#DC2626", label: "Admin" },
  director:    { color: "#0891B2", label: "Director" },
  team_leader: { color: "#2563EB", label: "Team Leader" },
  sales:       { color: "#16A34A", label: "Sales" },
};

export default function TeamScreen() {
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading, refetch } = useListUsers({ status: "active" });

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.title ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader
        title="Team"
        subtitle={`${filtered.length} members`}
        onBack={() => router.back()}
      />

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="search" size={16} color={c.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[s.searchInput, { color: c.foreground }]}
            placeholder="Search team..."
            placeholderTextColor={c.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={15} color={c.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {ROLES.map((r) => {
          const active = r === roleFilter;
          const roleData = ROLE_MAP[r];
          const color = roleData?.color ?? c.primary;
          return (
            <TouchableOpacity
              key={r}
              style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => setRoleFilter(r)}
            >
              <Text style={[s.chipTxt, { color: c.mutedForeground }, active && { color: "#FFF" }]}>
                {r === "all" ? "All" : (roleData?.label ?? r)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="users" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No team members found"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const role = ROLE_MAP[item.role] ?? { color: c.primary, label: item.role };
          const initials = item.name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");
          return (
            <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[s.avatar, { backgroundColor: `${role.color}20` }]}>
                <Text style={[s.avatarTxt, { color: role.color }]}>{initials}</Text>
              </View>
              <View style={s.info}>
                <Text style={[s.name, { color: c.foreground }]} numberOfLines={1}>{item.name}</Text>
                {item.title && (
                  <Text style={[s.meta, { color: c.mutedForeground }]} numberOfLines={1}>{item.title}</Text>
                )}
                {item.phone && (
                  <View style={s.row}>
                    <Feather name="phone" size={11} color={c.mutedForeground} />
                    <Text style={[s.meta, { color: c.mutedForeground }]}>{item.phone}</Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <View style={[s.roleBadge, { backgroundColor: `${role.color}18` }]}>
                  <Text style={[s.roleTxt, { color: role.color }]}>{role.label}</Text>
                </View>
                {(item as any).isOnline && (
                  <View style={s.onlineDot} />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:  { flex: 1, backgroundColor: c.background },
    searchWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    searchBox:  { flexDirection: "row", alignItems: "center", borderRadius: 13, borderWidth: 1.5, paddingHorizontal: 14, height: 46 },
    searchInput:{ flex: 1, fontSize: 15 },
    filterRow:  { maxHeight: 52, marginBottom: 4 },
    chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    chipTxt:    { fontSize: 13, fontWeight: "500" },
    list:       { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
    empty:      { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText:  { fontSize: 15 },
    card:       { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    avatar:     { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    avatarTxt:  { fontSize: 16, fontWeight: "700" },
    info:       { flex: 1, gap: 2 },
    name:       { fontSize: 15, fontWeight: "600" },
    meta:       { fontSize: 12 },
    row:        { flexDirection: "row", alignItems: "center", gap: 4 },
    roleBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    roleTxt:    { fontSize: 11, fontWeight: "700" },
    onlineDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  });
}
