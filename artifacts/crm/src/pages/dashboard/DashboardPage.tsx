import { useGetDashboardStats, useGetPipelineBreakdown, useGetTopPerformers, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, CheckCircle2, XCircle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineBreakdown();
  const { data: performers, isLoading: performersLoading } = useGetTopPerformers();
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your real estate pipeline and performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Leads"
          value={stats?.totalLeads}
          icon={Users}
          loading={statsLoading}
        />
        <KpiCard
          title="Active Leads"
          value={stats?.activeLeads}
          icon={TrendingUp}
          loading={statsLoading}
        />
        <KpiCard
          title="Won Leads"
          value={stats?.wonLeads}
          icon={CheckCircle2}
          loading={statsLoading}
          valueClassName="text-green-600 dark:text-green-500"
        />
        <KpiCard
          title="Lost Leads"
          value={stats?.lostLeads}
          icon={XCircle}
          loading={statsLoading}
          valueClassName="text-red-600 dark:text-red-500"
        />
        <KpiCard
          title="Total Clients"
          value={stats?.totalClients}
          icon={UserPlus}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pipeline Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
            <CardDescription>Current leads by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pipelineLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="status"
                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1).replace('_', ' ')}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            {performersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {performers?.map((performer) => (
                  <div key={performer.userId} className="flex items-center gap-4">
                    <UserAvatar name={performer.userName} avatarUrl={performer.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium leading-none truncate">{performer.userName}</p>
                        <span className="text-sm font-bold">{Math.round(performer.conversionRate ?? 0)}%</span>
                      </div>
                      <Progress value={performer.conversionRate ?? 0} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{performer.wonLeads} won</span>
                        <span className="text-[10px] text-muted-foreground">{performer.totalLeads} total</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!performers || performers.length === 0) && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No performance data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {activities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <div className="bg-primary/10 text-primary p-2 rounded-full mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        <span className="capitalize">{activity.type.replace("_", " ")}</span> on <span className="font-semibold">{activity.leadName}</span>
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.notes ?? `By ${activity.userName}`}
                    </p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No recent activity found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  valueClassName
}: {
  title: string;
  value?: number;
  icon: any;
  loading: boolean;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-2xl font-bold ${valueClassName || ''}`}>{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
