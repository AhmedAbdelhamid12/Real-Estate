import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { apiFetch, useListResaleUnits, useCreateResaleUnit, useDeleteResaleUnit, getListResaleUnitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/i18nContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Plus, Search, Trash2, Home, User, Phone, Mail, Eye, EyeOff,
  MapPin, Maximize2, ChevronLeft, ChevronRight, Image as ImageIcon, X,
  Edit, LayoutGrid, List, Upload,
} from "lucide-react";

const MAX_PHOTOS = 5;

const resaleSchema = z.object({
  projectName: z.string().min(2),
  unitType: z.string().optional(),
  area: z.string().optional(),
  price: z.string().optional(),
  floor: z.coerce.number().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerNotes: z.string().optional(),
  description: z.string().optional(),
  isOwnerPhoneHidden: z.boolean().default(false),
  isOwnerEmailHidden: z.boolean().default(false),
});

type ResaleFormValues = z.infer<typeof resaleSchema>;

interface ResaleUnit {
  id: string;
  projectName: string;
  unitType?: string | null;
  area?: string | null;
  price?: string | null;
  floor?: number | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  ownerNotes?: string | null;
  description?: string | null;
  isOwnerPhoneHidden: boolean;
  isOwnerEmailHidden: boolean;
  isActive: boolean;
  createdAt: string;
  photos?: { id: string; url: string; caption?: string | null; sortOrder: number }[];
}

/* ── Photo Gallery ─────────────────────────────────────────── */
function PhotoGallery({ photos, unitName, noPhotosLabel }: {
  photos: { id: string; url: string }[];
  unitName: string;
  noPhotosLabel: string;
}) {
  const [current, setCurrent] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-52 bg-gradient-to-br from-muted/70 to-muted/30 flex flex-col items-center justify-center rounded-t-xl text-muted-foreground">
        <ImageIcon className="w-9 h-9 mb-2 opacity-30" />
        <span className="text-xs opacity-60">{noPhotosLabel}</span>
      </div>
    );
  }
  return (
    <div className="relative w-full h-52 rounded-t-xl overflow-hidden bg-muted group">
      {photos.map((photo, i) => (
        <img
          key={photo.id}
          src={photo.url}
          alt={`${unitName} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-[1.03]`}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x250/f4f4f5/a1a1aa?text=No+Image"; }}
        />
      ))}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
          <div className="absolute top-2.5 right-2.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            {current + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Photo Picker (used inside Add Unit dialog) ─────────────── */
function PhotoPicker({ value, onChange }: {
  value: { file: File; previewUrl: string }[];
  onChange: (photos: { file: File; previewUrl: string }[]) => void;
}) {
  const { t } = useI18n();
  const remaining = MAX_PHOTOS - value.length;
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, remaining);
    const newPreviews = files.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    onChange([...value, ...newPreviews].slice(0, MAX_PHOTOS));
    e.target.value = "";
  }

  function remove(idx: number) {
    URL.revokeObjectURL(value[idx].previewUrl);
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {value.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
              <img src={p.previewUrl} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-black/65 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* Add more slot */}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 hover:bg-muted/40 transition-colors"
            >
              <Plus className="w-5 h-5 text-muted-foreground/50" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when empty) */}
      {value.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all"
        >
          <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground/70">{t("resale.click_browse", { n: String(remaining) })}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-end">
        {value.length}/{MAX_PHOTOS}
      </p>
    </div>
  );
}

/* ── Add-after-creation photo dialog ───────────────────────── */
function AddPhotoDialog({ unitId, onAdded, currentCount }: { unitId: string; onAdded: () => void; currentCount: number }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const remaining = MAX_PHOTOS - currentCount;

  async function handleUpload() {
    if (photos.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    try {
      for (const { file } of photos) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        if (!r.ok) throw new Error("Upload failed");
        const { url } = await r.json() as { url: string };
        const add = await apiFetch(`/api/resale/${unitId}/photos`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!add.ok) throw new Error("Failed to save photo");
        uploaded++;
      }
      queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
      toast.success(`${uploaded} ${t("resale.photo_added")}`);
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      setOpen(false);
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleClose(v: boolean) {
    if (!v) { photos.forEach((p) => URL.revokeObjectURL(p.previewUrl)); setPhotos([]); }
    setOpen(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={remaining <= 0}>
          <ImageIcon className="w-3 h-3" />
          {remaining <= 0 ? t("resale.max_photos") : t("resale.photos_count", { current: String(currentCount), max: String(MAX_PHOTOS) })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("resale.add_photos_dialog", { current: String(currentCount), max: String(MAX_PHOTOS) })}</DialogTitle>
        </DialogHeader>
        <PhotoPicker value={photos} onChange={setPhotos} />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleUpload} disabled={photos.length === 0 || uploading}>
            {uploading ? t("resale.uploading") : t("resale.upload_photos")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Toggle Hide Field ─────────────────────────────────────── */
function ToggleHideField({ unitId, field, value, label }: {
  unitId: string; field: "isOwnerPhoneHidden" | "isOwnerEmailHidden"; value: boolean; label: string;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/resale/${unitId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !value }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
      toast.success(`${label} ${!value ? t("resale.hidden") : t("resale.visible")}`);
    },
    onError: () => toast.error(t("common.error")),
  });

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {value
        ? <EyeOff className="w-3.5 h-3.5 text-amber-500" />
        : <Eye className="w-3.5 h-3.5 text-emerald-500" />
      }
      <span>{value ? t("resale.hidden") : t("resale.visible")}</span>
    </button>
  );
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, type: "spring" as const, stiffness: 300, damping: 28 }
  }),
};

