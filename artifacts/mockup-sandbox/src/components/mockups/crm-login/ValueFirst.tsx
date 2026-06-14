import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  BarChart3, 
  Search, 
  Bell, 
  ChevronDown,
  Mail,
  Lock,
  ArrowRight,
  Plus
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function ValueFirst() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FC] overflow-hidden font-['Inter',sans-serif]">
      {/* --- FAKE DASHBOARD BACKGROUND --- */}
      <div className="absolute inset-0 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#0A1E38] text-white flex flex-col border-r border-[#060F1C]">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded flex items-center justify-center font-bold text-[#0A1E38]">
              T
            </div>
            <span className="font-semibold text-lg tracking-wide">TIL Group</span>
          </div>
          
          <div className="px-4 py-6 space-y-1 flex-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#0F2D52] rounded-lg text-white">
              <LayoutDashboard size={18} className="text-[#C9A84C]" />
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white">
              <Users size={18} />
              <span className="font-medium">Leads</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white">
              <Home size={18} />
              <span className="font-medium">Properties</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white">
              <BarChart3 size={18} />
              <span className="font-medium">Reports</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F8F9FC]">
          {/* Top bar */}
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <div className="text-xl font-semibold text-[#0F2D52]">TIL CRM — Q2 2026</div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search leads, clients..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm w-64 border-none outline-none"
                />
              </div>
              <div className="relative">
                <Bell size={20} className="text-slate-500" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                <div className="w-8 h-8 rounded-full bg-[#0F2D52] text-white flex items-center justify-center font-medium text-sm">
                  AS
                </div>
                <span className="text-sm font-medium text-slate-700">Ahmed S.</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8 flex-1 flex flex-col gap-8">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Active Leads", value: "126", trend: "+12%" },
                { label: "Pipeline Value", value: "SAR 4.2M", trend: "+5%" },
                { label: "Closings This Month", value: "12", trend: "+2" },
                { label: "Conversion Rate", value: "18.4%", trend: "-1.2%" }
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-2">{kpi.label}</div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-[#0F2D52]">{kpi.value}</div>
                    <div className={`text-sm font-medium ${kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {kpi.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kanban Preview */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F2D52]">Active Pipeline (فريق المبيعات)</h2>
                <Button variant="outline" size="sm" className="gap-2 border-slate-200">
                  <Plus size={16} /> New Lead
                </Button>
              </div>
              
              <div className="flex-1 flex gap-6">
                {/* Kanban Columns */}
                {[
                  { name: "New", count: 24, color: "bg-blue-100 text-blue-700" },
                  { name: "Called", count: 45, color: "bg-amber-100 text-amber-700" },
                  { name: "Qualified", count: 18, color: "bg-purple-100 text-purple-700" },
                  { name: "Proposal", count: 8, color: "bg-green-100 text-green-700" }
                ].map((col, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-700">{col.name}</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${col.color}`}>
                        {col.count}
                      </div>
                    </div>
                    
                    {/* Dummy Cards */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((card) => (
                        <div key={card} className="bg-slate-50 p-4 rounded-lg border border-slate-200 cursor-pointer hover:border-[#C9A84C] transition-colors">
                          <div className="font-medium text-slate-900 mb-1">
                            {i === 0 ? 'Mohammed Al-Dosari' : i === 1 ? 'Sarah Abdullah' : 'Khalid Al-Faisal'}
                          </div>
                          <div className="text-xs text-slate-500 mb-3">Looking for 3BR Villa in Riyadh</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#0F2D52]">SAR {2.5 + i}M</span>
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                              {i === 0 ? 'MA' : 'SA'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- OVERLAY & BLUR --- */}
      <div className="absolute inset-0 bg-[#0A1E38]/40 backdrop-blur-md z-10"></div>

      {/* --- LOGIN MODAL --- */}
      <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Brand Header */}
          <div className="bg-[#0F2D52] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            
            <div className="w-16 h-16 bg-[#C9A84C] rounded-xl flex items-center justify-center shadow-lg mb-4 relative z-10">
              <span className="text-[#0A1E38] font-bold text-3xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-white relative z-10">TIL Group</h1>
            <p className="text-slate-300 mt-2 text-sm relative z-10">Sign in to your CRM workspace</p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Work Email</Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@tilgroup.com" 
                      className="pl-10 border-slate-200 focus-visible:ring-[#0F2D52]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <a href="#" className="text-xs font-medium text-[#0F2D52] hover:text-[#C9A84C] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 border-slate-200 focus-visible:ring-[#0F2D52]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#C9A84C] hover:bg-[#E2C37A] text-[#0A1E38] font-bold py-6 text-base transition-colors"
              >
                Sign In to CRM
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Lock size={14} />
              <span>Secure, encrypted connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
