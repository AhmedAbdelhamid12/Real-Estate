import { useState } from "react";
import { useListLeads, useCreateLead, getListLeadsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useI18n } from "@/contexts/i18nContext";

const createLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  source: z.enum(["manual", "import", "campaign", "referral", "website", "social"]),
  status: z.enum(["new", "called", "qualified", "proposal", "negotiation", "won", "lost"]),
  projectId: z.string().optional(),
});

export function LeadsListPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: leads = [], isLoading } = useListLeads({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const createLead = useCreateLead();

  const form = useForm<z.infer<typeof createLeadSchema>>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "manual",
      status: "new",
    },
  });

  const onSubmit = (values: z.infer<typeof createLeadSchema>) => {
    createLead.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast.success("Lead created successfully");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create lead");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("leads.title")}</h2>
          <p className="text-muted-foreground">{t("leads.subtitle")}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("leads.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Create a new lead to track in your pipeline.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+20..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="walk_in">Walk-in</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="called">Called</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLead.isPending}>
                    {createLead.isPending ? "Creating..." : "Create Lead"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("leads.search")}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("leads.all_statuses")}</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="called">Called</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("leads.col.name")}</TableHead>
              <TableHead>{t("common.phone")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("leads.col.source")}</TableHead>
              <TableHead>{t("leads.col.project")}</TableHead>
              <TableHead>{t("leads.col.assignee")}</TableHead>
              <TableHead>{t("leads.col.created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  {t("leads.no_leads")}
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setLocation(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{lead.phone}</div>
                    {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <SourceBadge source={lead.source} />
                  </TableCell>
                  <TableCell className="text-sm">{lead.projectName || "-"}</TableCell>
                  <TableCell>
                    {lead.primarySalesId ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar name={lead.primarySalesName || "Unknown"} />
                        <span className="text-sm">{lead.primarySalesName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.lastActionAt ? format(new Date(lead.lastActionAt), "MMM d, yyyy") : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
