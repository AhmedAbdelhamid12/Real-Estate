import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Camera, Instagram, Facebook, MessageCircle, Check, Loader2, Upload, X } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { t } = useI18n();
  const { currentUser, refetch } = useAuth();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      title: "",
      bio: "",
      avatarUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      whatsappNumber: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        phone: currentUser.phone || "",
        title: currentUser.title || "",
        bio: currentUser.bio || "",
        avatarUrl: (currentUser as any).avatarUrl || "",
        instagramUrl: (currentUser as any).instagramUrl || "",
        facebookUrl: (currentUser as any).facebookUrl || "",
        whatsappNumber: (currentUser as any).whatsappNumber || "",
      });
    }
  }, [currentUser, form]);

  const avatarUrlValue = form.watch("avatarUrl");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      const { url } = await res.json() as { url: string };
      form.setValue("avatarUrl", url, { shouldDirty: true });
      toast.success("تم رفع الصورة بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل رفع الصورة");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  const onSubmit = (data: ProfileFormValues) => {
    if (!currentUser) return;
    updateUser.mutate(
      {
        userId: currentUser.id,
        data: {
          name: data.name,
          phone: data.phone || null,
          title: data.title || null,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          instagramUrl: data.instagramUrl || null,
          facebookUrl: data.facebookUrl || null,
          whatsappNumber: data.whatsappNumber || null,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث الملف الشخصي بنجاح");
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          refetch();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
        onError: (err: Error) => {
          toast.error(err.message || "فشل تحديث الملف الشخصي");
        }
      }
    );
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h2>
        <p className="text-muted-foreground">{t("profile.bio_placeholder")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <UserAvatar
                name={currentUser.name}
                avatarUrl={avatarUrlValue || currentUser.avatarUrl}
                className="h-28 w-28 text-3xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-xl">{currentUser.name}</h3>
            {currentUser.title && (
              <p className="text-muted-foreground text-sm mt-0.5">{currentUser.title}</p>
            )}
            <p className="text-muted-foreground text-xs mb-3">{currentUser.email}</p>
            <RoleBadge role={currentUser.role} />

            <Separator className="my-5" />

            <div className="w-full space-y-2.5 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة</span>
                <Badge variant={currentUser.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                  {currentUser.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">انضم في</span>
                <span className="font-medium">{format(new Date(currentUser.createdAt), "MMM yyyy")}</span>
              </div>
              {currentUser.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف</span>
                  <span className="font-medium text-xs">{currentUser.phone}</span>
                </div>
              )}
            </div>

            {/* Social Links Display */}
            {((currentUser as any).instagramUrl || (currentUser as any).facebookUrl || (currentUser as any).whatsappNumber) && (
              <>
                <Separator className="my-4" />
                <div className="flex gap-3">
                  {(currentUser as any).instagramUrl && (
                    <a href={(currentUser as any).instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {(currentUser as any).facebookUrl && (
                    <a href={(currentUser as any).facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {(currentUser as any).whatsappNumber && (
                    <a href={`https://wa.me/${(currentUser as any).whatsappNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-green-500 text-white hover:opacity-90 transition-opacity">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Personal Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                  <CardDescription>قم بتحديث بياناتك الظاهرة للفريق.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المسمى الوظيفي</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: مستشار عقاري أول" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl><Input placeholder="+20..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نبذة شخصية</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف مختصر عن نفسك..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-1">
                    <Label className="text-muted-foreground text-sm">البريد الإلكتروني (للقراءة فقط)</Label>
                    <Input value={currentUser.email} disabled className="bg-muted mt-1.5" />
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> صورة الملف الشخصي
                  </CardTitle>
                  <CardDescription>ارفع صورتك مباشرة من جهازك.</CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div className="flex items-center gap-4">
                    {avatarUrlValue ? (
                      <div className="relative">
                        <img
                          src={avatarUrlValue}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => form.setValue("avatarUrl", "")}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 w-5 h-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="w-full gap-2"
                      >
                        {avatarUploading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الرفع...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> تصفح من الجهاز</>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">PNG, JPG, WEBP - حجم أقصى 8MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links Card */}
              <Card>
                <CardHeader>
                  <CardTitle>روابط التواصل الاجتماعي</CardTitle>
                  <CardDescription>أضف روابط وسائل التواصل الاجتماعي الخاصة بك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-500" /> إنستغرام
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourprofile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-blue-600" /> فيسبوك
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/yourprofile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-500" /> رقم واتساب
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+201012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateUser.isPending} className="ml-auto gap-2">
                    {updateUser.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</>
                    ) : saved ? (
                      <><Check className="w-4 h-4" /> تم الحفظ!</>
                    ) : (
                      "حفظ التغييرات"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
