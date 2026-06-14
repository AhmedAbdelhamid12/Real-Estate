import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  BarChart2, 
  MapPin, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  PieChart, 
  Settings, 
  Search, 
  Bell, 
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Edit2,
  Plus,
  MessageSquare,
  FileText,
  Handshake,
  MoreVertical,
  Linkedin,
  Instagram,
  Twitter,
  Briefcase
} from 'lucide-react';

export default function ContactDetail() {
  const [activeTab, setActiveTab] = useState('Note');

  return (
    <div className="flex h-screen overflow-hidden font-sans text-gray-900" style={{ backgroundColor: '#F8F9FC' }}>
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: '#0A1E38', color: '#FFFFFF' }}>
        <div>
          {/* Logo */}
          <div className="h-[60px] flex items-center px-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Home className="w-6 h-6 mr-3" style={{ color: '#C9A84C' }} />
            <span className="text-xl font-bold tracking-tight">TIL Group</span>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1">
            <NavItem icon={<PieChart className="w-5 h-5" />} label="Dashboard" />
            <NavItem icon={<Users className="w-5 h-5" />} label="Contacts" active />
            <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Pipeline" />
            <NavItem icon={<MapPin className="w-5 h-5" />} label="Properties" />
            <NavItem icon={<CheckSquare className="w-5 h-5" />} label="Tasks" />
            <NavItem icon={<CalendarIcon className="w-5 h-5" />} label="Calendar" />
            <NavItem icon={<FileText className="w-5 h-5" />} label="Reports" />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
          </nav>
        </div>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm font-semibold overflow-hidden border-2" style={{ borderColor: '#C9A84C' }}>
              SJ
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Sarah Jenkins</p>
              <p className="text-xs text-gray-400">Agent</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          {/* Breadcrumb */}
          <div className="flex items-center text-sm" style={{ color: '#6B7280' }}>
            <span className="hover:text-gray-900 cursor-pointer">Contacts</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="font-medium" style={{ color: '#0F2D52' }}>James Whitfield</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search properties, clients..." 
                className="pl-9 pr-4 py-2 w-64 rounded-full border text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F8F9FC', focusRingColor: '#0F2D52' }}
              />
            </div>
            
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="relative cursor-pointer hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] text-white font-bold" style={{ backgroundColor: '#DC2626' }}>3</span>
              </div>
              <Settings className="w-5 h-5 cursor-pointer hover:text-gray-900" />
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold cursor-pointer border" style={{ borderColor: '#E5E7EB', color: '#0F2D52' }}>
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 flex gap-6" style={{ backgroundColor: '#F8F9FC' }}>
          {/* Left Panel */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="rounded-xl shadow-sm p-6 flex flex-col items-center text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-sm" style={{ backgroundColor: '#0F2D52' }}>
                JW
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#0F2D52' }}>James Whitfield</h2>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Senior Property Investor</p>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Whitfield Capital Group</p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Investor</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#C9A84C20', color: '#D97706' }}>VIP</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">Luxury</span>
              </div>

              <div className="w-full mb-6 text-left">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>LEAD SCORE</span>
                  <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>94/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '94%', backgroundColor: '#C9A84C' }}></div>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm text-left mb-6 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span className="truncate">james.whitfield@whitfieldcap.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span>(310) 555-0182</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#6B7280' }} />
                  <span>Beverly Hills, CA 90210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span className="text-blue-600 hover:underline cursor-pointer">whitfieldcapital.com</span>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100">
                  <Linkedin className="w-4 h-4" style={{ color: '#0F2D52' }} />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100">
                  <Instagram className="w-4 h-4" style={{ color: '#0F2D52' }} />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100">
                  <Twitter className="w-4 h-4" style={{ color: '#0F2D52' }} />
                </div>
              </div>

              <div className="w-full space-y-2">
                <button className="w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 border hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#0F2D52' }}>
                  <Edit2 className="w-4 h-4" />
                  Edit Contact
                </button>
                <button className="w-full py-2 px-4 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#0F2D52' }}>
                  <Plus className="w-4 h-4" />
                  Log Activity
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-xl shadow-sm p-5 border text-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>ASSIGNED AGENT</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold" style={{ color: '#0F2D52' }}>SJ</div>
                    <span className="font-medium" style={{ color: '#0F2D52' }}>Sarah Jenkins</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>SOURCE</p>
                  <p className="font-medium" style={{ color: '#0F2D52' }}>Referral</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>CREATED</p>
                  <p className="font-medium" style={{ color: '#0F2D52' }}>March 12, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Timeline */}
          <div className="flex-1 flex flex-col gap-6 max-w-3xl">
            {/* Composer */}
            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
                {['Email', 'Call', 'Meeting', 'Note'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2' : 'hover:bg-gray-50'}`}
                    style={{ 
                      color: activeTab === tab ? '#0F2D52' : '#6B7280',
                      borderBottomColor: activeTab === tab ? '#0F2D52' : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {tab === 'Email' && <Mail className="w-4 h-4" />}
                      {tab === 'Call' && <Phone className="w-4 h-4" />}
                      {tab === 'Meeting' && <Users className="w-4 h-4" />}
                      {tab === 'Note' && <FileText className="w-4 h-4" />}
                      {tab}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-white">
                <textarea 
                  placeholder={`Write a ${activeTab.toLowerCase()}...`}
                  className="w-full h-24 resize-none outline-none text-sm placeholder-gray-400"
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:opacity-90" style={{ backgroundColor: '#0F2D52' }}>
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative pl-4">
              <div className="absolute top-0 bottom-0 left-[27px] w-px bg-gray-200"></div>

              {/* Items */}
              <TimelineItem 
                icon={<Users className="w-4 h-4 text-white" />}
                iconBg="#16A34A"
                title="Meeting"
                subtitle="Q2 Portfolio Review"
                desc="Discussed 3 luxury listings in BH. Client prefers modern architecture, min 5BR."
                date="June 12, 2:00 PM"
              />
              <TimelineItem 
                icon={<Mail className="w-4 h-4 text-white" />}
                iconBg="#3B82F6"
                title="Email sent"
                subtitle="Property Proposal: 1420 Ocean Ave"
                date="June 10"
              />
              <TimelineItem 
                icon={<Phone className="w-4 h-4 text-white" />}
                iconBg="#D97706"
                title="Call"
                subtitle="18 min"
                desc="Interested in Malibu beachfront properties."
                date="June 8"
              />
              <TimelineItem 
                icon={<FileText className="w-4 h-4 text-white" />}
                iconBg="#6B7280"
                title="Note"
                desc="Client prefers modern architecture, min 5BR."
                date="June 5"
              />
              <TimelineItem 
                icon={<Handshake className="w-4 h-4 text-white" />}
                iconBg="#C9A84C"
                title="Deal created"
                subtitle="$4.5M — Bel Air Estate"
                date="May 28"
              />
              <TimelineItem 
                icon={<Mail className="w-4 h-4 text-white" />}
                iconBg="#3B82F6"
                title="Email"
                subtitle="Welcome email sent"
                date="March 12, 2024"
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-6">
            {/* Deals */}
            <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm" style={{ color: '#0F2D52' }}>Related Deals</h3>
                <button className="text-gray-400 hover:text-gray-900"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <DealCard title="1420 Ocean Ave" value="$5.2M" stage="Negotiation" progress={80} color="#16A34A" />
                <DealCard title="Bel Air Estate" value="$4.5M" stage="Under Contract" progress={90} color="#C9A84C" />
                <DealCard title="714 West 5th St" value="$2.8M" stage="Discovery" progress={20} color="#3B82F6" />
              </div>
            </div>

            {/* Tasks */}
            <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm" style={{ color: '#0F2D52' }}>Upcoming Tasks</h3>
                <button className="text-gray-400 hover:text-gray-900"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <TaskItem text="Send Q2 Market Report" date="Tomorrow" priority="High" />
                <TaskItem text="Follow up on Malibu prop" date="Jun 15" priority="Med" />
                <TaskItem text="Schedule property tour" date="Jun 18" priority="Low" />
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm" style={{ color: '#0F2D52' }}>Notes</h3>
                <button className="text-gray-400 hover:text-gray-900"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-yellow-50/50 border-yellow-100">
                  <p className="text-xs text-gray-700 leading-relaxed">Wife's name is Clara. Kids go to school in Brentwood. Priority is proximity to school.</p>
                  <p className="text-[10px] text-gray-400 mt-2">Added May 14</p>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50/50 border-blue-100">
                  <p className="text-xs text-gray-700 leading-relaxed">Looking for 1031 exchange options before EOY.</p>
                  <p className="text-[10px] text-gray-400 mt-2">Added Apr 2</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Subcomponents
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-opacity-20' : 'hover:bg-white hover:bg-opacity-5'}`}
      style={active ? { backgroundColor: '#C9A84C33', color: '#C9A84C' } : { color: '#9CA3AF' }}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </a>
  );
}

function TimelineItem({ icon, iconBg, title, subtitle, desc, date }: any) {
  return (
    <div className="relative flex gap-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 shrink-0" style={{ backgroundColor: iconBg, border: '2px solid white' }}>
        {icon}
      </div>
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: '#0F2D52' }}>{title}</span>
              {subtitle && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600 font-medium">{subtitle}</span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          {desc && <p className="text-sm text-gray-600 mt-2">{desc}</p>}
        </div>
      </div>
    </div>
  );
}

function DealCard({ title, value, stage, progress, color }: any) {
  return (
    <div className="p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-bold" style={{ color: '#0F2D52' }}>{title}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">{value}</p>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${color}15`, color }}>{stage}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

function TaskItem({ text, date, priority }: any) {
  const priorityColor = priority === 'High' ? '#DC2626' : priority === 'Med' ? '#D97706' : '#16A34A';
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 group">
      <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
      <div className="flex-1">
        <p className="text-sm text-gray-800 group-hover:text-black transition-colors">{text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{date}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-[10px] font-medium px-1.5 rounded" style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}>{priority}</span>
        </div>
      </div>
    </div>
  );
}
