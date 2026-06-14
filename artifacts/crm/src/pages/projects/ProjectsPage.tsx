import { useState } from "react";
import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MapPin, Building2, User, ChevronRight, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().optional(),
  ownerName: z.string().optional(),
  avgPrice: z.string().optional(),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: projectsAll = [], isLoading } = useListProjects();
  const projects = search
    ? projectsAll.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : projectsAll;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      location: "",
      ownerName: "",
      avgPrice: "",
      description: "",
    },
  });

  const onSubmitCreate = (data: ProjectFormValues) => {
    createProject.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast.success("Project created successfully");
          setIsAddOpen(false);
          form.reset();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create project");
        }
      }
    );
  };

  const getStatusFormat = (status: string) => {
    switch (status) {
      case "planning": return { label: "Planning", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      case "under_construction": return { label: "Under Construction", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "completed": return { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
      case "cancelled": return { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
      default: return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your property inventory and developments.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Marina Views" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New Cairo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Developer / Owner</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Emaar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="avgPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Price (EGP)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex bg-card p-3 rounded-lg border shadow-sm max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-muted animate-pulse" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border shadow-sm">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No projects found</h3>
          <p className="text-muted-foreground mt-2">Create your first project to start tracking inventory.</p>
          <Button className="mt-6" onClick={() => setIsAddOpen(true)}>Add Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const isActive = project.isActive !== false;
            return (
              <Card key={project.id} className="group hover:border-primary/50 transition-colors flex flex-col">
                <div className="h-32 bg-muted flex items-center justify-center border-b">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <CardHeader className="p-5 pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-1" title={project.name}>{project.name}</CardTitle>
                    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 flex-1 space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.location || "No location specified"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.ownerName || "Unknown developer"}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                      <p className="font-semibold">
                        {project.avgPrice 
                          ? new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(project.avgPrice))
                          : "TBA"}
                      </p>
                    </div>
                    {(project.leadsCount ?? 0) > 0 && (
                      <Badge variant="secondary">{project.leadsCount} leads</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex gap-2">
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button variant="secondary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
