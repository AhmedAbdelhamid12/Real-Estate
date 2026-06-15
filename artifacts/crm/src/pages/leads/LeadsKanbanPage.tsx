import { useGetLeadsKanban, useUpdateLeadStatus, getGetLeadsKanbanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/i18nContext";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Calendar, Phone, Users2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, {
  label: string; labelAr: string;
  hex: string;
  light: string;
  track: string;
}> = {
  new:         { label: "New",         labelAr: "جديد",       hex: "#6366f1", light: "rgba(99,102,241,0.08)",  track: "rgba(99,102,241,0.18)"  },
  called:      { label: "Called",      labelAr: "تم الاتصال", hex: "#f59e0b", light: "rgba(245,158,11,0.08)",  track: "rgba(245,158,11,0.18)"  },
  qualified:   { label: "Qualified",   labelAr: "مؤهل",       hex: "#3b82f6", light: "rgba(59,130,246,0.08)",  track: "rgba(59,130,246,0.18)"  },
  proposal:    { label: "Proposal",    labelAr: "عرض",        hex: "#8b5cf6", light: "rgba(139,92,246,0.08)",  track: "rgba(139,92,246,0.18)"  },
  negotiation: { label: "Negotiation", labelAr: "تفاوض",      hex: "#f97316", light: "rgba(249,115,22,0.08)",  track: "rgba(249,115,22,0.18)"  },
  won:         { label: "Won",         labelAr: "فاز",        hex: "#10b981", light: "rgba(16,185,129,0.08)",  track: "rgba(16,185,129,0.18)"  },
  lost:        { label: "Lost",        labelAr: "خسر",        hex: "#ef4444", light: "rgba(239,68,68,0.08)",   track: "rgba(239,68,68,0.18)"   },
};

