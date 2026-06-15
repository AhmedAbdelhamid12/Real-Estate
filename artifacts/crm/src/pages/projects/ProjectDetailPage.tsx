import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

// Mocking useGetProject since it wasn't specified but needed, 
// using list with filter as fallback if not available
import { useListProjects, useUpdateProject, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18nContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Edit, ArrowLeft, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export function ProjectDetailPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: projects = [], isLoading } = useListProjects();
  const project = projects.find(p => p.id === id);

  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button className="mt-4" onClick={() => setLocation("/projects")}>Back to Projects</Button>
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
          toast.success(t("projects.delete_title"));
          setLocation("/projects");
        },
        onError: () => {
          toast.error(t("common.error"));
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("projects.back")}
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4" /> {project.location || "No location"}
                </CardDescription>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">{t("projects.owner")}</p>
                <p className="font-medium">{project.ownerName || "-"}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">{t("projects.status")}</p>
                <p className="font-medium capitalize">{project.isActive ? t("common.active") : t("common.inactive")}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">{t("projects.avg_price_label")}</p>
                <p className="font-medium">
                  {project.avgPrice 
                    ? new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(project.avgPrice))
                    : "-"}
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">{t("projects.added")}</p>
                <p className="font-medium">{format(new Date(project.createdAt), "MMM d, yyyy")}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("projects.description")}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description || t("projects.no_description")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("projects.statistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">More stats coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("projects.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.delete_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
