import { useGetLeadsKanban, useUpdateLeadStatus, getGetLeadsKanbanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/i18nContext";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Calendar, Phone, Users2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, {
  label: string; labelAr: string;
  gradient: string; headerBg: string; cardBorder: string;
  badgeBg: string; badgeText: string; dot: string;
}> = {
  new: {
    label: "New", labelAr: "جديد",
    gradient: "from-indigo-500/10 to-indigo-500/5",
    headerBg: "bg-indigo-500",
    cardBorder: "hover:border-indigo-400/60",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/40",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  called: {
    label: "Called", labelAr: "تم الاتصال",
    gradient: "from-amber-500/10 to-amber-500/5",
    headerBg: "bg-amber-500",
    cardBorder: "hover:border-amber-400/60",
    badgeBg: "bg-amber-100 dark:bg-amber-900/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  qualified: {
    label: "Qualified", labelAr: "مؤهل",
    gradient: "from-blue-500/10 to-blue-500/5",
    headerBg: "bg-blue-500",
    cardBorder: "hover:border-blue-400/60",
    badgeBg: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  proposal: {
    label: "Proposal", labelAr: "عرض",
    gradient: "from-violet-500/10 to-violet-500/5",
    headerBg: "bg-violet-500",
    cardBorder: "hover:border-violet-400/60",
    badgeBg: "bg-violet-100 dark:bg-violet-900/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  negotiation: {
    label: "Negotiation", labelAr: "تفاوض",
    gradient: "from-orange-500/10 to-orange-500/5",
    headerBg: "bg-orange-500",
    cardBorder: "hover:border-orange-400/60",
    badgeBg: "bg-orange-100 dark:bg-orange-900/40",
    badgeText: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  won: {
    label: "Won", labelAr: "فاز",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    headerBg: "bg-emerald-500",
    cardBorder: "hover:border-emerald-400/60",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  lost: {
    label: "Lost", labelAr: "خسر",
    gradient: "from-red-500/10 to-red-500/5",
    headerBg: "bg-red-500",
    cardBorder: "hover:border-red-400/60",
    badgeBg: "bg-red-100 dark:bg-red-900/40",
    badgeText: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export function LeadsKanbanPage() {
  const { t, locale } = useI18n();
  const { data: kanbanData, isLoading } = useGetLeadsKanban();
  const [, setLocation] = useLocation();
  const updateStatus = useUpdateLeadStatus();
  const queryClient = useQueryClient();
  const isAr = locale === "ar";

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      updateStatus.mutate(
        { leadId, data: { status: status as any } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetLeadsKanbanQueryKey() });
            toast.success(t("leads.change_status"));
          },
          onError: (err) => toast.error(err.message || "Failed to update lead status"),
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("nav.leads.kanban")}</h2>
          <p className="text-muted-foreground">{t("leads.kanban_subtitle")}</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = kanbanData?.columns || [];

  return (
    <div className="space-y-5 h-[calc(100vh-90px)] flex flex-col overflow-hidden">
      <div className="shrink-0">
        <h2 className="text-3xl font-bold tracking-tight">{t("nav.leads.kanban")}</h2>
        <p className="text-muted-foreground">{t("leads.kanban_subtitle")}</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 flex-1 items-start h-full">
        {columns.map((column) => {
          const cfg = STATUS_CONFIG[column.status] ?? {
            label: column.status, labelAr: column.status,
            gradient: "from-muted/30 to-muted/10",
            headerBg: "bg-muted-foreground",
            cardBorder: "hover:border-primary/40",
            badgeBg: "bg-muted", badgeText: "text-foreground", dot: "bg-muted-foreground",
          };

          return (
            <div
              key={column.status}
              className={`min-w-[290px] w-[290px] flex-shrink-0 flex flex-col gap-3 bg-gradient-to-b ${cfg.gradient} p-3 rounded-2xl border h-full`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="shrink-0 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className={`h-3 w-3 rounded-full ${cfg.dot} shadow-sm`} />
                  <span className="font-bold text-sm">
                    {isAr ? cfg.labelAr : cfg.label}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                  {column.leads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pb-2 pr-0.5">
                {column.leads.length === 0 ? (
                  <div className="h-20 border-2 border-dashed border-muted/50 flex items-center justify-center rounded-xl text-xs text-muted-foreground/60 select-none">
                    {isAr ? "اسحب هنا" : "Drop here"}
                  </div>
                ) : (
                  column.leads.map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => setLocation(`/leads/${lead.id}`)}
                      className={`bg-card border-2 border-transparent ${cfg.cardBorder} rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md active:scale-95 select-none group`}
                    >
                      {/* Lead Name + Source */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <p className="font-semibold text-sm leading-tight">{lead.name}</p>
                        <SourceBadge source={lead.source} className="text-[10px] px-1.5 py-0 shrink-0" />
                      </div>

                      {/* Phone */}
                      <div className="flex items-center text-xs text-muted-foreground gap-1.5 mb-2">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span dir="ltr">{lead.phone}</span>
                      </div>

                      {/* Project */}
                      {lead.projectName && (
                        <div className="text-xs bg-muted/60 px-2 py-1 rounded-md text-foreground/70 line-clamp-1 mb-2">
                          🏗️ {lead.projectName}
                        </div>
                      )}

                      {/* Footer: Assignee + Deadline */}
                      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                        {lead.primarySalesId ? (
                          <div className="flex items-center gap-1.5">
                            <UserAvatar name={lead.primarySalesName || "U"} className="h-5 w-5 text-[9px]" />
                            <span className="text-[11px] font-medium text-muted-foreground max-w-[90px] truncate">
                              {lead.primarySalesName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Users2 className="h-3 w-3" />
                            <span>{isAr ? "غير معين" : "Unassigned"}</span>
                          </div>
                        )}

                        {lead.deadline && (
                          <div className="flex items-center text-[10px] text-orange-600 dark:text-orange-400 gap-1 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-md">
                            <Calendar className="h-2.5 w-2.5" />
                            {format(new Date(lead.deadline), "MMM d")}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
