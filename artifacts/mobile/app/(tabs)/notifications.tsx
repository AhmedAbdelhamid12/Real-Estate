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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useListNotifications();
  const markRead = useMarkNotificationRead();
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

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top || 67 }]}>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>
            Mark all read ({unreadCount})
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 34 + 60 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!notifications.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="bell-off" size={32} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>{isLoading ? "Loading..." : "No notifications"}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
            onPress={() => !item.isRead && handleMarkRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.dot,
              { backgroundColor: item.isRead ? "transparent" : colors.primary }
            ]} />
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle} numberOfLines={1}>{item.titleEn}</Text>
              {item.bodyEn ? (
                <Text style={styles.notifBody} numberOfLines={2}>{item.bodyEn}</Text>
              ) : null}
              <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
            </View>
            {!item.isRead && (
              <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.checkBtn}>
                <Feather name="check" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    markAllBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      marginHorizontal: 20, marginBottom: 8, paddingVertical: 8,
    },
    markAllText: { fontSize: 13, fontWeight: "600" as const },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 15 },
    notifCard: {
      flexDirection: "row", alignItems: "flex-start", gap: 12,
      backgroundColor: colors.card, borderRadius: 12, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    notifCardUnread: {
      backgroundColor: `${colors.primary}08`,
      borderColor: `${colors.primary}30`,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
    notifContent: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground },
    notifBody: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    notifTime: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
    checkBtn: {
      padding: 6, borderRadius: 8,
      backgroundColor: `${colors.primary}15`,
    },
  });
}
