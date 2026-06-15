import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useGetProject, useListLeads } from "@workspace/api-client-react";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();

  const { data: project, isLoading } = useGetProject(id ?? "");
  const { data: allLeads = [] } = useListLeads();
  const projectLeads = allLeads.filter((l) => l.projectId === id);

  const s = makeStyles(c);

  if (isLoading) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={22} color={c.foreground} />
          </TouchableOpacity>
        </View>
        <View style={s.loading}>
          <Text style={[s.loadingTxt, { color: c.mutedForeground }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={22} color={c.foreground} />
          </TouchableOpacity>
        </View>
        <View style={s.loading}>
          <Text style={[s.loadingTxt, { color: c.mutedForeground }]}>Project not found</Text>
        </View>
      </View>
    );
  }

  const p = project as any;

  return (
    <View style={s.container}>
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={c.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: c.foreground }]} numberOfLines={1}>{project.name}</Text>
        <View style={[s.statusBadge, { backgroundColor: project.isActive ? `${c.success ?? "#22C55E"}18` : `${c.mutedForeground}18` }]}>
          <Text style={[s.statusTxt, { color: project.isActive ? (c.success ?? "#22C55E") : c.mutedForeground }]}>
            {project.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={[s.coverWrap, { backgroundColor: `${c.primary}10` }]}>
          {p.imageUrl ? (
            <Image source={{ uri: p.imageUrl }} style={s.cover} resizeMode="cover" />
          ) : (
            <Feather name="layers" size={48} color={c.primary} />
          )}
        </View>

        {/* Info Cards */}
        <View style={s.section}>
          {[
            p.location && { icon: "map-pin", label: "Location", value: p.location },
            p.unitCount !== undefined && { icon: "grid", label: "Units", value: `${p.unitCount} units` },
            p.deliveryDate && { icon: "calendar", label: "Delivery", value: new Date(p.deliveryDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) },
            p.startingPrice && { icon: "tag", label: "Starting Price", value: `EGP ${(p.startingPrice / 1_000_000).toFixed(1)}M` },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} style={[s.infoRow, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[s.infoIcon, { backgroundColor: `${c.primary}12` }]}>
                <Feather name={item.icon} size={16} color={c.primary} />
              </View>
              <View>
                <Text style={[s.infoLabel, { color: c.mutedForeground }]}>{item.label}</Text>
                <Text style={[s.infoValue, { color: c.foreground }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Description */}
        {p.description && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: c.foreground }]}>About</Text>
            <Text style={[s.description, { color: c.mutedForeground }]}>{p.description}</Text>
          </View>
        )}

        {/* Leads */}
        <View style={[s.section, { marginBottom: 100 }]}>
          <Text style={[s.sectionTitle, { color: c.foreground }]}>Leads ({projectLeads.length})</Text>
          {projectLeads.slice(0, 5).map((lead) => (
            <TouchableOpacity
              key={lead.id}
              style={[s.leadRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => router.push({ pathname: "/lead/[id]", params: { id: lead.id } })}
              activeOpacity={0.75}
            >
              <Text style={[s.leadName, { color: c.foreground }]} numberOfLines={1}>{lead.name}</Text>
              <View style={s.leadRight}>
                <Text style={[s.leadStatus, { color: c.mutedForeground }]}>{lead.status}</Text>
                <Feather name="chevron-right" size={15} color={c.mutedForeground} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background },
    header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, gap: 12 },
    backBtn:      { padding: 4 },
    headerTitle:  { flex: 1, fontSize: 18, fontWeight: "700" },
    statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusTxt:    { fontSize: 12, fontWeight: "600" },
    scroll:       { flex: 1 },
    content:      { paddingHorizontal: 20, paddingTop: 16 },
    loading:      { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingTxt:   { fontSize: 15 },
    coverWrap:    { height: 200, borderRadius: 16, overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 20 },
    cover:        { width: "100%", height: "100%" },
    section:      { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    infoRow:      { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1 },
    infoIcon:     { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    infoLabel:    { fontSize: 11, fontWeight: "500" },
    infoValue:    { fontSize: 15, fontWeight: "600", marginTop: 1 },
    description:  { fontSize: 14, lineHeight: 22 },
    leadRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1 },
    leadName:     { flex: 1, fontSize: 14, fontWeight: "500" },
    leadRight:    { flexDirection: "row", alignItems: "center", gap: 6 },
    leadStatus:   { fontSize: 12 },
  });
}
