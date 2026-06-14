import React, { useState } from "react";
import {
  House,
  LayoutDashboard,
  Users,
  KanbanSquare,
  Building2,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  LayoutGrid,
  Filter,
  Download,
  MoreHorizontal,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag,
  Trash2,
  Archive,
  UserPlus
} from "lucide-react";

export default function Contacts() {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "kanban">("table");

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FC] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] bg-[#0A1E38] text-slate-300 flex flex-col flex-shrink-0 z-20">
        <div className="h-[60px] flex items-center px-6 border-b border-white/10">
          <House className="text-[#C9A84C] w-6 h-6 mr-3" />
          <span className="text-white font-semibold text-lg tracking-wide">TIL Group</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Contacts", icon: Users, active: true },
              { name: "Pipeline", icon: KanbanSquare },
              { name: "Properties", icon: Building2 },
              { name: "Tasks", icon: CheckSquare },
              { name: "Calendar", icon: CalendarDays },
              { name: "Reports", icon: BarChart3 },
              { name: "Settings", icon: Settings },
            ].map((item) => (
              <a
                key={item.name}
                href="#"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${item.active ? "text-[#C9A84C]" : "text-slate-400"}`}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=sarah" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Sarah Jenkins</p>
              <p className="text-xs text-slate-400">Senior Broker</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center text-sm">
            <span className="text-[#6B7280]">Home</span>
            <span className="mx-2 text-[#E5E7EB]">/</span>
            <span className="font-medium text-[#0F2D52]">Contacts</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search properties, clients..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-4 text-[#6B7280]">
              <button className="relative hover:text-[#0F2D52] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  3
                </span>
              </button>
              <button className="hover:text-[#0F2D52] transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ml-2 border border-[#E5E7EB]">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="User" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Contacts", value: "1,842", trend: "+12% vs last month" },
              { label: "Active", value: "1,204", trend: "+5% vs last month" },
              { label: "New This Month", value: "128", trend: "+18% vs last month" },
              { label: "VIP Clients", value: "47", trend: "Stable" },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[#6B7280] text-sm font-medium">{stat.label}</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-semibold text-[#0F2D52]">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-[#0F2D52]">Contacts</h1>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-64 pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-[#F8F9FC] text-[#0F2D52] shadow-sm' : 'text-[#6B7280] hover:text-[#0F2D52]'}`}
                >
                  <MoreHorizontal className="w-4 h-4" /> {/* Fallback icon, imagine it's a table icon */}
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#F8F9FC] text-[#0F2D52] shadow-sm' : 'text-[#6B7280] hover:text-[#0F2D52]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("kanban")}
                  className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-[#F8F9FC] text-[#0F2D52] shadow-sm' : 'text-[#6B7280] hover:text-[#0F2D52]'}`}
                >
                  <KanbanSquare className="w-4 h-4" />
                </button>
              </div>

              <button className="flex items-center px-3 py-2 bg-white border border-[#E5E7EB] text-[#0F2D52] rounded-lg text-sm font-medium hover:bg-[#F8F9FC]">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              
              <button className="flex items-center px-3 py-2 bg-white border border-[#E5E7EB] text-[#0F2D52] rounded-lg text-sm font-medium hover:bg-[#F8F9FC]">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              <button className="flex items-center px-4 py-2 bg-[#0F2D52] text-[#C9A84C] border border-[#0F2D52] rounded-lg text-sm font-medium hover:bg-[#0A1E38] transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </button>
            </div>
          </div>

          <div className="flex flex-1 gap-6">
            {/* Filter Sidebar */}
            <div className="w-[220px] flex-shrink-0 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Status</h3>
                <div className="space-y-2">
                  {['All', 'Active', 'Inactive', 'Lead', 'VIP'].map(status => (
                    <label key={status} className="flex items-center text-sm text-[#0F2D52] cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-[#E5E7EB] text-[#C9A84C] focus:ring-[#C9A84C]" defaultChecked={status === 'All'} />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Lead Score</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#0F2D52] font-medium">High</span>
                    <span className="text-[#6B7280]">80+</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16A34A] w-[100%] rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-[#0F2D52] font-medium">Medium</span>
                    <span className="text-[#6B7280]">50-79</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D97706] w-[60%] rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-[#0F2D52] font-medium">Low</span>
                    <span className="text-[#6B7280]">&lt;50</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#DC2626] w-[30%] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Location</h3>
                <div className="space-y-2">
                  {['Beverly Hills', 'Santa Monica', 'Malibu', 'Bel Air', 'Hollywood Hills'].map(loc => (
                    <label key={loc} className="flex items-center text-sm text-[#0F2D52] cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-[#E5E7EB] text-[#C9A84C] focus:ring-[#C9A84C]" />
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Buyer', 'Seller', 'Investor', 'Luxury', 'First-time'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white border border-[#E5E7EB] text-[#6B7280] text-xs rounded-md cursor-pointer hover:border-[#C9A84C] hover:text-[#0F2D52]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col relative">
              
              {/* Bulk Actions overlay */}
              {selectedContacts.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-12 bg-[#0F2D52] text-white flex items-center justify-between px-4 z-10 animate-in slide-in-from-top-2">
                  <div className="flex items-center">
                    <button onClick={() => setSelectedContacts([])} className="mr-4 text-slate-300 hover:text-white">
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span className="font-medium">{selectedContacts.length} contacts selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1.5 text-sm hover:bg-white/10 rounded-md transition-colors">
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </button>
                    <button className="flex items-center px-3 py-1.5 text-sm hover:bg-white/10 rounded-md transition-colors">
                      <Tag className="w-4 h-4 mr-2" /> Add Tag
                    </button>
                    <button className="flex items-center px-3 py-1.5 text-sm hover:bg-white/10 rounded-md transition-colors">
                      <UserPlus className="w-4 h-4 mr-2" /> Assign Agent
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                    <button className="flex items-center px-3 py-1.5 text-sm text-[#EF4444] hover:bg-white/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8F9FC] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      <th className="p-4 w-12">
                        <input 
                          type="checkbox" 
                          className="rounded border-[#E5E7EB] text-[#C9A84C] focus:ring-[#C9A84C]"
                          checked={selectedContacts.length === contacts.length && contacts.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Lead Score</th>
                      <th className="p-4">Last Activity</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {contacts.map((contact) => (
                      <tr 
                        key={contact.id} 
                        className={`hover:bg-[#F8F9FC]/50 transition-colors group ${selectedContacts.includes(contact.id) ? 'bg-[#F8F9FC]' : ''}`}
                      >
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-[#E5E7EB] text-[#C9A84C] focus:ring-[#C9A84C]"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleSelect(contact.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${contact.color}`}>
                              {contact.initials}
                            </div>
                            <span className="ml-3 font-medium text-[#0F2D52]">{contact.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#6B7280]">{contact.company}</td>
                        <td className="p-4 text-sm text-[#6B7280]">
                          <div className="flex items-center group/email cursor-pointer">
                            {contact.email}
                            <Copy className="w-3.5 h-3.5 ml-2 text-[#E5E7EB] group-hover/email:text-[#6B7280] transition-colors" />
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#6B7280]">{contact.phone}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(contact.status)}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="p-4 w-32">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getScoreColor(contact.score)}`} 
                                style={{ width: `${contact.score}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-[#6B7280] w-6 text-right">{contact.score}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#6B7280]">{contact.lastActivity}</td>
                        <td className="p-4 text-right">
                          <button className="text-[#E5E7EB] hover:text-[#0F2D52] transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between bg-white mt-auto">
                <span className="text-sm text-[#6B7280]">Showing 1-12 of 1,842</span>
                <div className="flex items-center space-x-1">
                  <button className="p-1 rounded text-[#6B7280] hover:bg-[#F8F9FC] disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-8 h-8 rounded bg-[#0F2D52] text-white text-sm font-medium">1</button>
                  <button className="w-8 h-8 rounded text-[#6B7280] hover:bg-[#F8F9FC] text-sm font-medium">2</button>
                  <button className="w-8 h-8 rounded text-[#6B7280] hover:bg-[#F8F9FC] text-sm font-medium">3</button>
                  <span className="px-1 text-[#6B7280]">...</span>
                  <button className="w-8 h-8 rounded text-[#6B7280] hover:bg-[#F8F9FC] text-sm font-medium">154</button>
                  <button className="p-1 rounded text-[#6B7280] hover:bg-[#F8F9FC]">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helpers
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20';
    case 'VIP': return 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20';
    case 'Lead': return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
    default: return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-[#16A34A]';
  if (score >= 50) return 'bg-[#D97706]';
  return 'bg-[#DC2626]';
};

// Data
const contacts = [
  { id: 1, initials: 'JW', color: 'bg-blue-600', name: 'James Whitfield', company: 'Whitfield Estates', email: 'james@whitfield.com', phone: '(310) 555-0192', status: 'VIP', score: 92, lastActivity: '2 hours ago' },
  { id: 2, initials: 'PK', color: 'bg-purple-600', name: 'Priya Kapoor', company: 'Kapoor Holdings', email: 'p.kapoor@holdings.co', phone: '(310) 555-4821', status: 'Active', score: 85, lastActivity: 'Yesterday' },
  { id: 3, initials: 'MC', color: 'bg-emerald-600', name: 'Michael Chen', company: 'Chen Investments', email: 'mchen@invest.net', phone: '(424) 555-9932', status: 'Lead', score: 64, lastActivity: 'Yesterday' },
  { id: 4, initials: 'SL', color: 'bg-amber-600', name: 'Sarah Lancaster', company: 'Independent', email: 'sarah.l@gmail.com', phone: '(310) 555-1123', status: 'Active', score: 78, lastActivity: '2 days ago' },
  { id: 5, initials: 'DR', color: 'bg-rose-600', name: 'David Roth', company: 'Roth & Co', email: 'david@rothco.com', phone: '(323) 555-8845', status: 'Inactive', score: 25, lastActivity: '1 week ago' },
  { id: 6, initials: 'EM', color: 'bg-indigo-600', name: 'Elena Martinez', company: 'Malibu Shores LLC', email: 'elena@malibushores.com', phone: '(310) 555-6671', status: 'VIP', score: 95, lastActivity: 'Just now' },
  { id: 7, initials: 'TB', color: 'bg-cyan-600', name: 'Thomas Black', company: 'Blackwood Dev', email: 'thomas@blackwood.dev', phone: '(424) 555-2290', status: 'Lead', score: 45, lastActivity: '3 days ago' },
  { id: 8, initials: 'AJ', color: 'bg-pink-600', name: 'Amanda Jones', company: 'First Time Buyer', email: 'ajones88@yahoo.com', phone: '(323) 555-5542', status: 'Active', score: 72, lastActivity: 'Yesterday' },
  { id: 9, initials: 'RK', color: 'bg-orange-600', name: 'Robert King', company: 'King Enterprises', email: 'robert@kingent.com', phone: '(310) 555-9081', status: 'VIP', score: 88, lastActivity: '4 hours ago' },
  { id: 10, initials: 'CW', color: 'bg-teal-600', name: 'Catherine Wright', company: 'Bel Air Properties', email: 'cat.wright@belair.com', phone: '(424) 555-3344', status: 'Active', score: 81, lastActivity: '2 days ago' },
  { id: 11, initials: 'DL', color: 'bg-violet-600', name: 'Daniel Lee', company: 'Independent', email: 'danlee@gmail.com', phone: '(323) 555-7765', status: 'Lead', score: 55, lastActivity: '5 days ago' },
  { id: 12, initials: 'SF', color: 'bg-slate-600', name: 'Sophie Foster', company: 'Foster Realty', email: 'sophie@foster.com', phone: '(310) 555-2211', status: 'Inactive', score: 30, lastActivity: '2 weeks ago' },
];
