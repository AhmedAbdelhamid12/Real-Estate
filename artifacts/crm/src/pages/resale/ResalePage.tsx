import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, useListResaleUnits, useCreateResaleUnit, useDeleteResaleUnit, getListResaleUnitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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
  MapPin, Maximize2, ChevronLeft, ChevronRight, Image, X, Star,
  Edit, LayoutGrid, List, Filter, SlidersHorizontal
} from "lucide-react";

const resaleSchema = z.object({
  projectName: z.string().min(2, "Project name required"),
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

function PhotoGallery({ photos, unitName }: { photos: { id: string; url: string }[]; unitName: string }) {
  const [current, setCurrent] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center rounded-t-xl text-muted-foreground">
        <Image className="w-8 h-8 mb-2 opacity-40" />
        <span className="text-xs">No photos</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-t-xl overflow-hidden bg-muted group">
      <img
        src={photos[current].url}
        alt={unitName}
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placehold.co/400x250/f4f4f5/a1a1aa?text=No+Image";
        }}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}

function AddPhotoDialog({ unitId, onAdded, currentCount }: { unitId: string; onAdded: () => void; currentCount: number }) {
  const MAX_PHOTOS = 5;
  const [open, setOpen] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const remaining = MAX_PHOTOS - currentCount;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const allowed = files.slice(0, remaining);
    const newPreviews = allowed.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setPreviews((p) => [...p, ...newPreviews].slice(0, remaining));
    e.target.value = "";
  }

  function removePreview(idx: number) {
    setPreviews((p) => {
      URL.revokeObjectURL(p[idx].previewUrl);
      return p.filter((_, i) => i !== idx);
    });
  }

  async function handleUpload() {
    if (previews.length === 0) return;
    setUploading(true);
    try {
      for (const { file } of previews) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const { url } = await uploadRes.json() as { url: string };
        const addRes = await apiFetch(`/api/resale/${unitId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!addRes.ok) throw new Error("Failed to save photo");
      }
      queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
      toast.success(`${previews.length} photo${previews.length > 1 ? "s" : ""} added`);
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPreviews([]);
      setOpen(false);
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Failed to add photos");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { previews.forEach((p) => URL.revokeObjectURL(p.previewUrl)); setPreviews([]); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={remaining <= 0}>
          <Image className="w-3 h-3" />
          {remaining <= 0 ? "Max photos" : `Add Photos (${currentCount}/${MAX_PHOTOS})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Photos — {currentCount}/{MAX_PHOTOS}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {remaining > 0 && (
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById(`photo-upload-${unitId}`)?.click()}
            >
              <input
                type="file"
                id={`photo-upload-${unitId}`}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Click to browse — up to {remaining} more photo{remaining !== 1 ? "s" : ""}</p>
            </div>
          )}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-muted">
                  <img src={p.previewUrl} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={previews.length === 0 || uploading}>
            {uploading ? "Uploading..." : `Upload ${previews.length > 0 ? previews.length : ""} Photo${previews.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleHideField({ unitId, field, value, label }: {
  unitId: string; field: "isOwnerPhoneHidden" | "isOwnerEmailHidden"; value: boolean; label: string;
}) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/resale/${unitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !value }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
      toast.success(`${label} ${!value ? "hidden" : "visible"} for sales`);
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title={value ? `Show ${label}` : `Hide ${label}`}
    >
      {value ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
      <span>{value ? "Hidden" : "Visible"}</span>
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

export function ResalePage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      projectName: "",
      unitType: "apartment",
      area: "",
      price: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      ownerNotes: "",
      description: "",
      isOwnerPhoneHidden: false,
      isOwnerEmailHidden: false,
    },
  });

  const onSubmit = (data: ResaleFormValues) => {
    createUnit.mutate(
      { data: data as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
          toast.success("Unit added successfully");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to add unit");
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      deleteUnit.mutate(
        { unitId: id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListResaleUnitsQueryKey() });
            toast.success("Unit deleted");
          }
        }
      );
    }
  };

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-";
    const num = Number(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(num);
  };

  const unitTypes = [...new Set(allUnits.map((u) => u.unitType).filter(Boolean) as string[])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resale Marketplace</h2>
          <p className="text-muted-foreground">
            {allUnits.length} units · {allUnits.filter((u) => u.isActive).length} available
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Resale Unit</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="projectName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Marina Gate" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unitType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Type</FormLabel>
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

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (EGP)</FormLabel>
                      <FormControl><Input placeholder="1500000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqm)</FormLabel>
                      <FormControl><Input placeholder="120" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="floor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the unit..." rows={2} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Owner Details</p>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="ownerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Phone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {isAdmin && (
                  <div className="flex gap-6 pt-1">
                    <FormField control={form.control} name="isOwnerPhoneHidden" render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <Label className="font-normal">Hide phone from sales</Label>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="isOwnerEmailHidden" render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <Label className="font-normal">Hide email from sales</Label>
                      </FormItem>
                    )} />
                  </div>
                )}

                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createUnit.isPending}>
                    {createUnit.isPending ? "Adding..." : "Add Unit"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project, type, or owner..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {unitTypes.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Available</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
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
          <p className="text-lg font-medium">No units found</p>
          <p className="text-sm">Try adjusting your filters or add a new unit.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {units.map((unit, i) => (
            <motion.div
              key={unit.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={CARD_VARIANTS}
              className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <PhotoGallery photos={unit.photos ?? []} unitName={unit.projectName} />

              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">{unit.projectName}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {unit.unitType ?? "Property"}
                      {unit.floor != null && ` · Floor ${unit.floor}`}
                    </p>
                  </div>
                  <Badge variant={unit.isActive ? "default" : "secondary"} className="shrink-0 text-xs">
                    {unit.isActive ? "Available" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {unit.price && (
                    <span className="font-bold text-foreground text-base">
                      {formatPrice(unit.price)}
                    </span>
                  )}
                  {unit.area && (
                    <span className="flex items-center gap-0.5">
                      <Maximize2 className="w-3 h-3" /> {unit.area} sqm
                    </span>
                  )}
                </div>

                {unit.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{unit.description}</p>
                )}

                <Separator className="my-1" />

                {/* Owner Info */}
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

                {/* Actions (admin only) */}
                {isAdmin && (
                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <ToggleHideField unitId={unit.id} field="isOwnerPhoneHidden" value={unit.isOwnerPhoneHidden} label="Phone" />
                      <ToggleHideField unitId={unit.id} field="isOwnerEmailHidden" value={unit.isOwnerEmailHidden} label="Email" />
                    </div>
                    <div className="flex items-center gap-1">
                      <AddPhotoDialog unitId={unit.id} onAdded={() => {}} currentCount={unit.photos?.length ?? 0} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
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
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {unit.photos && unit.photos.length > 0 ? (
                  <img src={unit.photos[0].url} alt={unit.projectName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{unit.projectName}</p>
                  <Badge variant={unit.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                    {unit.isActive ? "Available" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{unit.unitType ?? "Property"}{unit.floor != null ? ` · Floor ${unit.floor}` : ""}</p>
              </div>

              {/* Price + Area */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">{formatPrice(unit.price)}</p>
                {unit.area && <p className="text-xs text-muted-foreground">{unit.area} sqm</p>}
              </div>

              {/* Owner */}
              <div className="shrink-0 w-36 text-xs">
                {unit.ownerName && <p className="font-medium truncate">{unit.ownerName}</p>}
                {unit.ownerPhone && !unit.isOwnerPhoneHidden && <p className="text-muted-foreground">{unit.ownerPhone}</p>}
                {unit.ownerPhone && unit.isOwnerPhoneHidden && <p className="text-muted-foreground tracking-widest">••••••</p>}
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <AddPhotoDialog unitId={unit.id} onAdded={() => {}} currentCount={unit.photos?.length ?? 0} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(unit.id)}>
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
