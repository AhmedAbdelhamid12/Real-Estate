import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAssignLead, useListUsers, getListLeadsQueryKey } from "@workspace/api-client-react";
import type { Lead } from "@workspace/api-client-react";

interface AssignLeadModalProps {
  lead: Lead | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignLeadModal({ lead, open, onOpenChange }: AssignLeadModalProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(lead?.primarySalesId ?? "");
  const [note, setNote] = useState("");

  const { data: users = [] } = useListUsers({ role: "sales", status: "active" });
  const assignLead = useAssignLead();

  if (!lead) return null;

  const onAssign = () => {
    if (!selectedUserId) { toast.error("Select a salesperson"); return; }
    assignLead.mutate(
      { leadId: lead.id, data: { salesId: selectedUserId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success("Lead assigned successfully");
          onOpenChange(false);
          setNote("");
        },
        onError: () => toast.error("Failed to assign lead"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <p className="text-sm text-muted-foreground">{lead.name}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Assign to</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select salesperson..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {user.name.charAt(0)}
                      </span>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="Add a note for this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAssign} disabled={!selectedUserId || assignLead.isPending}>
            {assignLead.isPending ? "Assigning..." : "Assign Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
