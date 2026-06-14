import { useState, useEffect } from "react";
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
import { Camera, Instagram, Facebook, MessageCircle, Link as LinkIcon, Check, Loader2 } from "lucide-react";

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
  const { currentUser, refetch } = useAuth();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const [saved, setSaved] = useState(false);

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
          toast.success("Profile updated successfully");
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          refetch();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to update profile");
        }
      }
    );
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and social links.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <UserAvatar
                name={currentUser.name}
                avatarUrl={avatarUrlValue || currentUser.avatarUrl}
                className="h-28 w-28 text-3xl"
              />
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background">
                <Camera className="w-3.5 h-3.5" />
              </div>
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
                <span className="text-muted-foreground">Status</span>
                <Badge variant={currentUser.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                  {currentUser.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{format(new Date(currentUser.createdAt), "MMM yyyy")}</span>
              </div>
              {currentUser.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
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
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details displayed to the team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
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
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior Property Consultant" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="+971..." {...field} /></FormControl>
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
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A short description about yourself..."
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
                    <Label className="text-muted-foreground text-sm">Email Address (read-only)</Label>
                    <Input value={currentUser.email} disabled className="bg-muted mt-1.5" />
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Profile Photo
                  </CardTitle>
                  <CardDescription>Paste a URL to your profile photo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5" /> Photo URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                        {avatarUrlValue && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={avatarUrlValue}
                              alt="Preview"
                              className="w-12 h-12 rounded-full object-cover border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <p className="text-xs text-muted-foreground">Preview of your new photo</p>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Social Links Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Add your social media profiles so teammates can connect.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-500" /> Instagram
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
                          <Facebook className="w-4 h-4 text-blue-600" /> Facebook
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
                          <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+971501234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={updateUser.isPending} className="ml-auto gap-2">
                    {updateUser.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : saved ? (
                      <><Check className="w-4 h-4" /> Saved!</>
                    ) : (
                      "Save Changes"
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
