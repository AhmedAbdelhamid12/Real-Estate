import React from "react";
import { User, Lock, ArrowRight } from "lucide-react";
import "./_group.css";

export function CommandCenter() {
  return (
    <div className="min-h-screen w-full command-center-bg flex items-center justify-center font-['Inter',sans-serif]">
      {/* Grid Overlay */}
      <div className="command-center-grid" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4 border border-[#C9A84C]/20 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <div className="text-[#C9A84C] font-bold text-xl tracking-tighter">TIL</div>
          </div>
          <h1 className="text-2xl font-light text-[#F8F9FC] tracking-wide mb-1">
            Real Estate Group
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]/80 font-medium">
            Agent Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-xl p-8 w-full">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#F8F9FC]/40 group-focus-within:text-[#C9A84C] transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Agent Email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg gold-input text-sm"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#F8F9FC]/40 group-focus-within:text-[#C9A84C] transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="Security Key"
                  className="w-full pl-10 pr-4 py-3 rounded-lg gold-input text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded border-[#F8F9FC]/20 bg-black/20 text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer" 
                />
                <span className="text-xs text-[#F8F9FC]/60 group-hover:text-[#F8F9FC] transition-colors">
                  Remember terminal
                </span>
              </label>
              <a href="#" className="text-xs text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors">
                Reset Key
              </a>
            </div>

            <button
              type="submit"
              className="w-full shimmer-btn py-3 rounded-lg flex items-center justify-center gap-2 group mt-6"
            >
              <span>Initialize Session</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] text-[#F8F9FC]/30 uppercase tracking-widest font-mono">
          <p>Secure Connection • v4.2.0</p>
        </div>
      </div>
    </div>
  );
}
