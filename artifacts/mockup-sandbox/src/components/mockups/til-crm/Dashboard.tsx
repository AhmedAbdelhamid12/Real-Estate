import React from 'react';
import { 
  Home, Users, BarChart2, CheckSquare, Calendar, PieChart, Settings, 
  Search, Bell, Moon, TrendingUp, TrendingDown, DollarSign, Target, 
  Plus, Phone, Briefcase, MapPin, CheckCircle, Clock, ArrowRight, Sun
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full bg-[#F8F9FC] font-sans overflow-hidden text-[#0F2D52]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 20px; }
      `}} />

      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0A1E38] text-white flex flex-col flex-shrink-0 z-10 shadow-xl">
        <div className="h-[60px] flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <Home size={24} className="stroke-[1.5]" />
            <span className="text-xl font-bold tracking-tight text-white">TIL <span className="font-light">Group</span></span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Main Menu</p>
          
          <NavItem icon={<Home size={18} />} label="Dashboard" active />
          <NavItem icon={<Users size={18} />} label="Contacts" badge="12" />
          <NavItem icon={<BarChart2 size={18} />} label="Pipeline" />
          <NavItem icon={<Briefcase size={18} />} label="Properties" />
          
          <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mt-6 mb-2">Workspace</p>
          
          <NavItem icon={<CheckSquare size={18} />} label="Tasks" badge="4" />
          <NavItem icon={<Calendar size={18} />} label="Calendar" />
          <NavItem icon={<PieChart size={18} />} label="Reports" />
        </div>

        <div className="p-4 border-t border-white/10 mt-auto">
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <div className="flex items-center gap-3 mt-4 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="User" className="w-8 h-8 rounded-full border border-white/20" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Sarah Jenkins</p>
              <p className="text-xs text-white/50 truncate">sarah@tilgroup.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center text-sm">
            <span className="text-[#6B7280]">Workspace</span>
            <span className="mx-2 text-[#E5E7EB]">/</span>
            <span className="font-semibold text-[#0F2D52]">Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Search properties, clients..." 
                className="pl-9 pr-4 py-1.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-full text-sm w-[280px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4 text-[#6B7280]">
              <button className="hover:text-[#C9A84C] transition-colors"><Sun size={18} /></button>
              <button className="hover:text-[#C9A84C] transition-colors relative">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#0F2D52] to-[#1e4a82] rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-lg border border-[#0A1E38]/20">
            <div className="relative z-10">
              <p className="text-[#C9A84C] font-medium text-sm mb-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <h1 className="text-3xl font-bold mb-2">Good morning, Sarah.</h1>
              <p className="text-white/80 max-w-lg">You have 4 tasks due today and 3 new leads to review in your pipeline. It's looking like a productive day.</p>
            </div>
            
            {/* Decorative SVG */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none transform translate-y-4">
              <svg width="280" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <KpiCard 
              title="Total Revenue" 
              value="$4,285,000" 
              trend="+12.4%" 
              trendUp={true}
              icon={<DollarSign size={20} className="text-[#C9A84C]" />}
            />
            <KpiCard 
              title="Active Deals" 
              value="47" 
              trend="+3 new" 
              trendUp={true}
              icon={<Briefcase size={20} className="text-[#C9A84C]" />}
            />
            <KpiCard 
              title="New Contacts" 
              value="128" 
              trend="+8.2%" 
              trendUp={true}
              icon={<Users size={20} className="text-[#C9A84C]" />}
            />
            <KpiCard 
              title="Conversion Rate" 
              value="24.7%" 
              trend="-1.2%" 
              trendUp={false}
              icon={<Target size={20} className="text-[#C9A84C]" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Area Chart */}
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#0F2D52]">Revenue Analytics</h3>
                  <p className="text-xs text-[#6B7280]">Last 12 months performance</p>
                </div>
                <select className="text-sm bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#C9A84C]">
                  <option>This Year</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-[240px] w-full relative flex items-end">
                {/* Y Axis */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-[#6B7280]">
                  <span>$5M</span>
                  <span>$4M</span>
                  <span>$3M</span>
                  <span>$2M</span>
                  <span>$1M</span>
                  <span>$0</span>
                </div>
                {/* Chart Area */}
                <div className="ml-8 w-full h-[220px] relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-[#E5E7EB]">
                    {[0,1,2,3,4].map(i => <div key={i} className="w-full h-[1px] bg-[#E5E7EB]/50" />)}
                  </div>
                  {/* Fake SVG Area Chart */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0F2D52" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0F2D52" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20 L100,100 L0,100 Z" 
                      fill="url(#gradient)" 
                    />
                    <path 
                      d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20" 
                      fill="none" 
                      stroke="#0F2D52" 
                      strokeWidth="2" 
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                {/* X Axis */}
                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-[#6B7280]">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#0F2D52]">Pipeline Funnel</h3>
                <button className="text-[#C9A84C] hover:bg-[#C9A84C]/10 p-1 rounded transition-colors"><ArrowRight size={16} /></button>
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <FunnelBar label="Lead" value="89" percentage={100} opacity="100" />
                <FunnelBar label="Qualified" value="52" percentage={60} opacity="90" />
                <FunnelBar label="Proposal" value="34" percentage={40} opacity="70" />
                <FunnelBar label="Negotiation" value="18" percentage={25} opacity="50" />
                <FunnelBar label="Won" value="12" percentage={15} opacity="30" isGold />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Deals Table */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
                <h3 className="font-bold text-[#0F2D52]">Recent Deals</h3>
                <button className="text-sm text-[#C9A84C] font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FC] text-[#6B7280] text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Property</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3">Stage</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    <TableRow 
                      name="Michael Sterling" avatar="https://i.pravatar.cc/150?u=1"
                      property="1420 Ocean Avenue, Santa Monica" 
                      value="$2,450,000" 
                      stage="Negotiation" stageColor="orange"
                      date="Today, 10:30 AM"
                    />
                    <TableRow 
                      name="Elena Rostova" avatar="https://i.pravatar.cc/150?u=2"
                      property="Penthouse 4B, The Ritz" 
                      value="$5,100,000" 
                      stage="Proposal" stageColor="blue"
                      date="Yesterday"
                    />
                    <TableRow 
                      name="David Chen" avatar="https://i.pravatar.cc/150?u=3"
                      property="8844 Hollywood Blvd" 
                      value="$1,850,000" 
                      stage="Won" stageColor="green"
                      date="Oct 12, 2023"
                    />
                    <TableRow 
                      name="Sarah & Tom Hughes" avatar="https://i.pravatar.cc/150?u=4"
                      property="221B Baker St, Brentwood" 
                      value="$3,200,000" 
                      stage="Qualified" stageColor="gray"
                      date="Oct 10, 2023"
                    />
                    <TableRow 
                      name="Victoria Vance" avatar="https://i.pravatar.cc/150?u=5"
                      property="Estate 19, Beverly Hills" 
                      value="$12,500,000" 
                      stage="Lead" stageColor="gray"
                      date="Oct 08, 2023"
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tasks & Actions */}
            <div className="col-span-1 flex flex-col gap-6">
              
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                <h3 className="font-bold text-[#0F2D52] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E5E7EB] hover:border-[#C9A84C] hover:bg-[#F8F9FC] transition-all text-[#0F2D52] group">
                    <Plus size={20} className="mb-2 text-[#C9A84C] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">New Contact</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E5E7EB] hover:border-[#C9A84C] hover:bg-[#F8F9FC] transition-all text-[#0F2D52] group">
                    <Briefcase size={20} className="mb-2 text-[#C9A84C] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">New Deal</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E5E7EB] hover:border-[#C9A84C] hover:bg-[#F8F9FC] transition-all text-[#0F2D52] group col-span-2">
                    <Phone size={20} className="mb-2 text-[#C9A84C] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">Schedule Call</span>
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#0F2D52]">Tasks Due Today</h3>
                  <span className="bg-[#0A1E38] text-white text-xs px-2 py-0.5 rounded-full">4</span>
                </div>
                <div className="flex flex-col gap-3">
                  <TaskItem title="Call Michael re: Ocean Ave" time="2:00 PM" priority="High" />
                  <TaskItem title="Prepare Ritz Penthouse proposal" time="4:30 PM" priority="Medium" />
                  <TaskItem title="Follow up with Chen lawyers" time="5:00 PM" priority="High" />
                  <TaskItem title="Review Beverly Hills listings" time="EOD" priority="Low" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Sub-components

const NavItem = ({ icon, label, active, badge }: any) => (
  <a href="#" className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-[#C9A84C] text-white font-medium shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-[#C9A84C]' : 'bg-[#C9A84C] text-white'}`}>
        {badge}
      </span>
    )}
  </a>
);

