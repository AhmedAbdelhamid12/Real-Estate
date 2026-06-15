import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useI18n } from "@/contexts/i18nContext";
import { 
  useUpdateLead,
  useUpdateLeadStatus, 
  useAssignLead, 
  useDeleteLead,
  useListLeadActivities,
  useCreateLeadActivity,
  useListUsers,
  useListLeads,
  getListLeadActivitiesQueryKey,
  getListLeadsQueryKey,
  getGetLeadsKanbanQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { formatDistanceToNow, format, differenceInDays, isPast, isToday } from "date-fns";
import { ar as arDateLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { 
  Phone, Mail, Calendar as CalendarIcon, MessageCircle, FileText, 
  ChevronDown, Trash2, Edit, MoreVertical, Clock, AlertTriangle, 
  CheckCircle, Timer, ArrowLeft
} from "lucide-react";

const activitySchema = z.object({
  type: z.enum(["call", "meeting", "email", "message", "note"]),
  notes: z.string().min(1),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
});

const editLeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  source: z.enum(["manual", "import", "campaign", "referral", "website", "social"]),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  deadline: z.string().optional(),
  nextActionAt: z.string().optional(),
});

const STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  new:         { en: "New",         ar: "جديد" },
  called:      { en: "Called",      ar: "تم الاتصال" },
  qualified:   { en: "Qualified",   ar: "مؤهل" },
  proposal:    { en: "Proposal",    ar: "عرض سعر" },
  negotiation: { en: "Negotiation", ar: "تفاوض" },
  won:         { en: "Won",         ar: "صفقة مكتملة" },
  lost:        { en: "Lost",        ar: "خسارة" },
};

function DeadlineBadge({ deadline, isAr, t }: { deadline: string | null | undefined; isAr: boolean; t: (k: string, v?: Record<string, string | number>) => string }) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const daysLeft = differenceInDays(d, new Date());
  const overdue = isPast(d) && !isToday(d);
  const today = isToday(d);
  const urgent = !overdue && daysLeft <= 2;

  const label = overdue
    ? t("leads.overdue", { n: Math.abs(daysLeft) })
    : today
    ? t("leads.due_today")
    : t("leads.due_in", { n: daysLeft });

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium",
      overdue && "bg-red-500/10 border-red-500/30 text-red-500",
      today && "bg-orange-500/10 border-orange-500/30 text-orange-500",
      urgent && !today && "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400",
      !overdue && !today && !urgent && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
    )}>
      {overdue ? <AlertTriangle className="h-4 w-4" /> : today ? <Timer className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
      <span>
        {label}
        <span className="font-normal mx-1 opacity-75">({format(d, "MMM d, yyyy")})</span>
      </span>
    </div>
  );
}