/* ── Main Page ─────────────────────────────────────────────── */
export function ResalePage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pendingPhotos, setPendingPhotos] = useState<{ file: File; previewUrl: string }[]>([]);

  const { currentUser } = useAuth();
  const isAdmin = currentUser && ["ceo", "admin", "director"].includes(currentUser.role);

  const queryClient = useQueryClient();
  const { data: allUnits = [], isLoading } = useListResaleUnits() as { data: ResaleUnit[]; isLoading: boolean };
  const createUnit = useCreateResaleUnit();
  const deleteUnit = useDeleteResaleUnit();

  const units = allUnits.filter((u) => {
    const matchSearch = search
      ? u.projectName.toLowerCase().includes(search.toLowerCase()) ||
        (u.unitType ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (u.ownerName ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    const matchType = filterType === "all" || u.unitType === filterType;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? u.isActive : !u.isActive);
    return matchSearch && matchType && matchStatus;
  });

  const form = useForm<ResaleFormValues>({
    resolver: zodResolver(resaleSchema),
    defaultValues: {
      projectName: "", unitType: "apartment", area: "", price: "",
      ownerName: "", ownerPhone: "", ownerEmail: "", ownerNotes: "",
      description: "", isOwnerPhoneHidden: false, isOwnerEmailHidden: false,
    },
  });

  const onSubmit = async (data: ResaleFormValues) => {
    createUnit.mutate(
      { data: data as any },
      {
        onSuccess: async (newUnit: any) => {
          // Upload pending photos using the new unit ID
          if (pendingPhotos.length > 0 && newUnit?.id) {
            let uploaded = 0;
            for (const { file } of pendingPhotos) {
              try {
                const fd = new FormData();
                fd.append("file", file);
                const r = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
                if (!r.ok) continue;
                const { url } = await r.json() as { url: string };
                await apiFetch(`/api/resale/${newUnit.id}/photos`, {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url }),
                });
                uploaded++;
              } catch { /* skip failed photos */ }
            }
            pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
            setPendingPhotos([]);
            if (uploaded > 0) toast.success(`${uploaded} ${t("resale.photo_added")}`);
          }
          queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
          toast.success(t("resale.unit_added"));
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err: Error) => toast.error(err.message || t("common.error")),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm(t("resale.confirm_delete"))) {
      deleteUnit.mutate({ unitId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
          toast.success(t("resale.unit_deleted"));
        }
      });
    }
  };

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-";
    const num = Number(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(num);
  };

  const unitTypes = [...new Set(allUnits.map((u) => u.unitType).filter(Boolean) as string[])];

  function handleAddClose(open: boolean) {
    if (!open) {
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPendingPhotos([]);
      form.reset();
    }
    setIsAddOpen(open);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("resale.marketplace")}</h2>
          <p className="text-muted-foreground">
            {t("resale.units_available", {
              count: String(allUnits.length),
              active: String(allUnits.filter((u) => u.isActive).length),
            })}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={handleAddClose}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> {t("resale.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[660px] max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("resale.add_new")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Project + Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="projectName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.project_name")}</FormLabel>
                        <FormControl><Input placeholder="e.g. Marina Gate" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="unitType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.unit_type")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="penthouse">Penthouse</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Price / Area / Floor */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.price_egp")}</FormLabel>
                        <FormControl><Input placeholder="1500000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="area" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.area_sqm")}</FormLabel>
                        <FormControl><Input placeholder="120" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="floor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.floor")}</FormLabel>
                        <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Description */}
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resale.description")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the unit..." rows={2} className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ── Photos Section ── */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t("resale.photos_section")}</p>
                    <PhotoPicker value={pendingPhotos} onChange={setPendingPhotos} />
                  </div>

                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">{t("resale.owner_details")}</p>

                  {/* Owner Name + Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="ownerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.owner_name")}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resale.owner_phone")}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Owner Email */}
                  <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resale.owner_email")}</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Owner Notes */}
                  <FormField control={form.control} name="ownerNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resale.owner_notes")}</FormLabel>
                      <FormControl><Textarea rows={2} className="resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Hide toggles (admin only) */}
                  {isAdmin && (
                    <div className="flex gap-6 pt-1">
                      <FormField control={form.control} name="isOwnerPhoneHidden" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="font-normal">{t("resale.hide_phone")}</Label>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="isOwnerEmailHidden" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="font-normal">{t("resale.hide_email")}</Label>
                        </FormItem>
                      )} />
                    </div>
                  )}

                  <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={() => handleAddClose(false)}>{t("common.cancel")}</Button>
                    <Button type="submit" disabled={createUnit.isPending}>
                      {createUnit.isPending ? t("resale.adding") : t("resale.add")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("resale.search")}
            className="ps-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("resale.all_types")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resale.all_types")}</SelectItem>
            {unitTypes.map((ty) => (
              <SelectItem key={ty} value={ty} className="capitalize">{ty}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("resale.all_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resale.all_status")}</SelectItem>
            <SelectItem value="active">{t("resale.available")}</SelectItem>
            <SelectItem value="inactive">{t("resale.inactive")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            title="Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Skeleton className="h-52 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Home className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("resale.no_units_found")}</p>
          <p className="text-sm opacity-70">{t("resale.try_adjust")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {units.map((unit, i) => (
            <motion.div
              key={unit.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={CARD_VARIANTS}
              className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <PhotoGallery
                photos={unit.photos ?? []}
                unitName={unit.projectName}
                noPhotosLabel={t("resale.no_photos")}
              />

              <div className="p-4 flex-1 flex flex-col gap-2">
                {/* Title + badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">{unit.projectName}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {unit.unitType ?? t("resale.property")}
                      {unit.floor != null && ` · ${t("resale.floor_n", { n: String(unit.floor) })}`}
                    </p>
                  </div>
                  <Badge
                    variant={unit.isActive ? "default" : "secondary"}
                    className="shrink-0 text-xs"
                  >
                    {unit.isActive ? t("resale.available") : t("resale.inactive")}
                  </Badge>
                </div>

                {/* Price + area */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {unit.price && (
                    <span className="font-bold text-foreground text-base">{formatPrice(unit.price)}</span>
                  )}
                  {unit.area && (
                    <span className="flex items-center gap-0.5">
                      <Maximize2 className="w-3 h-3" /> {unit.area} {t("resale.sqm")}
                    </span>
                  )}
                </div>

                {/* Description */}
                {unit.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{unit.description}</p>
                )}

                <Separator className="my-1" />

                {/* Owner info */}
                <div className="space-y-1">
                  {unit.ownerName && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{unit.ownerName}</span>
                    </div>
                  )}
                  {unit.ownerPhone && !unit.isOwnerPhoneHidden && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <a href={`tel:${unit.ownerPhone}`} className="text-primary hover:underline">{unit.ownerPhone}</a>
                    </div>
                  )}
                  {unit.ownerPhone && unit.isOwnerPhoneHidden && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="select-none tracking-widest">••••••••</span>
                    </div>
                  )}
                  {unit.ownerEmail && !unit.isOwnerEmailHidden && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${unit.ownerEmail}`} className="text-primary hover:underline truncate">{unit.ownerEmail}</a>
                    </div>
                  )}
                  {unit.ownerEmail && unit.isOwnerEmailHidden && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="select-none tracking-widest">••••••••</span>
                    </div>
                  )}
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <ToggleHideField unitId={unit.id} field="isOwnerPhoneHidden" value={unit.isOwnerPhoneHidden} label="Phone" />
                      <ToggleHideField unitId={unit.id} field="isOwnerEmailHidden" value={unit.isOwnerEmailHidden} label="Email" />
                    </div>
                    <div className="flex items-center gap-1">
                      <AddPhotoDialog unitId={unit.id} onAdded={() => {}} currentCount={unit.photos?.length ?? 0} />
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y">
          {units.map((unit, i) => (
            <motion.div
              key={unit.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={CARD_VARIANTS}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border">
                {unit.photos && unit.photos.length > 0 ? (
                  <img src={unit.photos[0].url} alt={unit.projectName} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{unit.projectName}</p>
                  <Badge variant={unit.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                    {unit.isActive ? t("resale.available") : t("resale.inactive")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {unit.unitType ?? t("resale.property")}
                  {unit.floor != null ? ` · ${t("resale.floor_n", { n: String(unit.floor) })}` : ""}
                </p>
              </div>

              <div className="text-end shrink-0">
                <p className="font-bold text-sm">{formatPrice(unit.price)}</p>
                {unit.area && <p className="text-xs text-muted-foreground">{unit.area} {t("resale.sqm")}</p>}
              </div>

              <div className="shrink-0 w-36 text-xs">
                {unit.ownerName && <p className="font-medium truncate">{unit.ownerName}</p>}
                {unit.ownerPhone && !unit.isOwnerPhoneHidden && <p className="text-muted-foreground">{unit.ownerPhone}</p>}
                {unit.ownerPhone && unit.isOwnerPhoneHidden && <p className="text-muted-foreground tracking-widest">••••••</p>}
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <AddPhotoDialog unitId={unit.id} onAdded={() => {}} currentCount={unit.photos?.length ?? 0} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(unit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
