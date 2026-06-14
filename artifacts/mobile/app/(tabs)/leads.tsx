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

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6", called: "#8b5cf6", qualified: "#10b981",
  proposal: "#f59e0b", negotiation: "#f97316", won: "#22c55e", lost: "#ef4444",
};

const STATUSES = ["all", "new", "called", "qualified", "proposal", "negotiation", "won", "lost"];

function LeadItem({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity style={styles.leadCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[lead.status] ?? colors.muted }]} />
      <View style={styles.leadContent}>
        <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
        <Text style={styles.leadMeta} numberOfLines={1}>
          {lead.projectName ?? "No project"} • {lead.primarySalesName ?? "Unassigned"}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: `${STATUS_COLORS[lead.status] ?? colors.muted}20` }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLORS[lead.status] ?? colors.mutedForeground }]}>
          {lead.status}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function LeadsScreen() {
  const colors = useColors();
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

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top || 67 }]}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <FlatList
        horizontal
        data={STATUSES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, item === activeStatus && styles.filterChipActive]}
            onPress={() => setActiveStatus(item)}
          >
            <Text style={[styles.filterText, item === activeStatus && styles.filterTextActive]}>
              {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
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
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 34 + 60 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>{isLoading ? "Loading..." : "No leads found"}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchBox: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: 12,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 14, height: 44,
      marginHorizontal: 20, marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.foreground },
    filterRow: { maxHeight: 48, marginBottom: 8 },
    filterChip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "500" as const },
    filterTextActive: { color: colors.primaryForeground },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    leadCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card, borderRadius: 12, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    statusIndicator: { width: 8, height: 8, borderRadius: 4 },
    leadContent: { flex: 1 },
    leadName: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground },
    leadMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontSize: 11, fontWeight: "600" as const, textTransform: "capitalize" as const },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 15 },
  });
}
