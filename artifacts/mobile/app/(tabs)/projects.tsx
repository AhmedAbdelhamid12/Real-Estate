import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListProjects } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function ProjectsScreen() {
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading, refetch } = useListProjects();

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader title="Projects" subtitle={`${filtered.length} projects`} noBorder />

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="search" size={16} color={c.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[s.searchInput, { color: c.foreground }]}
            placeholder="Search projects..."
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
            <Feather name="layers" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No projects found"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => router.push({ pathname: "/project/[id]", params: { id: item.id } })}
            activeOpacity={0.75}
          >
            <View style={[s.imgBox, { backgroundColor: `${c.primary}10` }]}>
              {(item as any).imageUrl ? (
                <Image source={{ uri: (item as any).imageUrl }} style={s.img} resizeMode="cover" />
              ) : (
                <Feather name="layers" size={26} color={c.primary} />
              )}
            </View>
            <View style={s.info}>
              <Text style={[s.name, { color: c.foreground }]} numberOfLines={1}>{item.name}</Text>
              {(item as any).location && (
                <Text style={[s.meta, { color: c.mutedForeground }]} numberOfLines={1}>
                  <Feather name="map-pin" size={11} color={c.mutedForeground} /> {(item as any).location}
                </Text>
              )}
              {(item as any).unitCount !== undefined && (
                <Text style={[s.meta, { color: c.mutedForeground }]}>
                  {(item as any).unitCount} units
                </Text>
              )}
            </View>
            <View style={[s.badge, {
              backgroundColor: item.isActive ? `${c.success ?? "#22C55E"}18` : `${c.mutedForeground}18`
            }]}>
              <Text style={[s.badgeTxt, { color: item.isActive ? (c.success ?? "#22C55E") : c.mutedForeground }]}>
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={c.mutedForeground} />
          </TouchableOpacity>
        )}
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
    card:       { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    imgBox:     { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    img:        { width: 52, height: 52 },
    info:       { flex: 1, gap: 3 },
    name:       { fontSize: 15, fontWeight: "600" },
    meta:       { fontSize: 12 },
    badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeTxt:   { fontSize: 11, fontWeight: "600" },
  });
}
