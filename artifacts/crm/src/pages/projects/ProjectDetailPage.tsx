import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import { useListProjects, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18nContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, ArrowLeft, Trash2, Users, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
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
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planning:           { label: "تخطيط",        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  under_construction: { label: "تحت الإنشاء",  color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed:          { label: "مكتمل",         color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled:          { label: "ملغي",          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function ProjectDetailPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: projects = [], isLoading } = useListProjects();
  const project = projects.find(p => p.id === id) as any;

  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h2 className="text-2xl font-bold">المشروع غير موجود</h2>
        <Button className="mt-4" onClick={() => setLocation("/projects")}>العودة للمشاريع</Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (!id) return;
    deleteProject.mutate(
      { projectId: id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast.success("تم حذف المشروع بنجاح");
          setLocation("/projects");
        },
        onError: () => {
          toast.error("فشل حذف المشروع");
        }
      }
    );
  };

  const statusKey = project.status as keyof typeof STATUS_CONFIG ?? "planning";
  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.planning;
  const completionPct = Number(project.completionPercentage ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> {t("projects.back")}
            </Button>
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h2>
          {statusCfg && (
            <span className={`hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          )}
        </div>
        <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" /> {t("common.delete")}
        </Button>
      </div>

      {/* Hero image */}
      {project.imageUrl && (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border bg-muted shadow-sm">
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {statusCfg && (
            <div className="absolute bottom-4 start-4">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
          )}
          {completionPct > 0 && (
            <div className="absolute bottom-0 start-0 end-0 h-1.5 bg-black/20">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, completionPct)}%` }} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              {project.location && (
                <CardDescription className="flex items-center gap-1.5 mt-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {project.location}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/40 p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground mb-1">{t("projects.owner")}</p>
                <p className="font-semibold text-sm">{project.ownerName || "-"}</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground mb-1">{t("projects.status")}</p>
                <p className="font-semibold text-sm">{project.isActive ? t("common.active") : t("common.inactive")}</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground mb-1">{t("projects.avg_price_label")}</p>
                <p className="font-semibold text-sm">
                  {project.avgPrice
                    ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(project.avgPrice))
                    : "-"}
                </p>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground mb-1">{t("projects.added")}</p>
                <p className="font-semibold text-sm">{format(new Date(project.createdAt), "d MMM yyyy")}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">{t("projects.description")}</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                {project.description || t("projects.no_description")}
              </p>
            </div>

            {/* Delivery date & completion */}
            {(project.deliveryDate || completionPct > 0) && (
              <div className="flex flex-wrap gap-4 pt-2 border-t">
                {project.deliveryDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <span>تاريخ التسليم: <strong className="text-foreground">{format(new Date(project.deliveryDate), "d MMM yyyy")}</strong></span>
                  </div>
                )}
                {completionPct > 0 && (
                  <div className="flex-1 min-w-[160px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> نسبة الإنجاز</span>
                      <span className="font-semibold text-emerald-600">{completionPct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, completionPct)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("projects.statistics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي العملاء المحتملين</p>
                <p className="text-2xl font-bold">{project.leadsCount ?? 0}</p>
              </div>
            </div>

            {project.avgPrice && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">متوسط سعر الوحدة</p>
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(project.avgPrice))}
                  </p>
                </div>
              </div>
            )}

            {project.totalUnits && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي الوحدات</p>
                  <p className="text-2xl font-bold">{project.totalUnits}</p>
                </div>
              </div>
            )}

            {completionPct > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">نسبة الإنجاز</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, completionPct)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{completionPct}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("projects.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("projects.delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "جارٍ الحذف..." : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
