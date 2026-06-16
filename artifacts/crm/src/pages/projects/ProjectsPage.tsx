import { useState, useRef } from "react";
import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Building2, User, Edit, Trash2, Eye, Upload, X as XIcon, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";
import { motion } from "framer-motion";

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json() as { url: string };
  return data.url;
}

const projectSchema = z.object({
  name: z.string().min(2, "اسم المشروع مطلوب"),
  location: z.string().optional(),
  ownerName: z.string().optional(),
  avgPrice: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  totalUnits: z.string().optional(),
  completionPercentage: z.string().optional(),
  deliveryDate: z.string().optional(),
  status: z.enum(["planning", "under_construction", "completed", "cancelled"]).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const STATUS_CONFIG = {
  planning:           { label: "تخطيط",          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  under_construction: { label: "تحت الإنشاء",     color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed:          { label: "مكتمل",           color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled:          { label: "ملغي",            color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.36, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ProjectForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "", location: "", ownerName: "", avgPrice: "",
      description: "", imageUrl: "", totalUnits: "",
      completionPercentage: "", deliveryDate: "", status: "planning",
      ...defaultValues,
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("الصورة أكبر من 2MB — قد تؤثر على سرعة التحميل. يُفضل ضغطها أولاً.");
    }
    setImageUploading(true);
    try {
      const url = await uploadImageFile(file);
      form.setValue("imageUrl", url);
      toast.success("تم رفع الصورة بنجاح");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  const imageUrlValue = form.watch("imageUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Name */}
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>اسم المشروع *</FormLabel>
            <FormControl><Input placeholder="مثال: مارينا فيوز" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>الموقع</FormLabel>
              <FormControl><Input placeholder="مثال: القاهرة الجديدة" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="ownerName" render={({ field }) => (
            <FormItem>
              <FormLabel>المطور / المالك</FormLabel>
              <FormControl><Input placeholder="مثال: إعمار" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="avgPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>متوسط السعر (ج.م)</FormLabel>
              <FormControl><Input type="number" placeholder="1,000,000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="totalUnits" render={({ field }) => (
            <FormItem>
              <FormLabel>إجمالي الوحدات</FormLabel>
              <FormControl><Input type="number" placeholder="250" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>الحالة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="planning">تخطيط</SelectItem>
                  <SelectItem value="under_construction">تحت الإنشاء</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="deliveryDate" render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ التسليم</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="completionPercentage" render={({ field }) => (
          <FormItem>
            <FormLabel>نسبة الإنجاز (%)</FormLabel>
            <FormControl><Input type="number" min="0" max="100" placeholder="65" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>الوصف</FormLabel>
            <FormControl>
              <Textarea placeholder="وصف مفصل عن المشروع..." rows={3} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Image Upload */}
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>صورة الغلاف</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={imageUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {imageUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {imageUploading ? "جارٍ الرفع..." : imageUrlValue ? "تغيير الصورة" : "رفع صورة"}
                  </Button>
                  {imageUrlValue && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => field.onChange("")}
                    >
                      <XIcon className="w-3.5 h-3.5" />
                      حذف الصورة
                    </Button>
                  )}
                </div>
                {imageUrlValue && (
                  <div className="relative rounded-xl overflow-hidden h-32 bg-muted border group/img">
                    <img
                      src={imageUrlValue}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => field.onChange("")}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/50 transition-all opacity-0 group-hover/img:opacity-100 cursor-pointer border-0"
                    >
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <XIcon className="w-4 h-4" />
                        حذف الصورة
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button type="submit" disabled={isPending || imageUploading}>
            {isPending ? "جارٍ الحفظ..." : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ProjectsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { data: projectsAll = [], isLoading } = useListProjects();
  const projects = search
    ? projectsAll.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : projectsAll;

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const onSubmitCreate = (data: ProjectFormValues) => {
    createProject.mutate(
      { data: data as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast.success("تم إنشاء المشروع بنجاح");
          setIsAddOpen(false);
        },
        onError: (err) => toast.error(err.message || "فشل إنشاء المشروع"),
      }
    );
  };

  const onSubmitEdit = (data: ProjectFormValues) => {
    if (!editingProject) return;
    updateProject.mutate(
      { projectId: editingProject.id, data: data as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast.success("تم تحديث المشروع بنجاح");
          setEditingProject(null);
        },
        onError: (err) => toast.error(err.message || "فشل تحديث المشروع"),
      }
    );
  };

  const onDelete = () => {
    if (!deletingProject) return;
    deleteProject.mutate(
      { projectId: deletingProject.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast.success("تم حذف المشروع");
          setDeletingProject(null);
        },
        onError: (err) => toast.error(err.message || "فشل الحذف"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("projects.title")}</h2>
          <p className="text-muted-foreground">{t("projects.subtitle")}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("projects.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة مشروع جديد</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={onSubmitCreate}
              isPending={createProject.isPending}
              onCancel={() => setIsAddOpen(false)}
              submitLabel="إنشاء المشروع"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex bg-card p-3 rounded-xl border shadow-sm max-w-md">
        <div className="relative w-full">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("projects.search")}
            className="ps-8 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border shadow-sm">
          <Building2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold">{t("projects.no_projects")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">أنشئ أول مشروع لك لبدء تتبع المخزون.</p>
          <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 me-2" /> إضافة مشروع
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const statusKey = (project as any).status as keyof typeof STATUS_CONFIG ?? "planning";
            const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.planning;
            const completionPct = Number((project as any).completionPercentage ?? 0);
            const imageUrl = (project as any).imageUrl;

            return (
              <motion.div
                key={project.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
              >
                <Card className="group hover:border-primary/50 hover:shadow-md transition-all flex flex-col overflow-hidden h-full">
                  {/* Image */}
                  <div className="h-40 bg-muted flex items-center justify-center border-b overflow-hidden relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const fallback = document.getElementById(`fallback-${project.id}`);
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div id={`fallback-${project.id}`} className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40 ${imageUrl ? "hidden" : ""}`}>
                      <Building2 className="h-12 w-12 text-muted-foreground/30" />
                    </div>

                    {/* Status badge overlay */}
                    <div className="absolute top-3 start-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Progress bar overlay */}
                    {completionPct > 0 && (
                      <div className="absolute bottom-0 start-0 end-0">
                        <div className="h-1 bg-muted/30">
                          <div
                            className="h-1 bg-emerald-500 transition-all"
                            style={{ width: `${Math.min(100, completionPct)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 flex-1 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base line-clamp-1" title={project.name}>{project.name}</h3>
                      {(project.leadsCount ?? 0) > 0 && (
                        <Badge variant="secondary" className="text-xs shrink-0">{project.leadsCount} عملاء</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{project.location || "لا يوجد موقع"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{project.ownerName || "مطور غير معروف"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">يبدأ من</p>
                        <p className="font-bold text-sm">
                          {project.avgPrice
                            ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(project.avgPrice))
                            : "TBA"}
                        </p>
                      </div>
                      {(project as any).totalUnits && (
                        <div className="text-end">
                          <p className="text-xs text-muted-foreground">الوحدات</p>
                          <p className="font-semibold text-sm">{(project as any).totalUnits}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2 border-t mt-1">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> عرض التفاصيل
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingProject(project)}
                      title="تعديل"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingProject(project)}
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(v) => { if (!v) setEditingProject(null); }}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المشروع: {editingProject?.name}</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              defaultValues={{
                name: editingProject.name,
                location: editingProject.location || "",
                ownerName: editingProject.ownerName || "",
                avgPrice: editingProject.avgPrice || "",
                description: editingProject.description || "",
                imageUrl: (editingProject as any).imageUrl || "",
                totalUnits: String((editingProject as any).totalUnits ?? ""),
                completionPercentage: String((editingProject as any).completionPercentage ?? ""),
                deliveryDate: (editingProject as any).deliveryDate?.split("T")[0] || "",
                status: (editingProject as any).status || "planning",
              }}
              onSubmit={onSubmitEdit}
              isPending={updateProject.isPending}
              onCancel={() => setEditingProject(null)}
              submitLabel="حفظ التغييرات"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProject} onOpenChange={(v) => { if (!v) setDeletingProject(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف مشروع <strong>{deletingProject?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "جارٍ الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