export function LeadDetailPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: leads = [], isLoading: isLeadsLoading } = useListLeads({ search: undefined });
  const lead = leads.find((l: any) => l.id === id);

  const { data: activities = [], isLoading: isActivitiesLoading } = useListLeadActivities(id as string);
  const { data: users = [] } = useListUsers();

  const updateStatus = useUpdateLeadStatus();
  const updateLead = useUpdateLead();
  const assignLead = useAssignLead();
  const createActivity = useCreateLeadActivity();
  const deleteLead = useDeleteLead();

  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "note", notes: "", outcome: "", nextAction: "" },
  });

  const editForm = useForm<z.infer<typeof editLeadSchema>>({
    resolver: zodResolver(editLeadSchema),
    values: lead ? {
      name: lead.name ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      source: (lead.source as any) ?? "manual",
      notes: lead.notes ?? "",
      nextAction: lead.nextAction ?? "",
      deadline: lead.deadline ? format(new Date(lead.deadline), "yyyy-MM-dd") : "",
      nextActionAt: lead.nextActionAt ? format(new Date(lead.nextActionAt), "yyyy-MM-dd") : "",
    } : undefined,
  });

  const getActivityLabel = (type: string) => t(`leads.activity.${type}`) || type;

  const onAddActivity = (values: z.infer<typeof activitySchema>) => {
    if (!id) return;
    createActivity.mutate(
      { leadId: id, data: values as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadActivitiesQueryKey(id) });
          toast.success(t("leads.activity_logged"));
          form.reset();
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  const onEditLead = (values: z.infer<typeof editLeadSchema>) => {
    if (!id) return;
    updateLead.mutate(
      {
        leadId: id,
        data: {
          name: values.name,
          phone: values.phone || null,
          email: values.email || null,
          source: values.source as any,
          notes: values.notes || null,
          nextAction: values.nextAction || null,
          deadline: values.deadline || null,
          nextActionAt: values.nextActionAt || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success(t("leads.lead_updated"));
          setIsEditOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  };

  const handleStatusChange = (status: string) => {
    if (!id) return;
    updateStatus.mutate(
      { leadId: id, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetLeadsKanbanQueryKey() });
          toast.success(t("leads.status_updated"));
        },
      }
    );
  };

  const handleAssign = (userId: string) => {
    if (!id) return;
    assignLead.mutate(
      { leadId: id, data: { salesId: userId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success(t("leads.reassigned"));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteLead.mutate(
      { leadId: id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success(t("leads.lead_deleted"));
          setLocation("/leads");
        },
      }
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":    return <Phone className="h-4 w-4" />;
      case "meeting": return <CalendarIcon className="h-4 w-4" />;
      case "email":   return <Mail className="h-4 w-4" />;
      case "message": return <MessageCircle className="h-4 w-4" />;
      default:        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLeadsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">{t("leads.not_found")}</h2>
        <p className="text-muted-foreground mt-2">{t("leads.not_found_desc")}</p>
        <Button className="mt-4" onClick={() => setLocation("/leads")}>
          <ArrowLeft className={cn("h-4 w-4", isAr ? "ml-2 rotate-180" : "mr-2")} />
          {t("leads.back_to_leads")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => setLocation("/leads")} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className={cn("h-4 w-4", isAr ? "ml-2 rotate-180" : "mr-2")} />
        {t("leads.back")}
      </Button>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{lead.name}</h1>
            <StatusBadge status={lead.status} />
            <SourceBadge source={lead.source} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5" /> <span dir="ltr">{lead.phone}</span>
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5" /> {lead.email}
              </a>
            )}
            {(lead as any).projectName && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{t("leads.project_label")}</span> {(lead as any).projectName}
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">{t("leads.created_label")}</span>
              {format(new Date(lead.createdAt), "MMM d, yyyy")}
            </div>
          </div>
          {lead.deadline && (
            <div className="mt-3">
              <DeadlineBadge deadline={lead.deadline} isAr={isAr} t={t} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                {t("leads.change_status")} <ChevronDown className={cn("h-4 w-4", isAr ? "mr-2" : "ml-2")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("leads.update_status")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(STATUS_LABELS).map(([key, lbl]) => (
                <DropdownMenuItem key={key} onClick={() => handleStatusChange(key)}>
                  {key === lead.status
                    ? <CheckCircle className={cn("h-4 w-4 text-emerald-500", isAr ? "ml-2" : "mr-2")} />
                    : <span className="w-6" />}
                  {isAr ? lbl.ar : lbl.en}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("leads.actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} /> {t("leads.edit_details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} /> {t("leads.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Next Action highlight */}
          {lead.nextAction && (
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <Timer className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
                  {t("leads.next_action_label")}
                </p>
                <p className="text-sm">{lead.nextAction}</p>
                {lead.nextActionAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("leads.scheduled")} {format(new Date(lead.nextActionAt), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle>{t("leads.activity_history")}</CardTitle>
              <CardDescription>{t("leads.all_interactions")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isActivitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t("leads.no_activities")}
                </div>
              ) : (
                <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="relative pl-6">
                      <span className="absolute -left-3.5 top-1 bg-background border border-muted p-1 rounded-full text-muted-foreground">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="bg-muted/30 border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{getActivityLabel(activity.type)}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("leads.by")} {activity.userName}
                            </span>
                            {activity.duration && (
                              <Badge variant="outline" className="text-xs py-0">{activity.duration}m</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                              locale: isAr ? arDateLocale : undefined,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{activity.notes}</p>
                        {(activity.outcome || activity.nextAction) && (
                          <div className="mt-3 text-xs bg-background p-2 rounded border space-y-1">
                            {activity.outcome && (
                              <div>
                                <span className="font-semibold text-muted-foreground">{t("leads.outcome_label")}</span>{" "}
                                {activity.outcome}
                              </div>
                            )}
                            {activity.nextAction && (
                              <div>
                                <span className="font-semibold text-muted-foreground">{t("leads.next_short")}</span>{" "}
                                {activity.nextAction}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Log Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t("leads.log_activity")}</CardTitle>
              <CardDescription>{t("leads.all_interactions")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddActivity)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("leads.activity_type")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("leads.select_type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="call">📞 {t("leads.activity.call")}</SelectItem>
                              <SelectItem value="meeting">🤝 {t("leads.activity.meeting")}</SelectItem>
                              <SelectItem value="email">✉️ {t("leads.activity.email")}</SelectItem>
                              <SelectItem value="message">💬 {t("leads.activity.message")}</SelectItem>
                              <SelectItem value="note">📝 {t("leads.activity.note")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("leads.duration")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("leads.notes")} *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("leads.notes_placeholder")}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="outcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("leads.outcome")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("leads.outcome_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nextAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("leads.next_action_label")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("leads.next_action_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createActivity.isPending}>
                    {createActivity.isPending ? t("leads.saving") : t("leads.log_activity")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Deadline & Next Action Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("leads.deadline")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                  {t("leads.deadline_label")}
                </p>
                {lead.deadline ? (
                  <DeadlineBadge deadline={lead.deadline} isAr={isAr} t={t} />
                ) : (
                  <span className="text-sm text-muted-foreground italic">{t("leads.no_deadline")}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                  {t("leads.next_action_date")}
                </p>
                {lead.nextActionAt ? (
                  <span className="text-sm">{format(new Date(lead.nextActionAt), "MMM d, yyyy")}</span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">{t("leads.not_scheduled")}</span>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditOpen(true)}>
                <Edit className={cn("h-3.5 w-3.5", isAr ? "ml-2" : "mr-2")} /> {t("leads.edit_details")}
              </Button>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("leads.salesperson")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar
                  name={(lead as any).primarySalesName || t("leads.unassigned")}
                  className="h-10 w-10"
                />
                <div>
                  <p className="text-sm font-medium">
                    {(lead as any).primarySalesName || t("leads.unassigned")}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("leads.primary_agent")}</p>
                </div>
              </div>
              <Select onValueChange={handleAssign} value={(lead as any).primarySalesId || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder={t("leads.reassign_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("leads.notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("leads.edit_lead")}</DialogTitle>
            <DialogDescription>{t("leads.all_interactions")}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditLead)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>{t("leads.full_name")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.phone_label")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.email")}</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.source")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["manual", "import", "campaign", "referral", "website", "social"].map(s => (
                            <SelectItem key={s} value={s}>
                              {t(`leads.source.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.deadline")}</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="nextAction"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>{t("leads.next_action_label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("leads.next_action_short_placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="nextActionAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.next_action_date")}</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>{t("leads.notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("leads.notes_general_placeholder")}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={updateLead.isPending}>
                  {updateLead.isPending ? t("leads.saving") : t("leads.save_changes")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leads.delete_lead_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("leads.delete_lead_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("leads.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
