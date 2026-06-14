import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiFetch, getListLeadsQueryKey } from "@workspace/api-client-react";
import type { Lead } from "@workspace/api-client-react";
import { Clock } from "lucide-react";

interface DelayRequestModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DelayRequestModal({ lead, open, onOpenChange }: DelayRequestModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [delayUntil, setDelayUntil] = useState("");

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leads/${lead.id}/delay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, delayUntil: new Date(delayUntil).toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to submit delay request");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      toast.success("Delay request submitted. Admin will review it.");
      onOpenChange(false);
      setReason("");
      setDelayUntil("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const canSubmit = reason.trim().length >= 10 && !!delayUntil;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Request Lead Delay
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{lead.name}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Delay until</Label>
            <Input
              type="date"
              value={delayUntil}
              onChange={(e) => setDelayUntil(e.target.value)}
              min={minDateStr}
            />
          </div>
          <div className="space-y-2">
            <Label>Reason <span className="text-muted-foreground text-xs">(min 10 chars)</span></Label>
            <Textarea
              placeholder="Explain why you need this lead delayed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{reason.length} / 10 min</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
