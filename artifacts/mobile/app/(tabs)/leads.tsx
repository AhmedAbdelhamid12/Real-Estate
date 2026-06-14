import React, { useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListLeads } from "@workspace/api-client-react";
import type { Lead } from "@workspace/api-client-react";

const STATUSES = ["all", "new", "called", "qualified", "proposal", "negotiation", "won", "lost"];

function LeadItem({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const theme = useColors();
  const c = theme.colors;
  const cr = theme.crmStatus;

  const sc = (cr as Record<string, { bg: string; muted: string; text: string; label: string }>)[lead.status];
  const color = sc?.bg ?? "#6B7280";
  const muted = sc?.muted ?? `${color}18`;
  const label = sc?.label ?? lead.status;

  const initials = lead.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const s = StyleSheet.create({
    card:     {
      flexDirection: "row" as const, alignItems: "center" as const, gap: 12,
      backgroundColor: c.card, borderRadius: 13, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    avatar:   {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: `${color}20`, alignItems: "center" as const, justifyContent: "center" as const,
    },
    avatarTxt:{ fontSize: 14, fontWeight: "700" as const, color },
    info:     { flex: 1 },
    name:     { fontSize: 14, fontWeight: "600" as const, color: c.foreground },
    meta:     { fontSize: 12, color: c.mutedForeground, marginTop: 2 },
    badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, backgroundColor: muted },
    badgeTxt: { fontSize: 11, fontWeight: "600" as const, color: sc?.text ?? color },
  });

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.avatar}>
        <Text style={s.avatarTxt}>{initials}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{lead.name}</Text>
        <Text style={s.meta} numberOfLines={1}>
          {lead.projectName ?? "No project"}
          {lead.primarySalesName ? ` · ${lead.primarySalesName}` : ""}
        </Text>
      </View>
      <View style={s.badge}>
        <Text style={s.badgeTxt}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={c.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function LeadsScreen() {
  const theme = useColors();
  const c = theme.colors;
  const cr = theme.crmStatus;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const { data: leads = [], isLoading, refetch } = useListLeads(
    activeStatus !== "all" ? { status: activeStatus } : undefined
  );

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.projectName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const s = makeStyles(c, insets.bottom);

  const statusChip = (status: string) => {
    if (status === "all") return { label: "All", color: c.accent };
    const sc = (cr as Record<string, { bg: string; label: string }>)[status];
    return { label: sc?.label ?? status, color: sc?.bg ?? c.primary };
  };

  return (
    <View style={[s.container, { paddingTop: insets.top || 12 }]}>
      {/* Search */}
      <View style={s.searchBox}>
        <Feather name="search" size={16} color={c.mutedForeground} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search leads..."
          placeholderTextColor={c.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={s.clearBtn}>
            <Feather name="x" size={15} color={c.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <FlatList
        horizontal
        data={STATUSES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const ch = statusChip(item);
          const active = item === activeStatus;
          return (
            <TouchableOpacity
              style={[s.filterChip, active && { backgroundColor: ch.color, borderColor: ch.color }]}
              onPress={() => setActiveStatus(item)}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>
                {ch.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Count row */}
      {!isLoading && (
        <Text style={s.countText}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
          {activeStatus !== "all" ? ` · ${statusChip(activeStatus).label}` : ""}
        </Text>
      )}

      {/* Lead List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeadItem
            lead={item}
            onPress={() => router.push({ pathname: "/lead/[id]", params: { id: item.id } })}
          />
        )}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 34 + 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="inbox" size={36} color={c.mutedForeground} />
            <Text style={s.emptyText}>{isLoading ? "Loading..." : "No leads found"}</Text>
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} style={s.clearSearch}>
                <Text style={{ color: c.accent, fontSize: 14, fontWeight: "600" as const }}>
                  Clear search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"], bottomInset: number) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: c.background },
    searchBox:       {
      flexDirection: "row", alignItems: "center",
      backgroundColor: c.card, borderRadius: 13,
      borderWidth: 1.5, borderColor: c.border,
      paddingHorizontal: 14, height: 46,
      marginHorizontal: 20, marginBottom: 10,
    },
    searchIcon:      { marginRight: 8 },
    searchInput:     { flex: 1, fontSize: 15, color: c.foreground },
    clearBtn:        { padding: 4 },
    filterRow:       { maxHeight: 48, marginBottom: 8 },
    filterChip:      {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border,
    },
    filterText:      { fontSize: 13, color: c.mutedForeground, fontWeight: "500" as const },
    filterTextActive:{ color: "#FFFFFF" },
    countText:       { fontSize: 12, color: c.mutedForeground, marginLeft: 20, marginBottom: 8 },
    list:            { paddingHorizontal: 20, paddingTop: 4 },
    empty:           { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText:       { color: c.mutedForeground, fontSize: 15 },
    clearSearch:     { marginTop: 4 },
  });
}
