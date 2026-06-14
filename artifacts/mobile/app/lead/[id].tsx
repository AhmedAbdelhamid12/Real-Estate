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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LeadDetailScreen() {
  const theme = useColors();
  const c = theme.colors;
  const cr = theme.crmStatus;
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

  const s = makeStyles(c);

  if (isLoading) return (
    <View style={s.center}><Text style={{ color: c.mutedForeground }}>Loading...</Text></View>
  );

  if (!lead) return (
    <View style={s.center}><Text style={{ color: c.mutedForeground }}>Lead not found</Text></View>
  );

  const sc = (cr as Record<string, { bg: string; muted: string; text: string; label: string }>)[lead.status];
  const statusColor = sc?.bg ?? "#6B7280";
  const statusLabel = sc?.label ?? lead.status;

  return (
    <ScrollView
      style={[s.container, { paddingTop: insets.top || 67 }]}
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 34 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Feather name="arrow-left" size={20} color={c.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{lead.name}</Text>
      </View>

      {/* Lead Info Card */}
      <View style={s.card}>
        <View style={[s.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <View style={[s.dot, { backgroundColor: statusColor }]} />
          <Text style={[s.statusText, { color: sc?.text ?? statusColor }]}>
            {statusLabel}
          </Text>
        </View>

        <Text style={s.leadName}>{lead.name}</Text>
        {lead.projectName      ? <Text style={s.meta}>🏗  {lead.projectName}</Text> : null}
        {lead.primarySalesName ? <Text style={s.meta}>👤  {lead.primarySalesName}</Text> : null}
        {lead.phone            ? <Text style={s.meta}>📞  {lead.phone}</Text> : null}
        {lead.email            ? <Text style={s.meta}>✉️  {lead.email}</Text> : null}
        {lead.source           ? <Text style={s.meta}>🔗  Source: {lead.source}</Text> : null}
        {lead.notes ? (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{lead.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* Status Selector */}
      <Text style={s.sectionTitle}>Update Status</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={s.statusRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      >
        {STATUSES.map((status) => {
          const chip = (cr as Record<string, { bg: string; label: string }>)[status];
          const chipColor = chip?.bg ?? "#6B7280";
          const isActive = lead.status === status;
          return (
            <TouchableOpacity
              key={status}
              style={[s.statusChip, isActive && { backgroundColor: chipColor, borderColor: chipColor }]}
              onPress={() => status !== lead.status && handleStatusChange(status)}
            >
              <Text style={[s.statusChipText, isActive && { color: "#fff" }]}>
                {chip?.label ?? (status.charAt(0).toUpperCase() + status.slice(1))}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Log Activity */}
      <View style={s.actionCard}>
        <Text style={s.sectionTitle}>Log Activity</Text>
        {showNoteInput ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={s.noteField}
              placeholder="Add notes about this call..."
              placeholderTextColor={c.mutedForeground}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => { setShowNoteInput(false); setNote(""); }}
              >
                <Text style={{ color: c.mutedForeground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.logBtn, createActivity.isPending && { opacity: 0.6 }]}
                onPress={handleLogCall}
                disabled={createActivity.isPending}
              >
                <Feather name="phone" size={14} color={c.sidebarActiveFg} />
                <Text style={s.logBtnText}>Log Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.logCallBtn} onPress={() => setShowNoteInput(true)}>
            <Feather name="phone" size={16} color={c.accent} />
            <Text style={[s.logCallText, { color: c.accent }]}>Log a Call</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Activities */}
      {activities.length > 0 && (
        <View>
          <Text style={s.sectionTitle}>Activity History</Text>
          {activities.map((act) => (
            <View key={act.id} style={s.activityItem}>
              <View style={s.actIcon}>
                <Feather name="phone" size={14} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.actType}>{act.type}</Text>
                {act.notes ? <Text style={s.actNotes}>{act.notes}</Text> : null}
                <Text style={s.actTime}>{act.userName} · {timeAgo(act.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.background },
    content:       { paddingHorizontal: 20 },
    center:        { flex: 1, alignItems: "center", justifyContent: "center" },
    backRow:       { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 },
    back:          { padding: 4 },
    headerTitle:   { flex: 1, fontSize: 18, fontWeight: "700" as const, color: c.foreground },

    card:          {
      backgroundColor: c.card, borderRadius: 16, padding: 20,
      borderWidth: 1, borderColor: c.border, marginBottom: 20,
      shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    statusBadge:   {
      flexDirection: "row", alignItems: "center", gap: 6,
      alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 8, marginBottom: 12,
    },
    dot:           { width: 7, height: 7, borderRadius: 4 },
    statusText:    { fontSize: 12, fontWeight: "600" as const },
    leadName:      { fontSize: 20, fontWeight: "700" as const, color: c.foreground, marginBottom: 12 },
    meta:          { fontSize: 14, color: c.mutedForeground, marginBottom: 5 },
    notesBox:      { marginTop: 12, padding: 12, backgroundColor: c.muted, borderRadius: 10 },
    notesLabel:    { fontSize: 12, fontWeight: "600" as const, color: c.mutedForeground, marginBottom: 4 },
    notesText:     { fontSize: 14, color: c.foreground },

    sectionTitle:  { fontSize: 15, fontWeight: "700" as const, color: c.foreground, marginBottom: 10 },
    statusRow:     { marginHorizontal: -20, marginBottom: 20 },
    statusChip:    {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border,
    },
    statusChipText:{ fontSize: 13, fontWeight: "500" as const, color: c.foreground },

    actionCard:    {
      backgroundColor: c.card, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: c.border, marginBottom: 20,
    },
    logCallBtn:    {
      flexDirection: "row", alignItems: "center", gap: 8,
      borderWidth: 1.5, borderColor: c.accent, borderRadius: 10,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    logCallText:   { fontSize: 15, fontWeight: "600" as const },
    noteField:     {
      backgroundColor: c.muted, borderRadius: 10, padding: 12,
      fontSize: 14, color: c.foreground, minHeight: 80,
      textAlignVertical: "top" as const,
    },
    cancelBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    logBtn:        {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: "#C9A84C", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    },
    logBtnText:    { color: c.sidebarActiveFg, fontWeight: "700" as const, fontSize: 14 },

    activityItem:  {
      flexDirection: "row", gap: 10, padding: 12,
      backgroundColor: c.card, borderRadius: 12, marginBottom: 8,
      borderWidth: 1, borderColor: c.border,
    },
    actIcon:       {
      width: 30, height: 30, borderRadius: 9,
      backgroundColor: `${c.accent}18`, alignItems: "center", justifyContent: "center",
    },
    actType:       { fontSize: 13, fontWeight: "600" as const, color: c.foreground, textTransform: "capitalize" as const },
    actNotes:      { fontSize: 13, color: c.mutedForeground, marginTop: 2 },
    actTime:       { fontSize: 11, color: c.mutedForeground, marginTop: 4 },
  });
}
