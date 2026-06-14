import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@workspace/api-client-react";

interface RoleBadgeProps {
  role: UserRole | string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleColor = (r: string) => {
    switch (r.toLowerCase()) {
      case "ceo":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "director":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "team_leader":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800";
      case "sales":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getLabel = (r: string) => {
    return r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Badge variant="outline" className={cn("font-medium text-xs", getRoleColor(role), className)}>
      {getLabel(role)}
    </Badge>
  );
}
