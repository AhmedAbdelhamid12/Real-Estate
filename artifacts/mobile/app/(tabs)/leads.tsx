import React, { useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListLeads } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";
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

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.avatarTxt, { color }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>{lead.name}</Text>
        <Text style={[styles.meta, { color: c.mutedForeground }]} numberOfLines={1}>
          {lead.projectName ?? "No project"}
          {lead.primarySalesName ? ` · ${lead.primarySalesName}` : ""}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: muted }]}>
        <Text style={[styles.badgeTxt, { color: sc?.text ?? color }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={c.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:     { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 13, padding: 14, marginBottom: 8, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  avatar:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarTxt:{ fontSize: 14, fontWeight: "700" },
  info:     { flex: 1 },
  name:     { fontSize: 14, fontWeight: "600" },
  meta:     { fontSize: 12, marginTop: 2 },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  badgeTxt: { fontSize: 11, fontWeight: "600" },
});

export default function LeadsScreen() {
  const theme = useColors();
  const c = theme.colors;
  const cr = theme.crmStatus;
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

  const s = makeStyles(c);

  const statusChip = (status: string) => {
    if (status === "all") return { label: "All", color: c.accent };
    const sc = (cr as Record<string, { bg: string; label: string }>)[status];
    return { label: sc?.label ?? status, color: sc?.bg ?? c.primary };
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Leads" subtitle={`${filtered.length} total`} noBorder />

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="search" size={16} color={c.mutedForeground} style={s.searchIcon} />
          <TextInput
            style={[s.searchInput, { color: c.foreground }]}
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
              style={[
                s.filterChip,
                { backgroundColor: c.card, borderColor: c.border },
                active && { backgroundColor: ch.color, borderColor: ch.color },
              ]}
              onPress={() => setActiveStatus(item)}
            >
              <Text style={[s.filterText, { color: c.mutedForeground }, active && s.filterTextActive]}>
                {ch.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

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
        contentContainerStyle={s.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="inbox" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No leads found"}
            </Text>
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={{ color: c.accent, fontSize: 14, fontWeight: "600" }}>
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

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.background },
    searchWrap:       { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    searchBox:        {
      flexDirection: "row", alignItems: "center",
      borderRadius: 13, borderWidth: 1.5,
      paddingHorizontal: 14, height: 46,
    },
    searchIcon:       { marginRight: 8 },
    searchInput:      { flex: 1, fontSize: 15 },
    clearBtn:         { padding: 4 },
    filterRow:        { maxHeight: 48, marginBottom: 4 },
    filterChip:       {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      borderWidth: 1.5,
    },
    filterText:       { fontSize: 13, fontWeight: "500" },
    filterTextActive: { color: "#FFFFFF" },
    list:             { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
    empty:            { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText:        { fontSize: 15 },
  });
}
