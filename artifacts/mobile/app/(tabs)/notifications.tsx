import React from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useListNotifications, useMarkNotificationRead,
  useMarkAllNotificationsRead, getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const theme = useColors();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useListNotifications();
  const markRead    = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleMarkRead(id: string) {
    markRead.mutate(
      { notificationId: id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) }
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleMarkAllRead() {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  const s = makeStyles(c, insets.bottom);

  return (
    <View style={[s.container, { paddingTop: insets.top || 12 }]}>
      {/* Mark all CTA */}
      {unreadCount > 0 && (
        <TouchableOpacity style={s.markAllBtn} onPress={handleMarkAllRead} activeOpacity={0.75}>
          <View style={s.markAllInner}>
            <Feather name="check-circle" size={14} color="#0A1E38" />
            <Text style={s.markAllText}>Mark all as read ({unreadCount})</Text>
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 34 + 60 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!notifications.length}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Feather name="bell-off" size={28} color={c.accent} />
            </View>
            <Text style={s.emptyTitle}>{isLoading ? "Loading..." : "All caught up!"}</Text>
            <Text style={s.emptyText}>No notifications at the moment</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, !item.isRead && s.cardUnread]}
            onPress={() => !item.isRead && handleMarkRead(item.id)}
            activeOpacity={0.75}
          >
            <View style={[s.dot, { backgroundColor: item.isRead ? c.border : c.accent }]} />
            <View style={s.cardContent}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.titleEn}</Text>
              {item.bodyEn ? (
                <Text style={s.cardBody} numberOfLines={2}>{item.bodyEn}</Text>
              ) : null}
              <Text style={s.cardTime}>{timeAgo(item.createdAt)}</Text>
            </View>
            {!item.isRead && (
              <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={s.checkBtn}>
                <Feather name="check" size={14} color="#0A1E38" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"], bottomInset: number) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: c.background },

    markAllBtn:  { paddingHorizontal: 20, paddingBottom: 8 },
    markAllInner:{
      flexDirection: "row", alignItems: "center", gap: 7,
      backgroundColor: "#C9A84C", borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 9,
      alignSelf: "flex-start" as const,
    },
    markAllText: { fontSize: 13, fontWeight: "600" as const, color: "#0A1E38" },

    list:        { paddingHorizontal: 20, paddingTop: 4 },

    empty:       { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyIcon:   {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: `${c.accent}18`, alignItems: "center", justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle:  { fontSize: 16, fontWeight: "700" as const, color: c.foreground },
    emptyText:   { color: c.mutedForeground, fontSize: 14 },

    card:        {
      flexDirection: "row", alignItems: "flex-start", gap: 12,
      backgroundColor: c.card, borderRadius: 13, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    cardUnread:  {
      backgroundColor: `${c.accent}08`,
      borderColor: `${c.accent}30`,
    },
    dot:         { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
    cardContent: { flex: 1 },
    cardTitle:   { fontSize: 14, fontWeight: "600" as const, color: c.foreground },
    cardBody:    { fontSize: 13, color: c.mutedForeground, marginTop: 3 },
    cardTime:    { fontSize: 11, color: c.mutedForeground, marginTop: 5 },
    checkBtn:    {
      padding: 7, borderRadius: 9,
      backgroundColor: "#C9A84C",
    },
  });
}
