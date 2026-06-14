import { useGetLeadsKanban, useUpdateLeadStatus, getGetLeadsKanbanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Calendar, Phone } from "lucide-react";
import { format } from "date-fns";

export function LeadsKanbanPage() {
  const { data: kanbanData, isLoading } = useGetLeadsKanban();
  const [, setLocation] = useLocation();
  const updateStatus = useUpdateLeadStatus();
  const queryClient = useQueryClient();

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
            toast.success(`Lead moved to ${status}`);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update lead status");
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
          <p className="text-muted-foreground">Drag and drop leads to update their status.</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[300px] w-[300px] flex-shrink-0 flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = kanbanData?.columns || [];

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      <div className="shrink-0">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <p className="text-muted-foreground">Drag and drop leads to update their status.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start h-full">
        {columns.map((column) => (
          <div
            key={column.status}
            className="min-w-[320px] w-[320px] flex-shrink-0 flex flex-col gap-3 bg-muted/30 p-3 rounded-xl border h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <StatusBadge status={column.status} className="capitalize" />
                <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                  {column.leads.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4">
              {column.leads.length === 0 ? (
                <div className="h-24 border-2 border-dashed border-muted flex items-center justify-center rounded-lg text-sm text-muted-foreground">
                  Drop leads here
                </div>
              ) : (
                column.leads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => setLocation(`/leads/${lead.id}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-sm leading-tight">{lead.name}</div>
                        <SourceBadge source={lead.source} className="text-[10px] px-1.5 py-0" />
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>

                      {lead.projectName && (
                        <div className="text-xs bg-muted px-2 py-1 rounded text-foreground line-clamp-1">
                          {lead.projectName}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t mt-2">
                        {lead.primarySalesId ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar name={lead.primarySalesName || "U"} className="h-6 w-6" />
                            <span className="text-xs font-medium text-muted-foreground max-w-[100px] truncate">
                              {lead.primarySalesName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                        
                        {lead.deadline && (
                          <div className="flex items-center text-[10px] text-orange-600 dark:text-orange-400 gap-1 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.deadline), "MMM d")}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
