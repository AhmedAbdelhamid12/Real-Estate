import React from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useListLeads, useListPlannerTasks } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { NativeTheme } from "@workspace/design-tokens/native";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getStatusColor(status: string, crmStatus: NativeTheme["crmStatus"]): string {
  return (crmStatus as Record<string, { bg: string }>)[status]?.bg ?? "#6B7280";
}

export default function HomeScreen() {
  const theme = useColors();
  const c = theme.colors;
  const cr = theme.crmStatus;
  const { isDark, toggleTheme } = useAppTheme();
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

  const myLeads     = leads.filter((l) => l.primarySalesId === user?.id || ["ceo","admin","director"].includes(user?.role ?? ""));
  const activeLeads = myLeads.filter((l) => !["won","lost"].includes(l.status));
  const wonLeads    = myLeads.filter((l) => l.status === "won");
  const todayTasks  = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  });

  const s = makeStyles(c);

  const kpis = [
    { label: "Active",    value: activeLeads.length, icon: "users" as const,       color: cr.new.bg },
    { label: "Won",       value: wonLeads.length,    icon: "trending-up" as const,  color: cr.won.bg },
    { label: "Due Today", value: todayTasks.length,  icon: "check-square" as const, color: "#8B5CF6" },
    { label: "Total",     value: myLeads.length,     icon: "bar-chart-2" as const,  color: c.accent },
  ];

  return (
    <View style={s.container}>
      <ScreenHeader
        title="TIL Group"
        subtitle="Real Estate Intelligence"
        rightElement={
          <TouchableOpacity
            onPress={toggleTheme}
            style={[s.themeBtn, { backgroundColor: isDark ? "rgba(200,168,75,0.1)" : "rgba(200,168,75,0.15)", borderColor: isDark ? "rgba(200,168,75,0.25)" : "rgba(200,168,75,0.35)" }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name={isDark ? "sun" : "moon"} size={15} color="#c8a84b" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Banner */}
        <View style={s.banner}>
          <View>
            <Text style={s.greetText}>
              {getGreeting()}, {user?.name.split(" ")[0]} 👋
            </Text>
            <Text style={s.dateText}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
        </View>

        {/* KPI Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.kpiRow}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
        >
          {kpis.map((kpi) => (
            <View key={kpi.label} style={s.kpiCard}>
              <View style={[s.kpiIcon, { backgroundColor: `${kpi.color}18` }]}>
                <Feather name={kpi.icon} size={18} color={kpi.color} />
              </View>
              <Text style={s.kpiValue}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <View style={[s.kpiAccent, { backgroundColor: kpi.color }]} />
            </View>
          ))}
        </ScrollView>

        {/* Active Leads */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>My Active Leads</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/leads")} style={s.seeAllBtn}>
              <Text style={s.seeAll}>View all</Text>
              <Feather name="arrow-right" size={13} color={c.accent} />
            </TouchableOpacity>
          </View>

          {leadsLoading ? (
            <>
              <View style={[s.skeleton, { height: 64, marginBottom: 8 }]} />
              <View style={[s.skeleton, { height: 64, marginBottom: 8 }]} />
            </>
          ) : activeLeads.length === 0 ? (
            <View style={s.empty}>
              <Feather name="inbox" size={28} color={c.mutedForeground} />
              <Text style={s.emptyText}>No active leads</Text>
            </View>
          ) : (
            activeLeads.slice(0, 5).map((lead) => {
              const sc = getStatusColor(lead.status, cr);
              const status = (cr as Record<string, { label: string }>)[lead.status];
              return (
                <TouchableOpacity
                  key={lead.id}
                  style={s.leadCard}
                  onPress={() => router.push({ pathname: "/lead/[id]", params: { id: lead.id } })}
                  activeOpacity={0.75}
                >
                  <View style={[s.statusBar, { backgroundColor: sc }]} />
                  <View style={s.leadInfo}>
                    <Text style={s.leadName} numberOfLines={1}>{lead.name}</Text>
                    <Text style={s.leadProject} numberOfLines={1}>{lead.projectName ?? "No project"}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: `${sc}18` }]}>
                    <Text style={[s.badgeText, { color: sc }]}>
                      {status?.label ?? lead.status}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={c.mutedForeground} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Today's Tasks */}
        <View style={[s.section, { marginBottom: 100 }]}>
          <Text style={s.sectionTitle}>Today's Tasks</Text>
          {tasksLoading ? (
            <View style={[s.skeleton, { height: 80 }]} />
          ) : todayTasks.length === 0 ? (
            <View style={s.empty}>
              <Feather name="calendar" size={28} color={c.mutedForeground} />
              <Text style={s.emptyText}>No tasks for today</Text>
            </View>
          ) : (
            todayTasks.slice(0, 5).map((task) => {
              const done = task.status === "done";
              return (
                <View key={task.id} style={s.taskRow}>
                  <View style={[s.taskCheck, done && { backgroundColor: `${c.success}20`, borderColor: c.success }]}>
                    <Feather
                      name={done ? "check" : "clock"}
                      size={13}
                      color={done ? c.success : c.mutedForeground}
                    />
                  </View>
                  <Text style={[s.taskTitle, done && s.taskDone]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {done && (
                    <View style={[s.badge, { backgroundColor: `${c.success}18` }]}>
                      <Text style={[s.badgeText, { color: c.success }]}>Done</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.background },
    scroll:        { flex: 1 },
    content:       { paddingHorizontal: 20, paddingTop: 16 },

    themeBtn: {
      width: 34, height: 34, borderRadius: 10,
      borderWidth: 1, alignItems: "center", justifyContent: "center",
    },

    banner: {
      flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 20,
    },
    greetText:     { fontSize: 22, fontWeight: "700" as const, color: c.foreground },
    dateText:      { fontSize: 13, color: c.mutedForeground, marginTop: 2 },

    kpiRow:        { marginHorizontal: -20, marginBottom: 24 },
    kpiCard:       {
      backgroundColor: c.card, borderRadius: 14,
      padding: 16, width: 118, overflow: "hidden" as const,
      borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    kpiIcon:       { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    kpiValue:      { fontSize: 26, fontWeight: "700" as const, color: c.foreground },
    kpiLabel:      { fontSize: 11, color: c.mutedForeground, marginTop: 2 },
    kpiAccent:     { position: "absolute", right: 0, top: 0, bottom: 0, width: 3, borderTopRightRadius: 14, borderBottomRightRadius: 14 },

    section:       { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle:  { fontSize: 16, fontWeight: "700" as const, color: c.foreground },
    seeAllBtn:     { flexDirection: "row", alignItems: "center", gap: 4 },
    seeAll:        { fontSize: 13, color: c.accent, fontWeight: "600" as const },
    skeleton:      { backgroundColor: c.muted, borderRadius: 12 },
    empty:         { alignItems: "center", paddingVertical: 28, gap: 10 },
    emptyText:     { color: c.mutedForeground, fontSize: 14 },

    leadCard:      {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: c.card, borderRadius: 13, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: c.border,
      overflow: "hidden" as const,
      shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    statusBar:     { width: 4, height: 36, borderRadius: 2 },
    leadInfo:      { flex: 1 },
    leadName:      { fontSize: 14, fontWeight: "600" as const, color: c.foreground },
    leadProject:   { fontSize: 12, color: c.mutedForeground, marginTop: 2 },
    badge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
    badgeText:     { fontSize: 11, fontWeight: "600" as const, textTransform: "capitalize" as const },

    taskRow:       {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: c.card, borderRadius: 12, padding: 14,
      marginBottom: 6, borderWidth: 1, borderColor: c.border,
    },
    taskCheck:     {
      width: 26, height: 26, borderRadius: 8,
      borderWidth: 1.5, borderColor: c.border,
      alignItems: "center", justifyContent: "center",
    },
    taskTitle:     { flex: 1, fontSize: 14, color: c.foreground },
    taskDone:      { textDecorationLine: "line-through" as const, color: c.mutedForeground },
  });
}
