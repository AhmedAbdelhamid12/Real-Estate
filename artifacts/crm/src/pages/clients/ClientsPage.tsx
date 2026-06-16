import { useState } from "react";
import {
  useListClients,
  useCreateClient,
  getListClientsQueryKey,
  useListProjects,
  useListUsers,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Users2,
  TrendingUp,
  DollarSign,
  Filter,
  Home,
  Calendar,
  CreditCard,
  Maximize2,
  Hash,
  Layers,
} from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

const UNIT_TYPES_AR: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  duplex: "دوبلكس",
  penthouse: "بنتهاوس",
  townhouse: "تاون هاوس",
  commercial: "محل تجاري",
};

const PAYMENT_LABELS_AR: Record<string, string> = {
  cash: "كاش",
  installments: "تقسيط",
  mortgage: "رهن عقاري",
};

const clientSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(5, "الهاتف مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  assignedSalesId: z.string().optional().or(z.literal("")),
  dealValue: z.string().optional().or(z.literal("")),
  unitNumber: z.string().optional().or(z.literal("")),
  unitType: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional().or(z.literal("")),
  downPayment: z.string().optional().or(z.literal("")),
  contractDate: z.string().optional().or(z.literal("")),
  numberOfInstallments: z.string().optional().or(z.literal("")),
  installmentAmount: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});
