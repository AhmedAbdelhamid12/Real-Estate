import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/i18nContext";
import { useListLeads, useListPlannerTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import {
  TrendingUp, Target, Users, Calendar,
  CheckCircle2, Clock, AlertCircle, Flame,
  Home, BarChart2, User, ChevronRight, ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";

function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t("home.greeting_morning");
  if (h < 17) return t("home.greeting_afternoon");
  return t("home.greeting_evening");
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: "spring" as const, stiffness: 300, damping: 28 }
  }),
};

interface NavCubeProps {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  gradient: string;
  iconBg: string;
  stats?: { label: string; value: number | string }[];
  delay: number;
}

function NavCube({ icon: Icon, label, description, href, gradient, iconBg, stats, delay }: NavCubeProps) {
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();

  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(href)}
    >
      <motion.div
        animate={{
          scale: hovered ? 1.03 : 1,
          y: hovered ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative cursor-pointer rounded-2xl p-6 overflow-hidden shadow-lg border-0 ${gradient} min-h-[160px] flex flex-col justify-between`}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-4 pointer-events-none" />

        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-3 shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-bold text-lg leading-tight">{label}</h3>
          <p className="text-white/70 text-xs mt-1">{description}</p>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-4">
          <div className="flex gap-3">
            {stats?.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-xl leading-none">{s.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <motion.div
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white/20 rounded-full p-1.5"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        {/* Hover popup */}
        <AnimatePresence>
          {hovered && stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-x-0 bottom-full mb-2 mx-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-border p-3 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                Click to open <ChevronRight className="w-3 h-3" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function HomePage() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const { data: leads = [], isLoading: leadsLoading } = useListLeads();
  const { data: tasks = [], isLoading: tasksLoading } = useListPlannerTasks();

  if (!currentUser) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myLeads = leads.filter((l: any) => l.primarySalesId === currentUser.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeLeads = myLeads.filter((l: any) => !["won", "lost"].includes(l.status));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wonLeads = myLeads.filter((l: any) => l.status === "won");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lostLeads = myLeads.filter((l: any) => l.status === "lost");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayTasks = tasks.filter((task: any) => {
    if (!task.dueDate) return false;
    const d = new Date(task.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingTasks = todayTasks.filter((t: any) => t.status !== "done");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueTasks = myLeads.filter((l: any) => {
    if (!l.deadline) return false;
    return new Date(l.deadline) < new Date() && !["won", "lost"].includes(l.status);
  });

  const kpis = [
    { label: t("home.my_leads"), value: activeLeads.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Won", value: wonLeads.length, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Overdue", value: overdueTasks.length, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: t("home.todays_tasks"), value: pendingTasks.length, icon: Target, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  const navCubes: NavCubeProps[] = [
    {
      icon: Users,
      label: "My Leads",
      description: "Manage & track your leads",
      href: "/leads",
      gradient: "bg-gradient-to-br from-blue-600 to-blue-800",
      iconBg: "bg-blue-500",
      stats: [
        { label: "Active", value: activeLeads.length },
        { label: "Won", value: wonLeads.length },
        { label: "Overdue", value: overdueTasks.length },
        { label: "Lost", value: lostLeads.length },
      ],
      delay: 0,
    },
    {
      icon: Home,
      label: "Resale Units",
      description: "Secondary market properties",
      href: "/resale",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-700",
      iconBg: "bg-amber-500",
      stats: [],
      delay: 1,
    },
    {
      icon: Calendar,
      label: "Daily Planner",
      description: "Today's tasks & schedule",
      href: "/planner",
      gradient: "bg-gradient-to-br from-violet-600 to-purple-800",
      iconBg: "bg-violet-500",
      stats: [
        { label: "Today", value: todayTasks.length },
        { label: "Pending", value: pendingTasks.length },
        { label: "Done", value: todayTasks.length - pendingTasks.length },
        { label: "Total", value: tasks.length },
      ],
      delay: 2,
    },
    {
      icon: User,
      label: "My Profile",
      description: "Account & social settings",
      href: "/profile",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-700",
      iconBg: "bg-emerald-500",
      stats: [],
      delay: 3,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting(t)}, {currentUser.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* 4 Large Animated Navigation Cubes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {navCubes.map((cube) => (
          <NavCube key={cube.label} {...cube} />
        ))}
      </div>

      {/* KPI Floating Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} custom={i + 4} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-default">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  {leadsLoading || tasksLoading
                    ? <Skeleton className="h-7 w-10 mb-1" />
                    : <p className="text-2xl font-bold">{kpi.value}</p>
                  }
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Leads */}
        <motion.div custom={8} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">{t("home.my_leads")}</CardTitle>
              <Link href="/leads">
                <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {leadsLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                : activeLeads.length === 0
                  ? <div className="text-center py-8 text-muted-foreground text-sm">{t("common.empty")}</div>
                  : activeLeads.slice(0, 6).map((lead: any) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.projectName ?? "No project"}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lead.deadline && new Date(lead.deadline) < new Date() && (
                            <Flame className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <StatusBadge status={lead.status} />
                        </div>
                      </div>
                    </Link>
                  ))
              }
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div custom={9} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">{t("home.todays_tasks")}</CardTitle>
              <Link href="/planner">
                <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasksLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)
                : todayTasks.length === 0
                  ? <div className="text-center py-8 text-muted-foreground text-sm">No tasks for today</div>
                  : todayTasks.slice(0, 6).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      {task.status === "done"
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      }
                      <span className={`text-sm flex-1 truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {task.priority}
                      </Badge>
                    </div>
                  ))
              }
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