const ease = [0.22, 1, 0.36, 1];

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
      <div className="space-y-4 h-full flex flex-col">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("nav.leads.kanban")}</h2>
          <p className="text-muted-foreground">{t("leads.kanban_subtitle")}</p>
        </div>
        <div className="flex flex-col gap-0 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-0 h-[100px]">
              <Skeleton className="h-full w-44 rounded-none" style={{ borderRadius: i === 0 ? "12px 0 0 0" : i === 3 ? "0 0 0 12px" : 0 }} />
              <Skeleton className="h-full flex-1 ml-2 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = kanbanData?.columns || [];

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="shrink-0 mb-4"
      >
        <h2 className="text-3xl font-bold tracking-tight">{t("nav.leads.kanban")}</h2>
        <p className="text-muted-foreground text-sm">{t("leads.kanban_subtitle")}</p>
      </motion.div>

      {/* Pipeline */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <div className="flex flex-col">
          {columns.map((column, colIndex) => {
            const cfg = STATUS_CONFIG[column.status] ?? {
              label: column.status, labelAr: column.status,
              hex: "#6b7280", light: "rgba(107,114,128,0.08)", track: "rgba(107,114,128,0.18)",
            };
            const isLast = colIndex === columns.length - 1;

            return (
              <div key={column.status}>
                {/* ── Stage Row ── */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: colIndex * 0.06, ease }}
                  className="flex items-stretch min-h-[96px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  {/* Stage Label Panel */}
                  <div
                    className="w-40 shrink-0 flex flex-col items-center justify-center gap-1.5 relative"
                    style={{
                      background: cfg.light,
                      borderLeft: `4px solid ${cfg.hex}`,
                      borderTop: colIndex === 0 ? `1px solid ${cfg.track}` : "none",
                      borderBottom: isLast ? `1px solid ${cfg.track}` : "none",
                      borderRight: `1px solid ${cfg.track}`,
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: colIndex * 0.06 + 0.15, type: "spring", stiffness: 200 }}
                      style={{
                        width: 10, height: 10, borderRadius: "50%",
                        backgroundColor: cfg.hex,
                        boxShadow: `0 0 8px ${cfg.hex}`,
                      }}
                    />
                    <span className="text-xs font-bold text-center leading-tight" style={{ color: cfg.hex }}>
                      {isAr ? cfg.labelAr : cfg.label}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: colIndex * 0.06 + 0.25 }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.track, color: cfg.hex }}
                    >
                      {column.leads.length}
                    </motion.span>
                  </div>

                  {/* Pipe Arrow Connector */}
                  <div className="w-10 shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{ background: cfg.light }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: colIndex * 0.06 + 0.2 }}
                      style={{ color: cfg.hex, opacity: 0.7 }}
                    >
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </motion.div>
                    {/* Animated flow line */}
                    <motion.div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        height: 2,
                        background: `linear-gradient(90deg, transparent, ${cfg.hex}80)`,
                        transformOrigin: "left",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: colIndex * 0.06 + 0.1 }}
                    />
                  </div>

                  {/* Cards Track — horizontal scroll */}
                  <div
                    className="flex-1 overflow-x-auto flex items-center gap-3 px-3"
                    style={{
                      borderTop: `1px solid ${cfg.track}`,
                      borderBottom: `1px solid ${cfg.track}`,
                      background: `linear-gradient(90deg, ${cfg.light} 0%, transparent 180px)`,
                    }}
                  >
                    <AnimatePresence>
                      {column.leads.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center h-14 w-48 shrink-0 border-2 border-dashed rounded-xl text-xs text-muted-foreground/50 select-none"
                          style={{ borderColor: `${cfg.hex}30` }}
                        >
                          {isAr ? "اسحب هنا" : "Drop here"}
                        </motion.div>
                      ) : (
                        column.leads.map((lead, i) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 16, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: colIndex * 0.04 + i * 0.05, ease }}
                            whileHover={{ y: -3, boxShadow: `0 8px 24px ${cfg.hex}28` }}
                            whileTap={{ scale: 0.97 }}
                            draggable
                            onDragStart={(e) => handleDragStart(e as any, lead.id)}
                            onClick={() => setLocation(`/leads/${lead.id}`)}
                            className="bg-card shrink-0 w-[200px] rounded-xl p-3 cursor-pointer select-none"
                            style={{
                              border: `1.5px solid ${cfg.track}`,
                              transition: "box-shadow 0.2s, border-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = cfg.hex + "60";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = cfg.track;
                            }}
                          >
                            {/* Name row */}
                            <div className="flex items-start justify-between gap-1.5 mb-2">
                              <p className="font-semibold text-[12px] leading-tight line-clamp-1 flex-1">
                                {lead.name}
                              </p>
                              <SourceBadge source={lead.source} className="text-[9px] px-1 py-0 shrink-0" />
                            </div>

                            {/* Phone */}
                            <div className="flex items-center text-[11px] text-muted-foreground gap-1 mb-1.5">
                              <Phone className="h-2.5 w-2.5 shrink-0" />
                              <span dir="ltr" className="truncate">{lead.phone}</span>
                            </div>

                            {/* Project */}
                            {lead.projectName && (
                              <div
                                className="text-[10px] px-1.5 py-0.5 rounded-md mb-1.5 truncate"
                                style={{ background: cfg.track, color: cfg.hex, fontWeight: 500 }}
                              >
                                🏗 {lead.projectName}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-muted/40">
                              {lead.primarySalesId ? (
                                <div className="flex items-center gap-1">
                                  <UserAvatar name={lead.primarySalesName || "U"} className="h-4 w-4 text-[8px]" />
                                  <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">
                                    {lead.primarySalesName}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                                  <Users2 className="h-2.5 w-2.5" />
                                  <span>{isAr ? "غير معين" : "Unassigned"}</span>
                                </div>
                              )}
                              {lead.deadline && (
                                <div className="flex items-center text-[9px] text-orange-500 gap-0.5 bg-orange-100 dark:bg-orange-900/30 px-1 py-0.5 rounded">
                                  <Calendar className="h-2 w-2" />
                                  {format(new Date(lead.deadline), "MMM d")}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* ── Pipe Connector between stages ── */}
                {!isLast && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: colIndex * 0.06 + 0.3, ease }}
                    style={{ transformOrigin: "top" }}
                    className="flex items-stretch h-4 relative"
                  >
                    {/* Left pipe segment — under stage label */}
                    <div
                      className="w-40 shrink-0"
                      style={{
                        background: `linear-gradient(180deg, ${cfg.hex}20, ${(STATUS_CONFIG[columns[colIndex + 1]?.status] ?? cfg).hex}20)`,
                        borderLeft: `4px solid ${cfg.hex}60`,
                        borderRight: `1px solid ${cfg.track}`,
                      }}
                    />
                    {/* Arrow area */}
                    <div className="w-10 shrink-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(180deg, ${cfg.hex}08, transparent)` }}
                    >
                      <div style={{ width: 1, height: "100%", background: `linear-gradient(180deg, ${cfg.hex}40, transparent)` }} />
                    </div>
                    {/* Track area */}
                    <div className="flex-1"
                      style={{ background: `linear-gradient(180deg, ${cfg.hex}04, transparent)` }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .overflow-x-auto::-webkit-scrollbar { height: 3px; }
        .overflow-x-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
      `}</style>
    </div>
  );
}
