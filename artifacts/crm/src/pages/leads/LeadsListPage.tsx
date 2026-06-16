import { useState } from "react";
import { useListLeads, useCreateLead, useDeleteLead, getListLeadsQueryKey, useListProjects, apiFetch } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, Phone, Mail, Trash2, Eye, Users2, Upload, Building2, Wallet, Calendar, ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AssignLeadModal } from "@/components/leads/AssignLeadModal";
import { BulkImportModal } from "@/components/leads/BulkImportModal";
import { useI18n } from "@/contexts/i18nContext";
import { useAuth } from "@/contexts/AuthContext";

const createLeadSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(5, "رقم الهاتف مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  source: z.enum(["manual", "import", "campaign", "referral", "website", "social"]),
  status: z.enum(["new", "called", "qualified", "proposal", "negotiation", "won", "lost"]),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  budget: z.string().optional(),
  nationality: z.string().optional(),
  governorate: z.string().optional(),
});

const STATUS_ACCENT: Record<string, { bar: string; glow: string; cardBg: string }> = {
  new:         { bar: "#818cf8", glow: "rgba(99,102,241,0.15)",  cardBg: "rgba(99,102,241,0.04)" },
  called:      { bar: "#fbbf24", glow: "rgba(245,158,11,0.15)", cardBg: "rgba(245,158,11,0.04)" },
  qualified:   { bar: "#38bdf8", glow: "rgba(14,165,233,0.15)", cardBg: "rgba(14,165,233,0.04)" },
  proposal:    { bar: "#fb923c", glow: "rgba(249,115,22,0.15)", cardBg: "rgba(249,115,22,0.04)" },
  negotiation: { bar: "#c084fc", glow: "rgba(168,85,247,0.15)", cardBg: "rgba(168,85,247,0.04)" },
  won:         { bar: "#4ade80", glow: "rgba(34,197,94,0.15)",  cardBg: "rgba(34,197,94,0.04)"  },
  lost:        { bar: "#f87171", glow: "rgba(239,68,68,0.15)",  cardBg: "rgba(239,68,68,0.04)"  },
};

const STATUS_FILTERS = [
  { value: "all",         label: "الكل" },
  { value: "new",         label: "جديد",       color: "#818cf8" },
  { value: "called",      label: "تم الاتصال", color: "#fbbf24" },
  { value: "qualified",   label: "مؤهل",        color: "#38bdf8" },
  { value: "proposal",    label: "عرض",         color: "#fb923c" },
  { value: "negotiation", label: "تفاوض",       color: "#c084fc" },
  { value: "won",         label: "فاز",         color: "#4ade80" },
  { value: "lost",        label: "خسر",         color: "#f87171" },
];