const KpiCard = ({ title, value, trend, trendUp, icon }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-full bg-[#0A1E38]/5 flex items-center justify-center group-hover:bg-[#0A1E38]/10 transition-colors">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </div>
    </div>
    <p className="text-[#6B7280] text-sm font-medium mb-1">{title}</p>
    <p className="text-2xl font-bold text-[#0F2D52]">{value}</p>
  </div>
);

const FunnelBar = ({ label, value, percentage, opacity, isGold }: any) => (
  <div className="flex items-center gap-4 text-sm group cursor-pointer">
    <div className="w-24 text-[#6B7280] font-medium group-hover:text-[#0F2D52] transition-colors">{label}</div>
    <div className="flex-1 h-8 bg-[#F8F9FC] rounded-r-full overflow-hidden relative border border-[#E5E7EB]">
      <div 
        className={`h-full absolute left-0 top-0 transition-all duration-500 rounded-r-full flex items-center px-4 shadow-inner ${isGold ? 'bg-[#C9A84C]' : 'bg-[#0F2D52]'}`}
        style={{ width: `${percentage}%`, opacity: isGold ? 1 : Number(opacity)/100 }}
      >
        <span className="text-white font-bold text-xs">{value}</span>
      </div>
    </div>
  </div>
);

const TableRow = ({ name, avatar, property, value, stage, stageColor, date }: any) => {
  const colors: Record<string, string> = {
    orange: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20',
    blue: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    green: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    gray: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20',
  };

  return (
    <tr className="hover:bg-[#F8F9FC]/50 transition-colors cursor-pointer group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-semibold text-[#0F2D52] group-hover:text-[#C9A84C] transition-colors">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[#6B7280] max-w-[200px] truncate">{property}</td>
      <td className="px-6 py-4 font-semibold text-[#0F2D52]">{value}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[stageColor]}`}>
          {stage}
        </span>
      </td>
      <td className="px-6 py-4 text-[#6B7280] text-sm">{date}</td>
    </tr>
  );
};

const TaskItem = ({ title, time, priority }: any) => {
  const priorityColor = priority === 'High' ? 'text-[#DC2626]' : priority === 'Medium' ? 'text-[#D97706]' : 'text-[#6B7280]';
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#C9A84C] transition-colors cursor-pointer bg-[#F8F9FC]/50 hover:bg-white group">
      <div className="mt-0.5">
        <div className="w-4 h-4 rounded border border-[#E5E7EB] flex items-center justify-center text-transparent group-hover:border-[#C9A84C] transition-colors">
          <CheckCircle size={12} className="opacity-0 group-hover:opacity-50 text-[#C9A84C]" />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0F2D52] mb-1 group-hover:text-[#C9A84C] transition-colors">{title}</p>
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>
          <span className={`font-semibold ${priorityColor}`}>{priority}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
