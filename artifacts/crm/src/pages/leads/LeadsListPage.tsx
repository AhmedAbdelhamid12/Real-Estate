import { useState, useRef } from "react";
import { useListLeads, useCreateLead, useDeleteLead, getListLeadsQueryKey, useListProjects, useListUsers, apiFetch } from "@workspace/api-client-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter, Phone, Mail, Trash2, Eye, Users2, Upload } from "lucide-react";

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

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "يدوي", import: "استيراد", campaign: "حملة",
  referral: "إحالة", website: "موقع إلكتروني", social: "تواصل اجتماعي",
};
const STATUS_LABELS: Record<string, string> = {
  new: "جديد", called: "تم الاتصال", qualified: "مؤهل",
  proposal: "عرض", negotiation: "تفاوض", won: "فاز", lost: "خسر",
};

export function LeadsListPage() {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = currentUser && ["ceo", "admin", "director", "team_leader"].includes(currentUser.role);

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
          toast.success(locale === "ar" ? "تم إنشاء العميل المحتمل بنجاح" : "Lead created successfully");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err) => {
          toast.error(err.message || (locale === "ar" ? "فشل إنشاء العميل المحتمل" : "Failed to create lead"));
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
      toast.success(locale === "ar" ? "تم حذف العميل المحتمل" : "Lead deleted");
    } catch {
      toast.error(locale === "ar" ? "فشل الحذف" : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("leads.title")}</h2>
          <p className="text-muted-foreground">{t("leads.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              {isAr ? "استيراد جماعي" : "Bulk Import"}
            </Button>
          )}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("leads.add")}
              </Button>
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
                  {/* Name */}
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isAr ? "الاسم الكامل *" : "Full Name *"}</FormLabel>
                      <FormControl>
                        <Input placeholder={isAr ? "أحمد محمد" : "John Doe"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "رقم الهاتف *" : "Phone *"}</FormLabel>
                        <FormControl>
                          <Input placeholder="+20 10 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "البريد الإلكتروني" : "Email"}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder={isAr ? "مثال: مصري" : "e.g. Egyptian"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="governorate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "المحافظة" : "Governorate"}</FormLabel>
                        <FormControl>
                          <Input placeholder={isAr ? "مثال: القاهرة" : "e.g. Cairo"} {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder="1,500,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isAr ? "ملاحظات" : "Notes"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isAr ? "أي ملاحظات إضافية عن العميل..." : "Any additional notes about this lead..."}
                          rows={2}
                          className="resize-none"
                          {...field}
                        />
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-card p-3 rounded-xl border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("leads.search")}
            className="ps-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={isAr ? "فلتر بالحالة" : "Filter by status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("leads.all_statuses")}</SelectItem>
              <SelectItem value="new">{isAr ? "جديد" : "New"}</SelectItem>
              <SelectItem value="called">{isAr ? "تم الاتصال" : "Called"}</SelectItem>
              <SelectItem value="qualified">{isAr ? "مؤهل" : "Qualified"}</SelectItem>
              <SelectItem value="proposal">{isAr ? "عرض" : "Proposal"}</SelectItem>
              <SelectItem value="negotiation">{isAr ? "تفاوض" : "Negotiation"}</SelectItem>
              <SelectItem value="won">{isAr ? "فاز" : "Won"}</SelectItem>
              <SelectItem value="lost">{isAr ? "خسر" : "Lost"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {leads.length > 0 && (
          <span className="text-sm text-muted-foreground ms-auto whitespace-nowrap">
            {leads.length} {isAr ? "عميل محتمل" : "leads"}
          </span>
        )}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border shadow-sm">
          <Users2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-muted-foreground">{t("leads.no_leads")}</h3>
          <Button className="mt-5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 me-2" /> {t("leads.add")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {leads.map((lead, i) => (
            <motion.div
              key={lead.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              <Card className="group hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm leading-tight truncate">{lead.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lead.lastActionAt ? format(new Date(lead.lastActionAt), "MMM d, yyyy") : "-"}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} className="shrink-0 text-xs" />
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-2">
                    <SourceBadge source={lead.source} className="text-xs" />
                    {(lead as any).nationality && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {(lead as any).nationality}
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Project + Budget */}
                  <div className="space-y-1">
                    {lead.projectName && (
                      <div className="text-xs bg-muted/70 px-2 py-1 rounded-md text-foreground/80 truncate">
                        🏗️ {lead.projectName}
                      </div>
                    )}
                    {(lead as any).budget && (
                      <div className="text-xs text-muted-foreground">
                        💰 {(lead as any).budget} {isAr ? "ج.م" : "EGP"}
                      </div>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2 mt-auto">
                    {lead.primarySalesId ? (
                      <>
                        <UserAvatar name={lead.primarySalesName || "U"} className="h-6 w-6 text-[10px]" />
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">{lead.primarySalesName}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{isAr ? "غير معين" : "Unassigned"}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 flex-1 text-xs gap-1"
                      onClick={() => setLocation(`/leads/${lead.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isAr ? "عرض" : "View"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 flex-1 text-xs gap-1"
                      onClick={() => setAssignLeadId(lead.id)}
                    >
                      <Users2 className="h-3.5 w-3.5" />
                      {isAr ? "تعيين" : "Assign"}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        disabled={deletingId === lead.id}
                        onClick={() => {
                          if (confirm(isAr ? "هل أنت متأكد من حذف هذا العميل المحتمل؟" : "Delete this lead?")) {
                            handleDelete(lead.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignLeadId && (
        <AssignLeadModal
          leadId={assignLeadId}
          open={!!assignLeadId}
          onOpenChange={(v) => { if (!v) setAssignLeadId(null); }}
        />
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />
    </div>
  );
}
