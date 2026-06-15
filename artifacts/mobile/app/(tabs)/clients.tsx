import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListClients } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function ClientsScreen() {
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading, refetch } = useListClients();

  const filtered = clients.filter((cl) =>
    cl.name.toLowerCase().includes(search.toLowerCase()) ||
    (cl.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (cl.phone ?? "").includes(search)
  );

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader title="Clients" subtitle={`${filtered.length} clients`} noBorder />

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="search" size={16} color={c.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[s.searchInput, { color: c.foreground }]}
            placeholder="Search clients..."
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="user-check" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No clients found"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const initials = item.name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");
          const colors = ["#7C3AED", "#0891B2", "#16A34A", "#DC2626", "#D97706"];
          const colorIdx = item.name.charCodeAt(0) % colors.length;
          const avatarColor = colors[colorIdx];

          return (
            <TouchableOpacity
              style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => router.push({ pathname: "/client/[id]", params: { id: item.id } })}
              activeOpacity={0.75}
            >
              <View style={[s.avatar, { backgroundColor: `${avatarColor}20` }]}>
                <Text style={[s.avatarTxt, { color: avatarColor }]}>{initials}</Text>
              </View>
              <View style={s.info}>
                <Text style={[s.name, { color: c.foreground }]} numberOfLines={1}>{item.name}</Text>
                {item.email && (
                  <Text style={[s.meta, { color: c.mutedForeground }]} numberOfLines={1}>{item.email}</Text>
                )}
                {item.phone && (
                  <Text style={[s.meta, { color: c.mutedForeground }]}>{item.phone}</Text>
                )}
              </View>
              {(item as any).budget && (
                <View style={[s.badge, { backgroundColor: `${c.accent}18` }]}>
                  <Text style={[s.badgeTxt, { color: c.accent }]}>
                    {((item as any).budget / 1000000).toFixed(1)}M
                  </Text>
                </View>
              )}
              <Feather name="chevron-right" size={16} color={c.mutedForeground} />
            </TouchableOpacity>
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
    list:       { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
    empty:      { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText:  { fontSize: 15 },
    card:       { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    avatar:     { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    avatarTxt:  { fontSize: 15, fontWeight: "700" },
    info:       { flex: 1, gap: 2 },
    name:       { fontSize: 15, fontWeight: "600" },
    meta:       { fontSize: 12 },
    badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeTxt:   { fontSize: 11, fontWeight: "700" },
  });
}
