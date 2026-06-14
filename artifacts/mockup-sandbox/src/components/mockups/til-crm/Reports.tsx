import React from 'react';
import { 
  Home, LayoutDashboard, Users, LayoutList, Building, 
  CheckSquare, Calendar as CalendarIcon, BarChart3, Settings, 
  Search, Bell, Download, FileText, Activity, DollarSign, Target, TrendingUp,
  TrendingDown, Minus
} from 'lucide-react';

export default function Reports() {
  const COLORS = {
    primary: '#0F2D52',
    dark: '#0A1E38',
    gold: '#C9A84C',
    bg: '#F8F9FC',
    cardBg: '#FFFFFF',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    green: '#16A34A',
    amber: '#D97706',
    red: '#DC2626',
    blue: '#3B82F6',
    purple: '#8B5CF6'
  };

  const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Contacts', icon: Users },
    { name: 'Pipeline', icon: LayoutList },
    { name: 'Properties', icon: Building },
    { name: 'Tasks', icon: CheckSquare },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Reports', icon: BarChart3, active: true },
    { name: 'Settings', icon: Settings },
  ];

  const TEAM_DATA = [
    { name: 'Sarah Jenkins', deals: 28, revenue: '$8.2M', winRate: '38%', avgSize: '$293K', trend: 'up' },
    { name: 'Michael Torres', deals: 22, revenue: '$6.1M', winRate: '31%', avgSize: '$277K', trend: 'up' },
    { name: 'Priya Kapoor', deals: 19, revenue: '$5.4M', winRate: '34%', avgSize: '$284K', trend: 'flat' },
    { name: 'David Chen', deals: 16, revenue: '$4.8M', winRate: '28%', avgSize: '$300K', trend: 'down' },
    { name: 'Amanda Ross', deals: 24, revenue: '$3.6M', winRate: '36%', avgSize: '$150K', trend: 'up' },
    { name: 'James Park', deals: 33, revenue: '$0.3M', winRate: '29%', avgSize: '$9K', trend: 'down' },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: COLORS.bg }}>
      {/* Sidebar */}
      <div style={{ width: 260, backgroundColor: COLORS.dark }} className="flex flex-col text-white shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Home size={24} style={{ color: COLORS.gold }} />
          <span className="text-xl font-bold tracking-tight" style={{ color: COLORS.gold }}>TIL Group</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active ? '' : 'hover:bg-white/5 text-gray-300 hover:text-white'
              }`}
              style={item.active ? { backgroundColor: `${COLORS.gold}33`, color: COLORS.gold } : {}}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium">
              SJ
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">Sarah Jenkins</span>
              <span className="text-xs text-gray-400">Managing Broker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-[60px] flex items-center justify-between px-6 shrink-0 z-10" style={{ backgroundColor: COLORS.cardBg, borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center text-sm text-gray-500 font-medium">
            Reports & Analytics
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search properties, clients..." 
                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  3
                </span>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Reports & Analytics</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-medium shadow-sm" style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                  <CalendarIcon size={16} className="text-gray-400" />
                  Jan 1, 2026 – Jun 14, 2026
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm" style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                  <FileText size={16} />
                  Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90" style={{ backgroundColor: COLORS.primary }}>
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { title: 'Total Revenue', value: '$28.4M', subtext: '+18.3% YoY', icon: DollarSign, color: COLORS.primary },
                { title: 'Closed Deals', value: '142', subtext: '+12% vs goal', icon: CheckSquare, color: COLORS.green },
                { title: 'Avg Deal Size', value: '$1.26M', subtext: '-2.1% YoY', icon: Target, color: COLORS.gold },
                { title: 'Win Rate', value: '34.2%', subtext: '+4.5% YoY', icon: Activity, color: COLORS.blue },
                { title: 'Pipeline Velocity', value: '47 days', subtext: '-3 days YoY', icon: TrendingUp, color: COLORS.purple },
              ].map((kpi, i) => (
                <div key={i} className="p-5 rounded-xl bg-white border shadow-sm flex flex-col" style={{ borderColor: COLORS.border }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium" style={{ color: COLORS.textMuted }}>{kpi.title}</span>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}15` }}>
                      <kpi.icon size={18} style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.primary }}>{kpi.value}</div>
                  <div className="text-xs font-medium" style={{ color: kpi.subtext.startsWith('+') ? COLORS.green : (kpi.subtext.startsWith('-') ? COLORS.red : COLORS.textMuted) }}>
                    {kpi.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Revenue by Source Donut */}
              <div className="p-6 rounded-xl bg-white border shadow-sm flex flex-col" style={{ borderColor: COLORS.border }}>
                <h3 className="text-base font-bold mb-6" style={{ color: COLORS.primary }}>Revenue by Source</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 mb-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Referral 42% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={COLORS.gold} strokeWidth="16" strokeDasharray="105.5 145.8" strokeDashoffset="0" />
                      {/* Online Portal 28% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={COLORS.primary} strokeWidth="16" strokeDasharray="70.3 181" strokeDashoffset="-105.5" />
                      {/* Open House 18% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={COLORS.blue} strokeWidth="16" strokeDasharray="45.2 206.1" strokeDashoffset="-175.8" />
                      {/* Cold Outreach 12% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={COLORS.border} strokeWidth="16" strokeDasharray="30.1 221.2" strokeDashoffset="-221" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>$28.4M</span>
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-sm">
                    {[
                      { label: 'Referral', percent: '42%', value: '$11.9M', color: COLORS.gold },
                      { label: 'Online Portal', percent: '28%', value: '$7.9M', color: COLORS.primary },
                      { label: 'Open House', percent: '18%', value: '$5.1M', color: COLORS.blue },
                      { label: 'Cold Outreach', percent: '12%', value: '$3.4M', color: COLORS.border },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span style={{ color: COLORS.textMuted }}>{item.label}</span>
                        </div>
                        <span className="font-semibold" style={{ color: COLORS.primary }}>{item.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Revenue vs Target */}
              <div className="p-6 rounded-xl bg-white border shadow-sm flex flex-col" style={{ borderColor: COLORS.border }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold" style={{ color: COLORS.primary }}>Monthly Revenue vs Target</h3>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.primary }} />
                      <span style={{ color: COLORS.textMuted }}>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 border-t-2 border-dashed" style={{ borderColor: COLORS.gold }} />
                      <span style={{ color: COLORS.textMuted }}>Target</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-end justify-between pt-4 relative mt-4 h-48">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between text-[10px]" style={{ color: COLORS.textMuted }}>
                    <div className="border-b w-full flex justify-end pb-1" style={{ borderColor: COLORS.border }}>$6M</div>
                    <div className="border-b w-full flex justify-end pb-1" style={{ borderColor: COLORS.border }}>$4M</div>
                    <div className="border-b w-full flex justify-end pb-1" style={{ borderColor: COLORS.border }}>$2M</div>
                    <div className="border-b w-full flex justify-end pb-1" style={{ borderColor: COLORS.border }}>$0</div>
                  </div>
                  {/* Target line approx */}
                  <div className="absolute left-0 right-0 top-1/3 border-t-2 border-dashed z-10" style={{ borderColor: COLORS.gold }} />
                  
                  {/* Bars */}
                  {[
                    { month: 'Jan', val: 65 },
                    { month: 'Feb', val: 75 },
                    { month: 'Mar', val: 55 },
                    { month: 'Apr', val: 85 },
                    { month: 'May', val: 95 },
                    { month: 'Jun', val: 80 },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center w-12 z-20 h-full justify-end relative">
                      <div 
                        className="w-8 rounded-t-sm transition-all hover:opacity-80" 
                        style={{ height: `${bar.val}%`, backgroundColor: COLORS.primary }} 
                      />
                      <div className="mt-2 text-xs font-medium" style={{ color: COLORS.textMuted }}>{bar.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="p-6 rounded-xl bg-white border shadow-sm flex flex-col" style={{ borderColor: COLORS.border }}>
                <h3 className="text-base font-bold mb-6" style={{ color: COLORS.primary }}>Activity Heatmap</h3>
                <div className="flex-1 flex flex-col">
                  <div className="flex text-xs mb-2 ml-6 text-gray-400 justify-between pr-4">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col text-[10px] text-gray-400 justify-between py-1">
                      <span>Mon</span><span>Wed</span><span>Fri</span>
                    </div>
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 26 }).map((_, col) => (
                        <div key={col} className="flex flex-col gap-1 flex-1">
                          {Array.from({ length: 7 }).map((_, row) => {
                            // Generate somewhat realistic looking heatmap pattern
                            const intensity = Math.random() > 0.6 ? 
                              Math.floor(Math.random() * 4) + 1 : 
                              (Math.random() > 0.8 ? 1 : 0);
                            
                            let bg = COLORS.border;
                            if (intensity === 1) bg = '#D1D5DB';
                            if (intensity === 2) bg = '#9CA3AF';
                            if (intensity === 3) bg = '#4B5563';
                            if (intensity === 4) bg = COLORS.primary;
                            if (intensity === 0) bg = '#F3F4F6';

                            return (
                              <div 
                                key={row} 
                                className="w-full aspect-square rounded-[2px]" 
                                style={{ backgroundColor: bg }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-2 text-xs" style={{ color: COLORS.textMuted }}>
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-[2px] bg-[#F3F4F6]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#D1D5DB]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#9CA3AF]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#4B5563]" />
                      <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.primary }} />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>

              {/* Team Performance Table */}
              <div className="p-6 rounded-xl bg-white border shadow-sm flex flex-col" style={{ borderColor: COLORS.border }}>
                <h3 className="text-base font-bold mb-6" style={{ color: COLORS.primary }}>Team Performance</h3>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b" style={{ borderColor: COLORS.border }}>
                        <th className="pb-3 font-semibold" style={{ color: COLORS.textMuted }}>AGENT</th>
                        <th className="pb-3 font-semibold text-right" style={{ color: COLORS.textMuted }}>DEALS CLOSED</th>
                        <th className="pb-3 font-semibold text-right" style={{ color: COLORS.textMuted }}>REVENUE</th>
                        <th className="pb-3 font-semibold text-right" style={{ color: COLORS.textMuted }}>WIN RATE</th>
                        <th className="pb-3 font-semibold text-right" style={{ color: COLORS.textMuted }}>AVG DEAL SIZE</th>
                        <th className="pb-3 font-semibold text-center" style={{ color: COLORS.textMuted }}>TREND</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: COLORS.border }}>
                      {TEAM_DATA.map((agent, i) => (
                        <tr key={agent.name} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 font-medium flex items-center gap-2" style={{ color: COLORS.primary }}>
                            {i === 0 && '🥇'}
                            {i === 1 && '🥈'}
                            {i === 2 && '🥉'}
                            {i > 2 && <span className="w-5" />}
                            {agent.name}
                          </td>
                          <td className="py-3 text-right" style={{ color: COLORS.primary }}>{agent.deals}</td>
                          <td className="py-3 text-right font-semibold" style={{ color: COLORS.primary }}>{agent.revenue}</td>
                          <td className="py-3 text-right" style={{ color: COLORS.primary }}>{agent.winRate}</td>
                          <td className="py-3 text-right" style={{ color: COLORS.textMuted }}>{agent.avgSize}</td>
                          <td className="py-3 text-center">
                            {agent.trend === 'up' && <TrendingUp size={16} className="mx-auto" style={{ color: COLORS.green }} />}
                            {agent.trend === 'flat' && <Minus size={16} className="mx-auto" style={{ color: COLORS.textMuted }} />}
                            {agent.trend === 'down' && <TrendingDown size={16} className="mx-auto" style={{ color: COLORS.red }} />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
