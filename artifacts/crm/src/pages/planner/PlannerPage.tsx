import { useState } from "react";
import { 
  useListPlannerTasks, 
  useCreatePlannerTask, 
  useUpdatePlannerTask, 
  useDeletePlannerTask,
  getListPlannerTasksQueryKey 
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Trash2, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlannerPage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, "yyyy-MM-dd");

  const { data: tasks = [], isLoading } = useListPlannerTasks({ 
    userId: currentUser?.id,
    date: dateStr 
  });

  const createTask = useCreatePlannerTask();
  const updateTask = useUpdatePlannerTask();
  const deleteTask = useDeletePlannerTask();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask.mutate(
      { data: { title: newTaskTitle, priority: newTaskPriority, date: dateStr } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPlannerTasksQueryKey() });
          setNewTaskTitle("");
          toast.success("Task added");
        }
      }
    );
  };

  const handleToggleDone = (taskId: string, currentDone: boolean) => {
    updateTask.mutate(
      { taskId, data: { isDone: !currentDone } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPlannerTasksQueryKey() })
      }
    );
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(
      { taskId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPlannerTasksQueryKey() });
          toast.success("Task deleted");
        }
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "medium": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "low": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default: return "";
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    const pWeight = { high: 3, medium: 2, low: 1 };
    const pA = pWeight[a.priority as keyof typeof pWeight] || 0;
    const pB = pWeight[b.priority as keyof typeof pWeight] || 0;
    return pB - pA;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Planner</h2>
          <p className="text-muted-foreground">Manage your tasks and schedule.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="text-lg flex justify-between items-center">
            Tasks for {format(date, "EEEE, MMMM d")}
            <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
              {tasks.filter(t => t.isDone).length} / {tasks.length} completed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No tasks scheduled for this day.</p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 group",
                    task.isDone && "bg-muted/10"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 cursor-grab shrink-0 hidden sm:block" />
                  
                  <Checkbox 
                    checked={task.isDone} 
                    onCheckedChange={() => handleToggleDone(task.id, task.isDone)}
                    className="h-5 w-5 rounded-sm"
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className={cn(
                      "font-medium text-sm sm:text-base leading-tight truncate",
                      task.isDone && "text-muted-foreground line-through"
                    )}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className={cn("w-fit px-1.5 py-0 text-[10px] uppercase", getPriorityColor(task.priority))}>
                      {task.priority}
                    </Badge>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t bg-muted/10">
            <form onSubmit={handleAdd} className="flex gap-3">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-background"
              />
              <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                <SelectTrigger className="w-[110px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!newTaskTitle.trim() || createTask.isPending}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
