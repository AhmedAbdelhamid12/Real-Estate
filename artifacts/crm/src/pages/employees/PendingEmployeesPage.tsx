import { useListPendingUsers, useApproveUser, useRejectUser, getListPendingUsersQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18nContext";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CheckCircle2, XCircle, Mail, Phone, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PendingEmployeesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useListPendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (userId: string) => {
    approveUser.mutate(
      { userId },
      {
        onSuccess: () => {
          toast.success(t("employees.approve"));
          queryClient.invalidateQueries({ queryKey: getListPendingUsersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        },
        onError: (err) => toast.error(err.message || t("common.error"))
      }
    );
  };

  const handleReject = () => {
    if (!rejectingId) return;
    rejectUser.mutate(
      { userId: rejectingId, data: { reason: rejectReason } },
      {
        onSuccess: () => {
          toast.success(t("employees.reject"));
          queryClient.invalidateQueries({ queryKey: getListPendingUsersQueryKey() });
          setRejectingId(null);
          setRejectReason("");
        },
        onError: (err) => toast.error(err.message || t("common.error"))
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("employees.pending_title")}</h2>
          <p className="text-muted-foreground">{t("employees.pending_subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("employees.pending_title")}</h2>
        <p className="text-muted-foreground">{t("employees.pending_subtitle")}</p>
      </div>

      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">{t("employees.no_pending")}</h3>
            <p className="text-muted-foreground mt-1">{t("common.no_data")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map(user => (
            <Card key={user.id} className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-6">
                  <UserAvatar name={user.name} className="h-12 w-12" />
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{t("employees.pending_title")}</p>
                  </div>
                </div>
                
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone || t("employees.not_provided")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{t("employees.requested", { date: format(new Date(user.createdAt), "MMM d, yyyy") })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  onClick={() => setRejectingId(user.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> {t("employees.reject")}
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(user.id)}
                  disabled={approveUser.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> {t("employees.approve")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("employees.reject_title")}</DialogTitle>
            <DialogDescription>
              {t("employees.rejection_reason")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t("employees.rejection_reason")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectUser.isPending}>
              {t("employees.confirm_reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