function LeadInitials({ name }: { name: string }) {
  const words = name.trim().split(" ");
  const init = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: `hsl(${hue}, 55%, 28%)`,
      border: `1.5px solid hsl(${hue}, 55%, 38%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: `hsl(${hue}, 80%, 80%)`,
      letterSpacing: "0.02em",
    }}>
      {init}
    </div>
  );
}

export function LeadsListPage() {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isAdmin = currentUser && ["ceo", "admin", "director", "team_leader"].includes(currentUser.role);
  const isAr = locale === "ar";

  const { data: leads = [], isLoading } = useListLeads({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const { data: projects = [] } = useListProjects();
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();

  const form = useForm<z.infer<typeof createLeadSchema>>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "", phone: "", email: "", source: "manual", status: "new",
      projectId: "", notes: "", budget: "", nationality: "", governorate: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createLeadSchema>) => {
    createLead.mutate(
      { data: values as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success(isAr ? "تم إنشاء العميل المحتمل بنجاح" : "Lead created successfully");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err: any) => {
          toast.error(err.message || (isAr ? "فشل إنشاء العميل المحتمل" : "Failed to create lead"));
        },
      }
    );
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      toast.success(isAr ? "تم حذف العميل المحتمل" : "Lead deleted");
    } catch {
      toast.error(isAr ? "فشل الحذف" : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const statusCounts = STATUS_FILTERS.slice(1).reduce((acc, s) => {
    acc[s.value] = (leads as any[]).filter((l) => l.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #0A1E38 0%, #0F2D52 55%, #060F1C 100%)",
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 16px 40px -8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Gold top line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #c8a84b 30%, #e8d070 60%, transparent)" }} />
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -50, right: -20, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,168,75,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: 40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 20, height: 2, background: "#c8a84b", borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#c8a84b", letterSpacing: "0.18em", textTransform: "uppercase" }}>Pipeline</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
              {t("leads.title")}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>{t("leads.subtitle")}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isAdmin && (
              <button
                onClick={() => setIsBulkOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500,
                }}
              >
                <Upload style={{ width: 14, height: 14 }} />
                {isAr ? "استيراد جماعي" : "Bulk Import"}
              </button>
            )}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <button style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                  background: "linear-gradient(135deg, #c8a84b, #e8d070)",
                  border: "none", color: "#0f172a", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(200,168,75,0.35)",
                }}>
                  <Plus style={{ width: 14, height: 14 }} />
                  {t("leads.add")}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isAr ? "إضافة عميل محتمل جديد" : "Add New Lead"}</DialogTitle>
                  <DialogDescription>
                    {isAr ? "أدخل بيانات العميل المحتمل لإضافته لخط المبيعات." : "Create a new lead to track in your pipeline."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "الاسم الكامل *" : "Full Name *"}</FormLabel>
                        <FormControl><Input placeholder={isAr ? "أحمد محمد" : "John Doe"} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "رقم الهاتف *" : "Phone *"}</FormLabel>
                          <FormControl><Input placeholder="+20 10 1234 5678" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "البريد الإلكتروني" : "Email"}</FormLabel>
                          <FormControl><Input type="email" placeholder="example@email.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="source" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "المصدر" : "Source"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="manual">{isAr ? "يدوي" : "Manual"}</SelectItem>
                              <SelectItem value="website">{isAr ? "موقع إلكتروني" : "Website"}</SelectItem>
                              <SelectItem value="referral">{isAr ? "إحالة" : "Referral"}</SelectItem>
                              <SelectItem value="social">{isAr ? "تواصل اجتماعي" : "Social Media"}</SelectItem>
                              <SelectItem value="campaign">{isAr ? "حملة إعلانية" : "Campaign"}</SelectItem>
                              <SelectItem value="import">{isAr ? "استيراد" : "Import"}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "الحالة" : "Status"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="new">{isAr ? "جديد" : "New"}</SelectItem>
                              <SelectItem value="called">{isAr ? "تم الاتصال" : "Called"}</SelectItem>
                              <SelectItem value="qualified">{isAr ? "مؤهل" : "Qualified"}</SelectItem>
                              <SelectItem value="proposal">{isAr ? "عرض" : "Proposal"}</SelectItem>
                              <SelectItem value="negotiation">{isAr ? "تفاوض" : "Negotiation"}</SelectItem>
                              <SelectItem value="won">{isAr ? "فاز" : "Won"}</SelectItem>
                              <SelectItem value="lost">{isAr ? "خسر" : "Lost"}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="nationality" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "الجنسية" : "Nationality"}</FormLabel>
                          <FormControl><Input placeholder={isAr ? "مثال: مصري" : "e.g. Egyptian"} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="governorate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "المحافظة" : "Governorate"}</FormLabel>
                          <FormControl><Input placeholder={isAr ? "مثال: القاهرة" : "e.g. Cairo"} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="projectId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "المشروع" : "Project"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isAr ? "اختر مشروعاً" : "Select project"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="budget" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isAr ? "الميزانية (ج.م)" : "Budget (EGP)"}</FormLabel>
                          <FormControl><Input placeholder="1,500,000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "ملاحظات" : "Notes"}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={isAr ? "أي ملاحظات إضافية عن العميل..." : "Any additional notes..."} rows={2} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                        {isAr ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button type="submit" disabled={createLead.isPending}>
                        {createLead.isPending ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : (isAr ? "إنشاء عميل" : "Create Lead")}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status count chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {STATUS_FILTERS.slice(1).map((s) => (
            <div key={s.value} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 20,
              background: `${s.color}18`,
              border: `1px solid ${s.color}35`,
              fontSize: 11, color: s.color, fontWeight: 600,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              {s.label}
              <span style={{ marginInlineStart: 2, opacity: 0.7 }}>{statusCounts[s.value] ?? 0}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── SEARCH + FILTERS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "12px 16px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14, color: "var(--muted-foreground)",
            pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder={t("leads.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              background: "var(--muted)", border: "1px solid var(--border)",
              borderRadius: 8, fontSize: 13, color: "var(--foreground)",
              outline: "none",
            }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                style={{
                  padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  background: active ? (s.color ? `${s.color}20` : "var(--primary)") : "transparent",
                  border: active
                    ? `1px solid ${s.color ?? "var(--primary)"}50`
                    : "1px solid var(--border)",
                  color: active ? (s.color ?? "var(--primary)") : "var(--muted-foreground)",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {leads.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginInlineStart: "auto", whiteSpace: "nowrap" }}>
            {leads.length} {isAr ? "عميل" : "leads"}
          </span>
        )}
      </motion.div>

      {/* ── CARDS GRID ── */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 200, background: "var(--card)", borderRadius: 16, opacity: 0.5, border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)" }}>
          <Users2 style={{ width: 48, height: 48, color: "var(--muted-foreground)", margin: "0 auto 12px", opacity: 0.3 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--muted-foreground)", margin: "0 0 16px" }}>
            {t("leads.no_leads")}
          </h3>
          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              padding: "9px 20px", borderRadius: 10, cursor: "pointer",
              background: "linear-gradient(135deg, #c8a84b, #e8d070)",
              border: "none", color: "#0f172a", fontSize: 13, fontWeight: 700,
            }}
          >
            <Plus style={{ width: 14, height: 14, display: "inline", marginInlineEnd: 6 }} />
            {t("leads.add")}
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {(leads as any[]).map((lead, i) => {
            const accent = STATUS_ACCENT[lead.status] ?? STATUS_ACCENT.new;
            const isHovered = hoveredId === lead.id;
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHoveredId(lead.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{
                  borderRadius: 16,
                  background: isHovered ? accent.cardBg : "var(--card)",
                  border: `1px solid ${isHovered ? accent.bar + "40" : "var(--border)"}`,
                  overflow: "hidden",
                  boxShadow: isHovered ? `0 8px 28px -4px ${accent.glow}, 0 0 0 1px ${accent.bar}25` : "none",
                  transition: "all 0.2s ease",
                  display: "flex", flexDirection: "column",
                  position: "relative",
                }}>
                  {/* Colored status bar */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${accent.bar}, ${accent.bar}70)`, flexShrink: 0 }} />

                  <div style={{ padding: "14px 14px 0" }}>
                    {/* Top row: avatar + name + status */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <LeadInitials name={lead.name} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lead.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>
                          {lead.lastActionAt ? format(new Date(lead.lastActionAt), "MMM d, yyyy") : "—"}
                        </div>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>

                    {/* Source + nationality */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      <SourceBadge source={lead.source} />
                      {lead.nationality && (
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "var(--muted)", color: "var(--muted-foreground)" }}>
                          {lead.nationality}
                        </span>
                      )}
                    </div>

                    {/* Contact */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone style={{ width: 11, height: 11, color: "var(--muted-foreground)", flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "monospace" }}>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail style={{ width: 11, height: 11, color: "var(--muted-foreground)", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Project + Budget */}
                    {(lead.projectName || lead.budget) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                        {lead.projectName && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.15)" }}>
                            <Building2 style={{ width: 10, height: 10, color: "#c8a84b" }} />
                            <span style={{ fontSize: 11, color: "#c8a84b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{lead.projectName}</span>
                          </div>
                        )}
                        {lead.budget && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Wallet style={{ width: 10, height: 10, color: "var(--muted-foreground)" }} />
                            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{lead.budget} {isAr ? "ج.م" : "EGP"}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assignee */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      {lead.primarySalesId ? (
                        <>
                          <UserAvatar name={lead.primarySalesName || "U"} className="h-5 w-5 text-[9px]" />
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lead.primarySalesName}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic", opacity: 0.6 }}>
                          {isAr ? "غير معين" : "Unassigned"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    borderTop: "1px solid var(--border)",
                    marginTop: "auto",
                  }}>
                    <button
                      onClick={() => setLocation(`/leads/${lead.id}`)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        padding: "9px 0", cursor: "pointer",
                        background: "transparent", border: "none",
                        fontSize: 11, fontWeight: 600,
                        color: isHovered ? accent.bar : "var(--muted-foreground)",
                        transition: "color 0.15s",
                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      <Eye style={{ width: 12, height: 12 }} />
                      {isAr ? "عرض" : "View"}
                    </button>
                    <button
                      onClick={() => setAssigningLead(lead)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        padding: "9px 0", cursor: "pointer",
                        background: "transparent", border: "none",
                        fontSize: 11, fontWeight: 600,
                        color: "var(--muted-foreground)",
                        transition: "color 0.15s",
                        borderRight: isAdmin ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <Users2 style={{ width: 12, height: 12 }} />
                      {isAr ? "تعيين" : "Assign"}
                    </button>
                    {isAdmin && (
                      <button
                        disabled={deletingId === lead.id}
                        onClick={() => {
                          if (confirm(isAr ? "هل أنت متأكد من حذف هذا العميل المحتمل؟" : "Delete this lead?")) {
                            handleDelete(lead.id);
                          }
                        }}
                        style={{
                          width: 36, display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "9px 0", cursor: "pointer",
                          background: "transparent", border: "none",
                          color: "#f87171", opacity: deletingId === lead.id ? 0.4 : 1,
                          transition: "background 0.15s",
                        }}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {assigningLead && (
        <AssignLeadModal
          lead={assigningLead}
          open={!!assigningLead}
          onOpenChange={(v) => { if (!v) setAssigningLead(null); }}
        />
      )}
      <BulkImportModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />
    </div>
  );
}
