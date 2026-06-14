import React from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useListNotifications, useMarkNotificationRead,
  useMarkAllNotificationsRead, getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ScreenHeader } from "@/components/ScreenHeader";

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

  const s = makeStyles(c);

  return (
    <View style={s.container}>
      <ScreenHeader
        title="Alerts"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={[s.markAllBtn, { backgroundColor: c.accent }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="check-circle" size={13} color="#060D18" />
              <Text style={s.markAllText}>Mark all</Text>
            </TouchableOpacity>
          ) : null
        }
      />

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
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!notifications.length}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <View style={[s.emptyIcon, { backgroundColor: `${c.accent}18` }]}>
              <Feather name="bell-off" size={28} color={c.accent} />
            </View>
            <Text style={[s.emptyTitle, { color: c.foreground }]}>
              {isLoading ? "Loading..." : "All caught up!"}
            </Text>
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              No notifications at the moment
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.card,
              { backgroundColor: c.card, borderColor: c.border },
              !item.isRead && { backgroundColor: `${c.accent}08`, borderColor: `${c.accent}30` },
            ]}
            onPress={() => !item.isRead && handleMarkRead(item.id)}
            activeOpacity={0.75}
          >
            <View style={[s.dot, { backgroundColor: item.isRead ? c.border : c.accent }]} />
            <View style={s.cardContent}>
              <Text style={[s.cardTitle, { color: c.foreground }]} numberOfLines={1}>
                {item.titleEn}
              </Text>
              {item.bodyEn ? (
                <Text style={[s.cardBody, { color: c.mutedForeground }]} numberOfLines={2}>
                  {item.bodyEn}
                </Text>
              ) : null}
              <Text style={[s.cardTime, { color: c.mutedForeground }]}>
                {timeAgo(item.createdAt)}
              </Text>
            </View>
            {!item.isRead && (
              <TouchableOpacity
                onPress={() => handleMarkRead(item.id)}
                style={[s.checkBtn, { backgroundColor: c.accent }]}
              >
                <Feather name="check" size={14} color="#060D18" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: c.background },

    markAllBtn:  {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    markAllText: { fontSize: 12, fontWeight: "600", color: "#060D18" },

    list:        { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

    empty:       { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyIcon:   { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    emptyTitle:  { fontSize: 16, fontWeight: "700" },
    emptyText:   { fontSize: 14 },

    card:        {
      flexDirection: "row", alignItems: "flex-start", gap: 12,
      borderRadius: 13, padding: 14, marginBottom: 8, borderWidth: 1,
      shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    dot:         { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
    cardContent: { flex: 1 },
    cardTitle:   { fontSize: 14, fontWeight: "600" },
    cardBody:    { fontSize: 13, marginTop: 3 },
    cardTime:    { fontSize: 11, marginTop: 5 },
    checkBtn:    { padding: 7, borderRadius: 9 },
  });
}
