import React from "react";
import { User, Lock, ArrowRight, Building, Users, TrendingUp } from "lucide-react";
import "./_group.css";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function SplitStory() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans">
      {/* Left Panel - Brand Storytelling (60%) */}
      <div className="hidden lg:flex w-[60%] split-story-left text-white p-16 flex-col justify-between">
        <div className="split-story-pattern" />
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A84C] rounded-sm flex items-center justify-center">
            <span className="text-[#0A1E38] font-bold text-xl tracking-tighter">TIL</span>
          </div>
          <span className="text-xl font-semibold tracking-wide text-white">TIL Real Estate Group</span>
        </div>

        {/* Center Content / Headline */}
        <div className="relative z-10 max-w-2xl my-16">
          <div className="split-story-accent-line rounded-r-md" />
          <div className="pl-8">
            <h1 className="til-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
              Elevating real estate excellence.
            </h1>
            <p className="text-[#E2C37A] text-xl md:text-2xl font-light mb-12">
              The premier command center for high-performing property professionals.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-[#C9A84C] mb-2"><Building size={24} /></div>
                <div className="text-3xl font-bold mb-1">SAR 2.4B</div>
                <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Properties Closed</div>
              </div>
              <div>
                <div className="text-[#C9A84C] mb-2"><Users size={24} /></div>
                <div className="text-3xl font-bold mb-1">4,200+</div>
                <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Active Leads</div>
              </div>
              <div>
                <div className="text-[#C9A84C] mb-2"><TrendingUp size={24} /></div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Agent Adoption</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Testimonial */}
        <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm max-w-2xl">
          <p className="til-serif text-lg italic text-white/90 mb-4">
            "Since migrating our operations to the TIL CRM platform, our closing time has dropped by 30%. It's not just software; it's our competitive advantage in a fast-moving market."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-[#C9A84C]">
              <span className="font-semibold text-[#C9A84C]">FA</span>
            </div>
            <div>
              <div className="font-semibold text-white">Fahad Al-Rashid</div>
              <div className="text-sm text-[#E2C37A]">Senior Brokerage Director</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (40%) */}
      <div className="w-full lg:w-[40%] bg-[#F8F9FC] flex items-center justify-center p-8 md:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#0F2D52] rounded-sm flex items-center justify-center">
              <span className="text-[#C9A84C] font-bold text-xl tracking-tighter">TIL</span>
            </div>
            <span className="text-xl font-semibold tracking-wide text-[#0F2D52]">TIL Group</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#0A1E38] mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your operating system.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0A1E38] font-semibold">Corporate Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@tilgroup.com" 
                  className="pl-10 h-12 bg-white border-slate-200 login-form-input focus:ring-0 rounded-lg text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[#0A1E38] font-semibold">Password</Label>
                <a href="#" className="text-sm font-medium text-[#0F2D52] hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-white border-slate-200 login-form-input focus:ring-0 rounded-lg text-base"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 btn-primary-til text-base font-semibold rounded-lg flex items-center justify-center gap-2 mt-4">
              Access Workspace
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-12 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} TIL Real Estate Group. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
