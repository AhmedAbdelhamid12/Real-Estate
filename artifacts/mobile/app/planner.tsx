import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useListPlannerTasks } from "@workspace/api-client-react";
import { ScreenHeader } from "@/components/ScreenHeader";

const FILTERS = ["all", "todo", "in_progress", "done"];

export default function PlannerScreen() {
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const { data: tasks = [], isLoading, refetch } = useListPlannerTasks();

  const filtered = tasks.filter((t) => filter === "all" || t.status === filter);

  const today = new Date().toDateString();
  const todayTasks = filtered.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today);
  const upcomingTasks = filtered.filter((t) => !t.dueDate || new Date(t.dueDate).toDateString() !== today);

  const s = makeStyles(c);

  const statusColor: Record<string, string> = {
    todo:        c.mutedForeground,
    in_progress: "#F59E0B",
    done:        c.success ?? "#22C55E",
  };

  const statusLabel: Record<string, string> = {
    all: "All",
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };

  function TaskItem({ task }: { task: any }) {
    const done = task.status === "done";
    const sc = statusColor[task.status] ?? c.mutedForeground;
    return (
      <View style={[s.taskCard, { backgroundColor: c.card, borderColor: c.border, opacity: done ? 0.75 : 1 }]}>
        <View style={[s.statusDot, { backgroundColor: sc }]} />
        <View style={s.taskBody}>
          <Text style={[s.taskTitle, { color: c.foreground }, done && s.strikethrough]} numberOfLines={2}>
            {task.title}
          </Text>
          {task.description && (
            <Text style={[s.taskDesc, { color: c.mutedForeground }]} numberOfLines={1}>{task.description}</Text>
          )}
          <View style={s.taskMeta}>
            {task.dueDate && (
              <View style={s.metaChip}>
                <Feather name="clock" size={10} color={c.mutedForeground} />
                <Text style={[s.metaTxt, { color: c.mutedForeground }]}>
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
            )}
            <View style={[s.metaChip, { backgroundColor: `${sc}18` }]}>
              <Text style={[s.metaTxt, { color: sc, fontWeight: "600" }]}>{statusLabel[task.status] ?? task.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScreenHeader
        title="Daily Planner"
        subtitle={`${tasks.length} tasks`}
        onBack={() => router.back()}
      />

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, active && { backgroundColor: c.primary, borderColor: c.primary }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.chipTxt, { color: c.mutedForeground }, active && { color: "#FFF" }]}>{statusLabel[f]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={[
          ...(todayTasks.length > 0 ? [{ type: "header", label: "Today" }, ...todayTasks.map((t) => ({ type: "task", ...t }))] : []),
          ...(upcomingTasks.length > 0 ? [{ type: "header", label: "Upcoming" }, ...upcomingTasks.map((t) => ({ type: "task", ...t }))] : []),
        ]}
        keyExtractor={(item, idx) => (item as any).id ?? `header-${idx}`}
        contentContainerStyle={s.list}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Feather name="check-square" size={36} color={c.mutedForeground} />
            <Text style={[s.emptyText, { color: c.mutedForeground }]}>
              {isLoading ? "Loading..." : "No tasks found"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          if ((item as any).type === "header") {
            return <Text style={[s.groupHeader, { color: c.mutedForeground }]}>{(item as any).label}</Text>;
          }
          return <TaskItem task={item} />;
        }}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background },
    filterRow:    { maxHeight: 52, marginBottom: 4 },
    chip:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    chipTxt:      { fontSize: 13, fontWeight: "500" },
    list:         { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
    empty:        { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText:    { fontSize: 15 },
    groupHeader:  { fontSize: 12, fontWeight: "700", letterSpacing: 0.7, marginBottom: 8, marginTop: 8 },
    taskCard:     { flexDirection: "row", gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    statusDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    taskBody:     { flex: 1 },
    taskTitle:    { fontSize: 15, fontWeight: "600", lineHeight: 20 },
    strikethrough:{ textDecorationLine: "line-through" },
    taskDesc:     { fontSize: 13, marginTop: 3 },
    taskMeta:     { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
    metaChip:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "transparent" },
    metaTxt:      { fontSize: 11 },
  });
}
