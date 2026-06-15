import React from "react";
import { Building, Lock, Mail, ChevronLeft } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function HierarchyFirst() {
  return (
    <div 
      className="min-h-[100dvh] w-full flex bg-[#EEF2F8] text-[#0D1E35] font-sans antialiased"
      dir="rtl"
    >
      {/* Left/Main Column - Task Focused */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10">
        
        {/* Brand - Top level hierarchy */}
        <div className="absolute top-8 right-8 lg:top-12 lg:right-12 flex items-center gap-3 text-[#c8a84b]">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-[#c8a84b]/20">
            <Building className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0D1E35]">مجموعة تيل العقارية</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-10">
          
          {/* Task Declaration - Level 2 */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-[#0D1E35]">تسجيل الدخول</h1>
            <p className="text-[#0D1E35]/60 text-lg">
              أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم الخاصة بك.
            </p>
          </div>

          {/* Form - Level 3 */}
          <div className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#0D1E35]">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D1E35]/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com"
                    className="pl-4 pr-11 py-6 bg-white border-[#0D1E35]/10 focus-visible:ring-[#c8a84b] text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-[#0D1E35]">
                    كلمة المرور
                  </Label>
                  <a href="#" className="text-sm font-medium text-[#c8a84b] hover:text-[#b39540] transition-colors">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D1E35]/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    className="pl-4 pr-11 py-6 bg-white border-[#0D1E35]/10 focus-visible:ring-[#c8a84b] text-left tracking-widest"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Dominant CTA */}
            <Button 
              className="w-full py-6 text-lg font-semibold bg-[#c8a84b] hover:bg-[#b39540] text-white shadow-lg shadow-[#c8a84b]/25 transition-all active:scale-[0.98]"
            >
              تسجيل الدخول
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="pt-6 border-t border-[#0D1E35]/10 text-center">
            <p className="text-[#0D1E35]/60 text-sm">
              ليس لديك حساب؟{" "}
              <a href="#" className="font-semibold text-[#0D1E35] hover:text-[#c8a84b] transition-colors">
                طلب حساب
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Right Column - Secondary Information (Moved out of the primary path) */}
      <div className="hidden lg:flex flex-1 bg-white/50 border-r border-[#0D1E35]/5 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle decorative elements replacing the loud hero */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#0D1E35 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
        
        <div className="max-w-md space-y-8 relative z-10">
          <div className="w-16 h-1 bg-[#c8a84b] rounded-full" />
          <h2 className="text-3xl font-light leading-snug text-[#0D1E35]/80">
            "الوضوح في التصميم يؤدي إلى الكفاءة في العمل."
          </h2>
          <div className="space-y-4 pt-8">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0D1E35]/5 flex items-center justify-between">
              <span className="text-[#0D1E35]/60">المبيعات اليوم</span>
              <span className="font-bold text-xl text-[#0D1E35]">١٤٢</span>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0D1E35]/5 flex items-center justify-between">
              <span className="text-[#0D1E35]/60">العملاء النشطين</span>
              <span className="font-bold text-xl text-[#c8a84b]">٢,٨٤٥</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
