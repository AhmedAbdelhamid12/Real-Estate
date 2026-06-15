import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListResaleUnits } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";

const TYPE_FILTERS = ["all", "apartment", "villa", "townhouse", "studio", "duplex", "penthouse", "chalet", "commercial"];

export default function ResaleScreen() {
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: units = [], isLoading, refetch } = useListResaleUnits();

  const filtered = units.filter((u) => {
    const matchSearch = (u.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.projectName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || (u as any).unitType === typeFilter;
    return matchSearch && matchType;
  });

  const s = makeStyles(c);

  function formatPrice(price: number) {
    if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `EGP ${(price / 1_000).toFixed(0)}K`;
    return `EGP ${price}`;
  }

  return (
    <View style={s.container}>
      <ScreenHeader
        title="Resale Market"
        subtitle={`${filtered.length} units`}
        onBack={() => router.back()}
      />

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="search" size={16} color={c.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[s.searchInput, { color: c.foreground }]}
            placeholder="Search units..."
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
        horizontal
        data={TYPE_FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const active = item === typeFilter;
          return (
            <TouchableOpacity
              style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, active && { backgroundColor: c.primary, borderColor: c.primary }]}
              onPress={() => setTypeFilter(item)}
            >
              <Text style={[s.chipTxt, { color: c.mutedForeground }, active && { color: "#FFF" }]}>
                {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="home" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No units found"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const photos: string[] = (item as any).photos ?? [];
          const firstPhoto = photos[0];
          return (
            <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[s.imgWrap, { backgroundColor: `${c.primary}10` }]}>
                {firstPhoto ? (
                  <Image source={{ uri: firstPhoto }} style={s.img} resizeMode="cover" />
                ) : (
                  <Feather name="home" size={28} color={c.primary} />
                )}
                {photos.length > 1 && (
                  <View style={s.photoBadge}>
                    <Feather name="image" size={10} color="#FFF" />
                    <Text style={s.photoBadgeTxt}>{photos.length}</Text>
                  </View>
                )}
              </View>
              <View style={s.cardBody}>
                <Text style={[s.title, { color: c.foreground }]} numberOfLines={1}>{item.title}</Text>
                {item.projectName && (
                  <Text style={[s.project, { color: c.mutedForeground }]} numberOfLines={1}>
                    <Feather name="layers" size={11} color={c.mutedForeground} /> {item.projectName}
                  </Text>
                )}
                <View style={s.row}>
                  {(item as any).area && (
                    <View style={s.chip2}>
                      <Feather name="maximize-2" size={10} color={c.mutedForeground} />
                      <Text style={[s.chip2Txt, { color: c.mutedForeground }]}>{(item as any).area}m²</Text>
                    </View>
                  )}
                  {(item as any).bedrooms && (
                    <View style={s.chip2}>
                      <Feather name="home" size={10} color={c.mutedForeground} />
                      <Text style={[s.chip2Txt, { color: c.mutedForeground }]}>{(item as any).bedrooms} bed</Text>
                    </View>
                  )}
                </View>
                {(item as any).price && (
                  <Text style={[s.price, { color: "#c8a84b" }]}>{formatPrice((item as any).price)}</Text>
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
    card:       { flexDirection: "row", gap: 12, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    imgWrap:    { width: 80, height: 80, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    img:        { width: 80, height: 80 },
    photoBadge: { position: "absolute", bottom: 4, right: 4, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 5, paddingVertical: 2 },
    photoBadgeTxt: { color: "#FFF", fontSize: 10, fontWeight: "700" },
    cardBody:   { flex: 1, justifyContent: "space-between" },
    title:      { fontSize: 14, fontWeight: "600" },
    project:    { fontSize: 12, marginTop: 2 },
    row:        { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" },
    chip2:      { flexDirection: "row", alignItems: "center", gap: 4 },
    chip2Txt:   { fontSize: 11 },
    price:      { fontSize: 15, fontWeight: "700", marginTop: 4 },
  });
}