type ClientFormValues = z.infer<typeof clientSchema>;

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-teal-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 shrink-0">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function ClientsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { data: clientsAll = [], isLoading } = useListClients({ search: search || undefined });
  const { data: projects = [] } = useListProjects();
  const { data: users = [] } = useListUsers({ status: "active" });
  const salesUsers = users.filter((u) => u.role === "sales" || u.role === "team_leader");
  const createClient = useCreateClient();

  const sorted = [...clientsAll].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "name_az") return a.name.localeCompare(b.name);
    if (sortBy === "value_high") return (Number(b.dealValue) || 0) - (Number(a.dealValue) || 0);
    return 0;
  });

  const totalDeals = clientsAll.reduce((s, c) => s + (Number(c.dealValue) || 0), 0);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "", phone: "", email: "", projectId: "", assignedSalesId: "",
      dealValue: "", unitNumber: "", unitType: "", area: "", paymentMethod: "",
      downPayment: "", contractDate: "", numberOfInstallments: "", installmentAmount: "", notes: "",
    },
  });

  const watchedPaymentMethod = form.watch("paymentMethod");

  const onSubmit = (data: ClientFormValues) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      projectId: data.projectId || null,
      assignedSalesId: data.assignedSalesId || null,
      dealValue: data.dealValue || null,
      unitNumber: data.unitNumber || null,
      unitType: data.unitType || null,
      area: data.area || null,
      paymentMethod: data.paymentMethod || null,
      downPayment: data.downPayment || null,
      contractDate: data.contractDate || null,
      numberOfInstallments: data.numberOfInstallments ? Number(data.numberOfInstallments) : null,
      installmentAmount: data.installmentAmount || null,
      notes: data.notes || null,
    };

    createClient.mutate(
      { data: payload as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          toast.success("تمت إضافة الصفقة بنجاح");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err) => toast.error(err.message || "فشل إضافة الصفقة"),
      }
    );
  };

  const UNIT_TYPES = [
    { value: "apartment", label: t("clients.unit_type_apartment") },
    { value: "villa", label: t("clients.unit_type_villa") },
    { value: "duplex", label: t("clients.unit_type_duplex") },
    { value: "penthouse", label: t("clients.unit_type_penthouse") },
    { value: "townhouse", label: t("clients.unit_type_townhouse") },
    { value: "commercial", label: t("clients.unit_type_commercial") },
  ];

  const PAYMENT_METHODS = [
    { value: "cash", label: t("clients.payment_cash") },
    { value: "installments", label: t("clients.payment_installments") },
    { value: "mortgage", label: t("clients.payment_mortgage") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("clients.title")}</h2>
          <p className="text-muted-foreground">{t("clients.subtitle")}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(v) => { setIsAddOpen(v); if (!v) form.reset(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("clients.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("clients.add_new")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-2">

                {/* ── بيانات العميل ── */}
                <SectionLabel>{t("clients.client_info")}</SectionLabel>

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.full_name")}</FormLabel>
                    <FormControl><Input placeholder={t("clients.name_placeholder")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.phone")}</FormLabel>
                      <FormControl><Input placeholder="+20 10 ..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.email")}</FormLabel>
                      <FormControl><Input type="email" placeholder="example@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* ── بيانات الصفقة ── */}
                <SectionLabel>{t("clients.deal_info")}</SectionLabel>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.project")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="اختر المشروع" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="assignedSalesId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.assigned_sales")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="اختر المندوب" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salesUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dealValue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.deal_value")}</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contractDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.contract_date")}</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* ── بيانات الوحدة ── */}
                <SectionLabel>{t("clients.unit_info")}</SectionLabel>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="unitNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.unit_number")}</FormLabel>
                      <FormControl><Input placeholder="A-401" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unitType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.unit_type")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="النوع" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIT_TYPES.map((ut) => (
                            <SelectItem key={ut.value} value={ut.value}>{ut.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.area")}</FormLabel>
                      <FormControl><Input type="number" placeholder="120" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* ── بيانات الدفع ── */}
                <SectionLabel>{t("clients.payment_info")}</SectionLabel>

                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.payment_method")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="اختر طريقة الدفع" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {(watchedPaymentMethod === "installments" || watchedPaymentMethod === "mortgage") && (
                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="downPayment" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("clients.down_payment")}</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="numberOfInstallments" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("clients.num_installments")}</FormLabel>
                        <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="installmentAmount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("clients.installment_amount")}</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.notes")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("clients.notes_placeholder")} rows={2} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); form.reset(); }}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createClient.isPending}>
                    {createClient.isPending ? t("clients.adding") : t("clients.add")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Strip */}
      {!isLoading && clientsAll.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users2, label: "إجمالي الصفقات", value: clientsAll.length, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { icon: TrendingUp, label: "صفقات هذا الشهر", value: clientsAll.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: DollarSign, label: "إجمالي قيمة الصفقات", value: totalDeals > 0 ? new Intl.NumberFormat("ar-EG", { notation: "compact" }).format(totalDeals) + " ج.م" : "-", color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((s) => (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-card p-3 rounded-xl border shadow-sm">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("clients.search")} className="ps-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              <SelectItem value="name_az">الاسم (أ-ي)</SelectItem>
              <SelectItem value="value_high">أعلى قيمة صفقة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {clientsAll.length > 0 && (
          <span className="text-sm text-muted-foreground shrink-0">{clientsAll.length} صفقة</span>
        )}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border shadow-sm">
          <Users2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold">{t("clients.no_clients")}</h3>
          <Button className="mt-5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 me-2" /> {t("clients.add")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((client, i) => {
            const initials = getInitials(client.name);
            const avatarColor = getAvatarColor(client.name);
            return (
              <motion.div key={client.id} custom={i} variants={cardVariants} initial="hidden" animate="show">
                <Card
                  className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className={`${avatarColor} text-white font-bold text-sm`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-tight truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(client.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span dir="ltr">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                    </div>

                    {(client.projectName || client.unitNumber || client.unitType) && (
                      <div className="space-y-1 pt-2 border-t">
                        {client.projectName && (
                          <div className="flex items-center gap-2 text-xs">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate font-medium">{client.projectName}</span>
                          </div>
                        )}
                        {(client.unitNumber || client.unitType || client.area) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Home className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {[
                                client.unitType && UNIT_TYPES_AR[client.unitType],
                                client.unitNumber,
                                client.area ? `${client.area} م²` : null,
                              ].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {client.dealValue && (
                      <div className="bg-emerald-500/10 dark:bg-emerald-900/20 rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">قيمة الصفقة</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(client.dealValue))}
                        </span>
                      </div>
                    )}

                    {client.paymentMethod && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span>{PAYMENT_LABELS_AR[client.paymentMethod] ?? client.paymentMethod}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(v) => { if (!v) setSelectedClient(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الصفقة</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className={`${getAvatarColor(selectedClient.name)} text-white font-bold text-xl`}>
                    {getInitials(selectedClient.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedClient.createdAt), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">بيانات العميل</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "الهاتف", value: selectedClient.phone || "-", icon: Phone },
                    { label: "البريد الإلكتروني", value: selectedClient.email || "-", icon: Mail },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Icon className="h-3 w-3" /> {label}</p>
                      <p className="font-medium text-xs truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">بيانات الصفقة</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "المشروع", value: selectedClient.projectName || "-", icon: Building2 },
                    { label: "المندوب", value: selectedClient.assignedSalesName || "-", icon: Users2 },
                    { label: "تاريخ العقد", value: selectedClient.contractDate ? format(new Date(selectedClient.contractDate), "dd/MM/yyyy") : "-", icon: Calendar },
                    { label: "الوحدة", value: [selectedClient.unitType && UNIT_TYPES_AR[selectedClient.unitType], selectedClient.unitNumber].filter(Boolean).join(" · ") || "-", icon: Home },
                    { label: "المساحة", value: selectedClient.area ? `${selectedClient.area} م²` : "-", icon: Maximize2 },
                    { label: "طريقة الدفع", value: selectedClient.paymentMethod ? (PAYMENT_LABELS_AR[selectedClient.paymentMethod] ?? selectedClient.paymentMethod) : "-", icon: CreditCard },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Icon className="h-3 w-3" /> {label}</p>
                      <p className="font-medium text-xs truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedClient.dealValue && (
                <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">قيمة الصفقة الإجمالية</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(selectedClient.dealValue))}
                  </p>
                </div>
              )}

              {(selectedClient.downPayment || selectedClient.numberOfInstallments || selectedClient.installmentAmount) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">بيانات الدفع</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "المقدم", value: selectedClient.downPayment ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(selectedClient.downPayment)) : "-", icon: DollarSign },
                      { label: "عدد الأقساط", value: selectedClient.numberOfInstallments ? `${selectedClient.numberOfInstallments} قسط` : "-", icon: Hash },
                      { label: "قيمة القسط", value: selectedClient.installmentAmount ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(selectedClient.installmentAmount)) : "-", icon: Layers },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Icon className="h-3 w-3" /> {label}</p>
                        <p className="font-medium text-xs truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.notes && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                  <p className="text-sm">{selectedClient.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
