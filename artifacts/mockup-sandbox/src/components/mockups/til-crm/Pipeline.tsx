import React from "react";
import {
  Home,
  LayoutDashboard,
  Users,
  Trello,
  Building2,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  Search,
  Bell,
  MoreVertical,
  Plus,
  Filter,
  ChevronDown,
} from "lucide-react";

const SIDEBAR_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Contacts", id: "contacts" },
  { icon: Trello, label: "Pipeline", id: "pipeline", active: true },
  { icon: Building2, label: "Properties", id: "properties" },
  { icon: CheckSquare, label: "Tasks", id: "tasks" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: BarChart2, label: "Reports", id: "reports" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const METRICS = [
  { label: "Lead", value: "$4.2M", count: 18 },
  { label: "Qualified", value: "$6.8M", count: 12 },
  { label: "Proposal", value: "$5.1M", count: 9 },
  { label: "Negotiation", value: "$4.3M", count: 7 },
  { label: "Won", value: "$8.0M", count: 14 },
  { label: "Lost", value: "$2.1M", count: 5 },
];

const COLUMNS = [
  {
    id: "lead",
    title: "LEAD",
    color: "#64748B",
    count: 18,
    value: "$4.2M",
    deals: [
      { id: 1, address: "1420 Ocean Ave, Santa Monica", client: "Michael Chang", initials: "MC", value: "$1,250,000", prob: "20%", due: "Jun 18", agent: "SJ" },
      { id: 2, address: "8899 Beverly Blvd, West Hollywood", client: "Sarah Jenkins", initials: "SJ", value: "$2,100,000", prob: "10%", due: "Jun 20", agent: "SJ" },
      { id: 3, address: "450 Sierra Madre, Pasadena", client: "David Ross", initials: "DR", value: "$850,000", prob: "30%", due: "Jun 22", agent: "SJ" },
    ]
  },
  {
    id: "qualified",
    title: "QUALIFIED",
    color: "#3B82F6",
    count: 12,
    value: "$6.8M",
    deals: [
      { id: 4, address: "1200 Club View Dr, Los Angeles", client: "Emma Watson", initials: "EW", value: "$3,400,000", prob: "40%", due: "Jun 15", agent: "SJ" },
      { id: 5, address: "700 E Union St, Pasadena", client: "Tom Hardy", initials: "TH", value: "$1,800,000", prob: "50%", due: "Jun 19", agent: "SJ" },
      { id: 6, address: "900 W Olympic Blvd, Downtown", client: "Chris Evans", initials: "CE", value: "$1,600,000", prob: "45%", due: "Jun 25", agent: "SJ" },
    ]
  },
  {
    id: "proposal",
    title: "PROPOSAL",
    color: "#D97706",
    count: 9,
    value: "$5.1M",
    deals: [
      { id: 7, address: "2000 Avenue of the Stars", client: "Natalie Portman", initials: "NP", value: "$2,800,000", prob: "60%", due: "Jun 14", agent: "SJ" },
      { id: 8, address: "555 S Flower St, Downtown", client: "Bruce Wayne", initials: "BW", value: "$2,300,000", prob: "75%", due: "Jun 16", agent: "SJ" },
    ]
  },
  {
    id: "negotiation",
    title: "NEGOTIATION",
    color: "#EA580C",
    count: 7,
    value: "$4.3M",
    deals: [
      { id: 9, address: "101 Ocean Ave, Santa Monica", client: "Tony Stark", initials: "TS", value: "$4,300,000", prob: "90%", due: "Jun 12", agent: "SJ" },
    ]
  },
  {
    id: "won",
    title: "WON",
    color: "#16A34A",
    count: 14,
    value: "$8.0M",
    deals: [
      { id: 10, address: "9200 Sunset Blvd, West Hollywood", client: "Steve Rogers", initials: "SR", value: "$5,500,000", prob: "100%", due: "Jun 10", agent: "SJ" },
      { id: 11, address: "300 S Grand Ave, Downtown", client: "Clark Kent", initials: "CK", value: "$2,500,000", prob: "100%", due: "Jun 08", agent: "SJ" },
    ]
  },
  {
    id: "lost",
    title: "LOST",
    color: "#DC2626",
    count: 5,
    value: "$2.1M",
    deals: [
      { id: 12, address: "800 N Alameda St, Downtown", client: "Peter Parker", initials: "PP", value: "$2,100,000", prob: "0%", due: "Jun 05", agent: "SJ" },
    ]
  }
];

export default function Pipeline() {
  return (
    <div className="flex h-screen w-full bg-[#F8F9FC] font-sans overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0A1E38] text-white flex flex-col flex-shrink-0 z-20">
        <div className="h-[60px] flex items-center px-6 border-b border-white/10">
          <Home className="w-5 h-5 text-[#C9A84C] mr-3" />
          <span className="font-semibold text-lg tracking-wide text-[#C9A84C]">TIL Group</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${
                item.active 
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]" 
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#0A1E38] flex items-center justify-center font-bold text-xs">
              SJ
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Sarah Jenkins</p>
              <p className="text-xs text-gray-400">Senior Agent</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center text-sm">
            <span className="text-[#6B7280]">TIL Group</span>
            <span className="mx-2 text-[#E5E7EB]">/</span>
            <span className="font-medium text-[#0F2D52]">Pipeline</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search properties, clients..." 
                className="pl-9 pr-4 py-1.5 w-64 bg-[#F8F9FC] border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative text-[#6B7280] hover:text-[#0F2D52] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="text-[#6B7280] hover:text-[#0F2D52] transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#0A1E38] flex items-center justify-center font-bold text-xs cursor-pointer">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-6 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2D52] mb-2">Pipeline</h1>
              <div className="inline-flex items-center px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full">
                <span className="text-[#C9A84C] font-semibold">Total Pipeline Value: $28,450,000</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-[#E5E7EB] rounded-md text-[#6B7280] hover:bg-gray-50 transition-colors font-medium">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-[#E5E7EB] rounded-md text-[#6B7280] hover:bg-gray-50 transition-colors font-medium">
                Sort By
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              <button className="flex items-center px-4 py-2 bg-[#0F2D52] text-white rounded-md hover:bg-[#0A1E38] transition-colors font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </button>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="flex space-x-4 mb-6 flex-shrink-0 overflow-x-auto pb-2 custom-scrollbar">
            {METRICS.map((metric, i) => (
              <div key={i} className="flex-1 min-w-[150px] bg-white border border-[#E5E7EB] rounded-lg p-3 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#6B7280] font-medium text-xs uppercase tracking-wider">{metric.label}</span>
                  <span className="bg-[#F8F9FC] text-[#6B7280] text-xs px-2 py-0.5 rounded-full font-medium">{metric.count}</span>
                </div>
                <span className="text-[#0F2D52] font-bold text-lg">{metric.value}</span>
              </div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2 flex">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-[320px] flex-shrink-0 flex flex-col mx-2 h-full">
                {/* Column Header */}
                <div 
                  className="bg-white border-t-4 border-x border-b border-[#E5E7EB] rounded-t-lg p-3 flex justify-between items-center shadow-sm"
                  style={{ borderTopColor: col.color }}
                >
                  <div className="flex items-center">
                    <h3 className="font-bold text-[#0F2D52] mr-2 text-sm">{col.title}</h3>
                    <span className="bg-[#F8F9FC] text-[#6B7280] text-xs px-2 py-0.5 rounded-full font-medium border border-[#E5E7EB]">{col.count}</span>
                  </div>
                  <span className="font-bold text-[#6B7280] text-sm">{col.value}</span>
                </div>

                {/* Column Body */}
                <div className="flex-1 bg-gray-50/50 border-x border-[#E5E7EB] p-2 overflow-y-auto custom-scrollbar flex flex-col space-y-3">
                  {col.deals.map((deal) => (
                    <div 
                      key={deal.id}
                      className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-sm cursor-grab hover:shadow-md hover:border-[#C9A84C]/50 transition-all active:cursor-grabbing group relative"
                    >
                      <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      <p className="font-semibold text-[#0F2D52] mb-3 pr-5 line-clamp-2 leading-snug">{deal.address}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] mr-2">
                          {deal.initials}
                        </div>
                        <span className="text-[#6B7280] text-xs font-medium">{deal.client}</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-[#0F2D52] text-lg">{deal.value}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                          {deal.prob}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]/50">
                        <div className="flex items-center text-xs font-medium text-[#6B7280] bg-[#F8F9FC] px-2 py-1 rounded">
                          <Calendar className="w-3 h-3 mr-1" />
                          {deal.due}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#C9A84C] text-[#0A1E38] flex items-center justify-center font-bold text-[10px]">
                          {deal.agent}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Drop Zone */}
                  <div className="h-20 border-2 border-dashed border-[#E5E7EB] rounded-lg flex items-center justify-center text-[#6B7280] text-xs font-medium bg-transparent mt-2 opacity-50">
                    Drop deal here
                  </div>
                </div>
                
                {/* Column Footer */}
                <div className="h-2 bg-white border-x border-b border-[#E5E7EB] rounded-b-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}} />
    </div>
  );
}
