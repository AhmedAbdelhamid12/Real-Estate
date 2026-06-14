import React from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useListLeads, useListPlannerTasks } from "@workspace/api-client-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6", called: "#8b5cf6", qualified: "#10b981",
  proposal: "#f59e0b", negotiation: "#f97316", won: "#22c55e", lost: "#ef4444",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthContext();

  const { data: leads = [], isLoading: leadsLoading, refetch: refetchLeads } = useListLeads();
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useListPlannerTasks();

  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchLeads(), refetchTasks()]);
    setRefreshing(false);
  }

  const myLeads = leads.filter((l) => l.primarySalesId === user?.id || ["ceo", "admin", "director"].includes(user?.role ?? ""));
  const activeLeads = myLeads.filter((l) => !["won", "lost"].includes(l.status));
  const wonLeads = myLeads.filter((l) => l.status === "won");
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  });

  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top || 67 }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetText}>{getGreeting()}, {user?.name.split(" ")[0]} 👋</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text>
      </View>

      {/* KPI Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiRow} contentContainerStyle={{ gap: 12 }}>
        {[
          { label: "Active Leads", value: activeLeads.length, icon: "users" as const, color: "#3b82f6" },
          { label: "Won", value: wonLeads.length, icon: "trending-up" as const, color: "#22c55e" },
          { label: "Today's Tasks", value: todayTasks.length, icon: "check-square" as const, color: "#8b5cf6" },
          { label: "Total", value: myLeads.length, icon: "bar-chart-2" as const, color: "#f59e0b" },
        ].map((kpi) => (
          <View key={kpi.label} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
            <Feather name={kpi.icon} size={18} color={kpi.color} />
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Recent Leads */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Active Leads</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/leads")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {leadsLoading ? (
          <View style={styles.skeleton} />
        ) : activeLeads.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={24} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No active leads</Text>
          </View>
        ) : (
          activeLeads.slice(0, 5).map((lead) => (
            <TouchableOpacity
              key={lead.id}
              style={styles.leadCard}
              onPress={() => router.push({ pathname: "/lead/[id]", params: { id: lead.id } })}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[lead.status] ?? colors.muted }]} />
              <View style={styles.leadInfo}>
                <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
                <Text style={styles.leadProject} numberOfLines={1}>{lead.projectName ?? "No project"}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[lead.status] ?? colors.muted}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[lead.status] ?? colors.mutedForeground }]}>
                  {lead.status}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Today's Tasks */}
      <View style={[styles.section, { marginBottom: insets.bottom + 34 + 60 }]}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {tasksLoading ? (
          <View style={styles.skeleton} />
        ) : todayTasks.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={24} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No tasks for today</Text>
          </View>
        ) : (
          todayTasks.slice(0, 5).map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <Feather
                name={task.status === "done" ? "check-circle" : "circle"}
                size={18}
                color={task.status === "done" ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.taskTitle, task.status === "done" && styles.taskDone]} numberOfLines={1}>
                {task.title}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20 },
    greeting: { marginBottom: 20, marginTop: 8 },
    greetText: { fontSize: 22, fontWeight: "bold" as const, color: colors.foreground },
    dateText: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    kpiRow: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 24 },
    kpiCard: {
      backgroundColor: colors.card, borderRadius: 12,
      padding: 16, width: 120, borderLeftWidth: 3,
      shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    kpiValue: { fontSize: 24, fontWeight: "bold" as const, color: colors.foreground, marginTop: 8 },
    kpiLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground },
    seeAll: { fontSize: 13 },
    skeleton: { height: 120, backgroundColor: colors.muted, borderRadius: 12 },
    empty: { alignItems: "center", paddingVertical: 24, gap: 8 },
    emptyText: { color: colors.mutedForeground, fontSize: 14 },
    leadCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card, borderRadius: 12, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    leadInfo: { flex: 1 },
    leadName: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground },
    leadProject: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: "600" as const, textTransform: "capitalize" as const },
    taskRow: {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.card, borderRadius: 10, padding: 12,
      marginBottom: 6, borderWidth: 1, borderColor: colors.border,
    },
    taskTitle: { flex: 1, fontSize: 14, color: colors.foreground },
    taskDone: { textDecorationLine: "line-through" as const, color: colors.mutedForeground },
  });
}
