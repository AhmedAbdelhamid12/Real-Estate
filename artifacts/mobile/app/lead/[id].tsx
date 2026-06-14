import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useGetLead, useListLeadActivities, useCreateLeadActivity,
  useUpdateLeadStatus, getGetLeadQueryKey, getListLeadActivitiesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

const STATUSES = ["new", "called", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6", called: "#8b5cf6", qualified: "#10b981",
  proposal: "#f59e0b", negotiation: "#f97316", won: "#22c55e", lost: "#ef4444",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LeadDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useGetLead(id ?? "");
  const { data: activities = [] } = useListLeadActivities(id ?? "");
  const createActivity = useCreateLeadActivity();
  const updateStatus = useUpdateLeadStatus();

  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  function handleLogCall() {
    createActivity.mutate(
      { leadId: id ?? "", data: { type: "call", notes: note || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadActivitiesQueryKey(id ?? "") });
          setNote("");
          setShowNoteInput(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      }
    );
  }

  function handleStatusChange(newStatus: string) {
    updateStatus.mutate(
      { leadId: id ?? "", data: { status: newStatus as typeof STATUSES[number] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id ?? "") });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      }
    );
  }

  const styles = makeStyles(colors);

  if (isLoading) return (
    <View style={styles.center}><Text style={{ color: colors.mutedForeground }}>Loading...</Text></View>
  );

  if (!lead) return (
    <View style={styles.center}><Text style={{ color: colors.mutedForeground }}>Lead not found</Text></View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top || 67 }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 34 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lead.name}</Text>
      </View>

      {/* Lead Info Card */}
      <View style={styles.card}>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[lead.status] ?? colors.muted}20` }]}>
          <View style={[styles.dot, { backgroundColor: STATUS_COLORS[lead.status] ?? colors.muted }]} />
          <Text style={[styles.statusText, { color: STATUS_COLORS[lead.status] ?? colors.mutedForeground }]}>
            {lead.status}
          </Text>
        </View>

        <Text style={styles.leadName}>{lead.name}</Text>
        {lead.projectName ? <Text style={styles.meta}>🏗 {lead.projectName}</Text> : null}
        {lead.primarySalesName ? <Text style={styles.meta}>👤 {lead.primarySalesName}</Text> : null}
        {lead.phone ? <Text style={styles.meta}>📞 {lead.phone}</Text> : null}
        {lead.email ? <Text style={styles.meta}>✉️ {lead.email}</Text> : null}
        {lead.source ? <Text style={styles.meta}>🔗 Source: {lead.source}</Text> : null}
        {lead.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{lead.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* Status Selector */}
      <Text style={styles.sectionTitle}>Update Status</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.statusRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      >
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusChip,
              lead.status === s && { backgroundColor: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] },
            ]}
            onPress={() => s !== lead.status && handleStatusChange(s)}
          >
            <Text style={[styles.statusChipText, lead.status === s && { color: "#fff" }]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Log Activity */}
      <View style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Log Activity</Text>
        {showNoteInput ? (
          <View style={styles.noteInput}>
            <TextInput
              style={styles.noteField}
              placeholder="Add notes about this call..."
              placeholderTextColor={colors.mutedForeground}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowNoteInput(false); setNote(""); }}>
                <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logBtn, createActivity.isPending && { opacity: 0.6 }]}
                onPress={handleLogCall}
                disabled={createActivity.isPending}
              >
                <Feather name="phone" size={14} color="#fff" />
                <Text style={styles.logBtnText}>Log Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.logCallBtn} onPress={() => setShowNoteInput(true)}>
            <Feather name="phone" size={16} color={colors.primary} />
            <Text style={[styles.logCallText, { color: colors.primary }]}>Log a Call</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Activities */}
      {activities.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Activity History</Text>
          {activities.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <Feather name="phone" size={14} color={colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actType}>{act.type}</Text>
                {act.notes ? <Text style={styles.actNotes}>{act.notes}</Text> : null}
                <Text style={styles.actTime}>
                  {act.userName} • {timeAgo(act.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    backRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 },
    back: { padding: 4 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    card: {
      backgroundColor: colors.card, borderRadius: 16, padding: 20,
      borderWidth: 1, borderColor: colors.border, marginBottom: 20,
    },
    statusBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 8, marginBottom: 12,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: "600" as const, textTransform: "capitalize" as const },
    leadName: { fontSize: 20, fontWeight: "bold" as const, color: colors.foreground, marginBottom: 12 },
    meta: { fontSize: 14, color: colors.mutedForeground, marginBottom: 4 },
    notesBox: { marginTop: 12, padding: 12, backgroundColor: colors.muted, borderRadius: 10 },
    notesLabel: { fontSize: 12, fontWeight: "600" as const, color: colors.mutedForeground, marginBottom: 4 },
    notesText: { fontSize: 14, color: colors.foreground },
    sectionTitle: { fontSize: 15, fontWeight: "700" as const, color: colors.foreground, marginBottom: 10 },
    statusRow: { marginHorizontal: -20, marginBottom: 20 },
    statusChip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    statusChipText: { fontSize: 13, fontWeight: "500" as const, color: colors.foreground },
    actionCard: {
      backgroundColor: colors.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: colors.border, marginBottom: 20,
    },
    logCallBtn: {
      flexDirection: "row", alignItems: "center", gap: 8,
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    logCallText: { fontSize: 15, fontWeight: "600" as const },
    noteInput: { gap: 8 },
    noteField: {
      backgroundColor: colors.muted, borderRadius: 10, padding: 12,
      fontSize: 14, color: colors.foreground, minHeight: 80,
      textAlignVertical: "top" as const,
    },
    noteActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    logBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    },
    logBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
    activityItem: {
      flexDirection: "row", gap: 10, padding: 12,
      backgroundColor: colors.card, borderRadius: 10, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    actType: { fontSize: 13, fontWeight: "600" as const, color: colors.foreground, textTransform: "capitalize" as const },
    actNotes: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    actTime: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  });
}
