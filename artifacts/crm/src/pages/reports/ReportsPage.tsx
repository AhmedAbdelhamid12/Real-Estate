import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetSalesReport, useGetLeadsReport, apiFetch } from "@workspace/api-client-react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CalendarIcon, TrendingUp, Download, FileDown, Home, Building } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function downloadCsv(rows: string[][], filename: string) {
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatPrice(val: number) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(val);
}

export function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fromDate = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const toDate = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  const { data: salesReport, isLoading: isSalesLoading } = useGetSalesReport({ from: fromDate, to: toDate });
  const { data: leadsReport, isLoading: isLeadsLoading } = useGetLeadsReport({ from: fromDate, to: toDate });

  const { data: resaleReport, isLoading: isResaleLoading } = useQuery({
    queryKey: ["reports", "resale", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await apiFetch(`/api/reports/resale?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load resale report");
      return res.json() as Promise<{
        total: number;
        activeCount: number;
        inactiveCount: number;
        totalValue: number;
        byType: { type: string; count: number }[];
        byProject: { project: string; count: number; totalValue: number }[];
      }>;
    },
  });

  function exportSalesReport() {
    if (!salesReport?.byUser) return;
    const rangeLabel = `${fromDate ?? "start"}_to_${toDate ?? "end"}`;
    const rows: string[][] = [
      ["Team Member", "Total Leads", "Won", "Lost", "In Progress", "Conversion Rate (%)"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...salesReport.byUser.map((p: any) => [
        p.userName,
        String(p.total ?? 0),
        String(p.won ?? 0),
        String(p.lost ?? 0),
        String(p.inProgress ?? 0),
        ((p.total ?? 0) > 0 ? (((p.won ?? 0) / (p.total ?? 1)) * 100).toFixed(1) : "0.0"),
      ]),
    ];
    downloadCsv(rows, `sales-report-${rangeLabel}.csv`);
  }

  function exportFullReport() {
    const rangeLabel = `${fromDate ?? "start"}_to_${toDate ?? "end"}`;
    const rows: string[][] = [
      [`TIL Real Estate Group — Full Report (${fromDate} → ${toDate})`],
      [],
      ["=== SALES PERFORMANCE ==="],
      ["Team Member", "Total", "Won", "Lost", "In Progress", "Conv. Rate (%)"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(salesReport?.byUser ?? []).map((p: any) => [
        p.userName,
        String(p.total ?? 0),
        String(p.won ?? 0),
        String(p.lost ?? 0),
        String(p.inProgress ?? 0),
        ((p.total ?? 0) > 0 ? (((p.won ?? 0) / (p.total ?? 1)) * 100).toFixed(1) : "0.0"),
      ]),
      [],
      ["=== LEAD SOURCES ==="],
      ["Source", "Count"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(leadsReport?.bySource ?? []).map((s: any) => [s.source, String(s.count)]),
      [],
      ["=== RESALE UNITS ==="],
      ["Project", "Units", "Total Value (AED)"],
      ...(resaleReport?.byProject ?? []).map((p) => [p.project, String(p.count), String(p.totalValue)]),
    ];
    downloadCsv(rows, `full-report-${rangeLabel}.csv`);
  }

  const sortedPerformers = [...(salesReport?.byUser ?? [])]
    .sort((a, b) => ((b.won ?? 0) / Math.max(b.total ?? 0, 1)) - ((a.won ?? 0) / Math.max(a.total ?? 0, 1)));

  const DateRangePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>{format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}</>
            ) : format(date.from, "LLL dd, y")
          ) : <span>Pick a date range</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your business performance.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker />
          <Button variant="outline" onClick={exportFullReport} disabled={isSalesLoading || isLeadsLoading}>
            <FileDown className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="resale">Resale Market</TabsTrigger>
        </TabsList>

        {/* ── SALES TAB ── */}
        <TabsContent value="sales" className="space-y-6">
          {/* KPI summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Leads", value: salesReport?.totalLeads ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Won", value: salesReport?.totalWon ?? 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Lost", value: salesReport?.totalLost ?? 0, color: "text-red-500", bg: "bg-red-500/10" },
              {
                label: "Conversion Rate",
                value: (salesReport?.totalLeads ?? 0) > 0
                  ? `${(((salesReport?.totalWon ?? 0) / (salesReport?.totalLeads ?? 1)) * 100).toFixed(1)}%`
                  : "0%",
                color: "text-violet-500", bg: "bg-violet-500/10"
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <TrendingUp className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    {isSalesLoading ? <Skeleton className="h-7 w-12 mb-0.5" /> : <p className="text-2xl font-bold">{kpi.value}</p>}
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Sales by Team Member</CardTitle>
                <CardDescription>Won / Lost / In Progress breakdown</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={exportSalesReport} disabled={isSalesLoading} className="h-8 px-2 text-muted-foreground">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="h-[350px]">
              {isSalesLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesReport?.byUser} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="userName" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                    <Legend />
                    <Bar dataKey="won" name="Won" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="lost" name="Lost" stackId="a" fill="hsl(var(--chart-5))" />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Performers Table */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Ranked by conversion rate</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportSalesReport} disabled={isSalesLoading || !salesReport?.byUser?.length}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Team Member</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Won</TableHead>
                    <TableHead className="text-right">Lost</TableHead>
                    <TableHead className="text-right">In Progress</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSalesLoading ? (
                    <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ) : sortedPerformers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No data for selected period.</TableCell>
                    </TableRow>
                  ) : sortedPerformers.map((perf, idx) => {
                    const rate = (perf.total ?? 0) > 0 ? (((perf.won ?? 0) / (perf.total ?? 1)) * 100).toFixed(1) : "0.0";
                    return (
                      <TableRow key={perf.userId}>
                        <TableCell className="text-muted-foreground font-medium">#{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={perf.userName} />
                            {perf.userName}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{perf.total ?? 0}</TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-500 font-medium">{perf.won ?? 0}</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-500">{perf.lost ?? 0}</TableCell>
                        <TableCell className="text-right text-amber-600 dark:text-amber-500">{perf.inProgress ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(parseFloat(rate), 100)}%` }} />
                            </div>
                            <span className="font-bold w-12 text-right">{rate}%</span>
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LEADS TAB ── */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of lead origins</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isLeadsLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsReport?.bySource}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="source"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {leadsReport?.bySource.map((_entry: unknown, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Status Breakdown</CardTitle>
                <CardDescription>Distribution by current status</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isLeadsLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsReport?.byStatus} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="status" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                      <Bar dataKey="count" name="Leads" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lead Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(leadsReport?.byStatus ?? []).map((s: any) => (
                    <TableRow key={s.status}>
                      <TableCell className="capitalize font-medium">{s.status}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                      <TableCell className="text-right">
                        {leadsReport?.total ? `${((s.count / leadsReport.total) * 100).toFixed(1)}%` : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leadsReport?.total && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{leadsReport.total}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RESALE TAB ── */}
        <TabsContent value="resale" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Units", value: resaleReport?.total ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Available", value: resaleReport?.activeCount ?? 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Inactive", value: resaleReport?.inactiveCount ?? 0, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Portfolio Value", value: resaleReport?.totalValue ? formatPrice(resaleReport.totalValue) : "AED 0", color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Home className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    {isResaleLoading ? <Skeleton className="h-7 w-16 mb-0.5" /> : <p className="text-lg font-bold">{kpi.value}</p>}
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Units by Type</CardTitle>
                <CardDescription>Breakdown of property types</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isResaleLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resaleReport?.byType}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="type"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(resaleReport?.byType ?? []).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Projects by Units</CardTitle>
                <CardDescription>Projects with most resale listings</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isResaleLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resaleReport?.byProject?.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="project" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                      <Bar dataKey="count" name="Units" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resale by Project</CardTitle>
              <CardDescription>Unit count and estimated portfolio value per project</CardDescription>
            </CardHeader>
            <CardContent>
              {isResaleLoading ? <Skeleton className="h-48 w-full" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Portfolio Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(resaleReport?.byProject ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No resale data for selected period.</TableCell>
                      </TableRow>
                    ) : (resaleReport?.byProject ?? []).map((p, idx) => (
                      <TableRow key={p.project}>
                        <TableCell className="text-muted-foreground">#{idx + 1}</TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {p.project}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{p.count}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {p.totalValue > 0 ? formatPrice(p.totalValue) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
