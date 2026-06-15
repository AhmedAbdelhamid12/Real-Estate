import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useGetClient, useListLeads } from "@workspace/api-client-react";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useColors();
  const c = theme.colors;
  const router = useRouter();

  const { data: client, isLoading } = useGetClient(id ?? "");
  const { data: allLeads = [] } = useListLeads();
  const clientLeads = allLeads.filter((l) => l.clientId === id);

  const s = makeStyles(c);

  if (isLoading || !client) {
    return (
      <View style={s.container}>
        <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color={c.foreground} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: c.foreground }]}>Client</Text>
        </View>
        <View style={s.loading}>
          <Text style={[s.loadingTxt, { color: c.mutedForeground }]}>{isLoading ? "Loading..." : "Client not found"}</Text>
        </View>
      </View>
    );
  }

  const cl = client as any;
  const initials = client.name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");
  const avatarColor = "#0891B2";

  return (
    <View style={s.container}>
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={c.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: c.foreground }]} numberOfLines={1}>{client.name}</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={[s.heroCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[s.avatar, { backgroundColor: avatarColor }]}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </View>
          <Text style={[s.heroName, { color: c.foreground }]}>{client.name}</Text>
          {cl.nationalId && (
            <Text style={[s.heroMeta, { color: c.mutedForeground }]}>ID: {cl.nationalId}</Text>
          )}
        </View>

        {/* Contact */}
        <Text style={[s.sectionTitle, { color: c.foreground }]}>Contact</Text>
        <View style={[s.section, { backgroundColor: c.card, borderColor: c.border }]}>
          {client.email && (
            <TouchableOpacity
              style={s.contactRow}
              onPress={() => Linking.openURL(`mailto:${client.email}`)}
            >
              <View style={[s.contactIcon, { backgroundColor: `${c.primary}12` }]}>
                <Feather name="mail" size={16} color={c.primary} />
              </View>
              <View style={s.contactBody}>
                <Text style={[s.contactLabel, { color: c.mutedForeground }]}>Email</Text>
                <Text style={[s.contactValue, { color: c.foreground }]}>{client.email}</Text>
              </View>
              <Feather name="external-link" size={14} color={c.mutedForeground} />
            </TouchableOpacity>
          )}
          {client.phone && (
            <>
              {client.email && <View style={[s.divider, { backgroundColor: c.border }]} />}
              <TouchableOpacity
                style={s.contactRow}
                onPress={() => Linking.openURL(`tel:${client.phone}`)}
              >
                <View style={[s.contactIcon, { backgroundColor: `${c.primary}12` }]}>
                  <Feather name="phone" size={16} color={c.primary} />
                </View>
                <View style={s.contactBody}>
                  <Text style={[s.contactLabel, { color: c.mutedForeground }]}>Phone</Text>
                  <Text style={[s.contactValue, { color: c.foreground }]}>{client.phone}</Text>
                </View>
                <Feather name="external-link" size={14} color={c.mutedForeground} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Details */}
        {(cl.budget || cl.preferredArea || cl.notes) && (
          <>
            <Text style={[s.sectionTitle, { color: c.foreground }]}>Details</Text>
            <View style={[s.section, { backgroundColor: c.card, borderColor: c.border }]}>
              {cl.budget && (
                <View style={s.detailRow}>
                  <Feather name="dollar-sign" size={16} color={c.mutedForeground} />
                  <View>
                    <Text style={[s.contactLabel, { color: c.mutedForeground }]}>Budget</Text>
                    <Text style={[s.contactValue, { color: c.foreground }]}>
                      EGP {(cl.budget / 1_000_000).toFixed(1)}M
                    </Text>
                  </View>
                </View>
              )}
              {cl.notes && (
                <Text style={[s.notes, { color: c.mutedForeground }]}>{cl.notes}</Text>
              )}
            </View>
          </>
        )}

        {/* Leads */}
        <Text style={[s.sectionTitle, { color: c.foreground }]}>Leads ({clientLeads.length})</Text>
        <View style={{ marginBottom: 100 }}>
          {clientLeads.length === 0 ? (
            <Text style={[s.noLeads, { color: c.mutedForeground }]}>No leads associated</Text>
          ) : (
            clientLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={[s.leadRow, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => router.push({ pathname: "/lead/[id]", params: { id: lead.id } })}
                activeOpacity={0.75}
              >
                <Text style={[s.leadName, { color: c.foreground }]} numberOfLines={1}>{lead.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[{ fontSize: 12, color: c.mutedForeground }]}>{lead.status}</Text>
                  <Feather name="chevron-right" size={15} color={c.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>["colors"]) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background },
    header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, gap: 12 },
    headerTitle:  { flex: 1, fontSize: 18, fontWeight: "700" },
    loading:      { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingTxt:   { fontSize: 15 },
    scroll:       { flex: 1 },
    content:      { paddingHorizontal: 20, paddingTop: 20 },
    heroCard:     { alignItems: "center", borderRadius: 20, padding: 28, marginBottom: 24, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    avatar:       { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    avatarTxt:    { fontSize: 26, fontWeight: "700", color: "#FFF" },
    heroName:     { fontSize: 20, fontWeight: "700" },
    heroMeta:     { fontSize: 13, marginTop: 4 },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", letterSpacing: 0.7, marginBottom: 8, marginTop: 4 },
    section:      { borderRadius: 14, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
    contactRow:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
    contactIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    contactBody:  { flex: 1 },
    contactLabel: { fontSize: 11, fontWeight: "500" },
    contactValue: { fontSize: 15, fontWeight: "500", marginTop: 1 },
    divider:      { height: 1, marginLeft: 62 },
    detailRow:    { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
    notes:        { fontSize: 14, lineHeight: 21, padding: 14, paddingTop: 0 },
    noLeads:      { fontSize: 14, textAlign: "center", paddingVertical: 20 },
    leadRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1 },
    leadName:     { flex: 1, fontSize: 14, fontWeight: "500" },
  });
}
