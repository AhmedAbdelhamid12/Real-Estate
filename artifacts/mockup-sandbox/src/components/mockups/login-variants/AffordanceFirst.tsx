import React, { useState } from 'react';
import { Eye, EyeOff, Building2, User, KeyRound, Facebook, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function AffordanceFirst() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen w-full flex bg-[#EEF2F8] text-[#0D1E35] font-sans selection:bg-[#c8a84b] selection:text-white">
      {/* Right Column: Form (First in DOM for RTL) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white shadow-2xl z-10">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#0D1E35] rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-[#c8a84b]" />
              </div>
              <span className="text-xl font-bold tracking-tight">مجموعة تيل العقارية</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D1E35]">تسجيل الدخول</h1>
            <p className="text-[#0D1E35]/60 font-medium">مرحباً بك مجدداً. الرجاء إدخال بياناتك للوصول إلى لوحة التحكم.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-[#0D1E35]">
                البريد الإلكتروني
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#c8a84b] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-4 pr-11 py-6 bg-slate-50 border-2 border-slate-200 focus-visible:border-[#c8a84b] focus-visible:ring-4 focus-visible:ring-[#c8a84b]/20 transition-all text-left text-lg font-medium shadow-sm hover:border-slate-300 rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold text-[#0D1E35]">
                  كلمة المرور
                </Label>
                <a href="#" className="text-sm font-bold text-[#c8a84b] hover:text-[#0D1E35] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8a84b] rounded">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#c8a84b] transition-colors">
                  <KeyRound className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-11 py-6 bg-slate-50 border-2 border-slate-200 focus-visible:border-[#c8a84b] focus-visible:ring-4 focus-visible:ring-[#c8a84b]/20 transition-all text-left text-lg tracking-widest shadow-sm hover:border-slate-300 rounded-xl"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-[#0D1E35] focus:outline-none focus:text-[#0D1E35] transition-colors"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox id="remember" className="border-2 border-slate-300 data-[state=checked]:bg-[#c8a84b] data-[state=checked]:border-[#c8a84b]" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                تذكرني على هذا الجهاز
              </Label>
            </div>

            <Button className="w-full py-6 text-lg font-bold bg-[#c8a84b] hover:bg-[#b0923e] text-[#0D1E35] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus-visible:ring-4 focus-visible:ring-[#c8a84b]/40 rounded-xl">
              تسجيل الدخول
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white font-semibold text-slate-500">أو الدخول بواسطة</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="py-6 border-2 border-slate-200 hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-all group rounded-xl shadow-sm"
            >
              <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-bold text-[#0D1E35]">Google</span>
            </Button>
            <Button 
              variant="outline" 
              className="py-6 border-2 border-slate-200 hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group rounded-xl shadow-sm"
            >
              <Facebook className="w-5 h-5 ml-2 text-[#1877F2] group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[#0D1E35]">Facebook</span>
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              ليس لديك حساب؟{' '}
              <a href="#" className="font-bold text-[#c8a84b] hover:text-[#0D1E35] underline decoration-2 underline-offset-4 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-[#c8a84b]">
                طلب حساب
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Left Column: Graphic / Stats (Second in DOM for RTL -> Left side visually) */}
      <div className="hidden lg:flex w-[55%] bg-[#0D1E35] relative overflow-hidden flex-col justify-between p-16">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="#c8a84b" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
          </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-7xl font-black text-white leading-tight mb-6">
            تسجيل <br />
            <span className="text-[#c8a84b]">الدخول.</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
            النظام العقاري الأول في مصر. أدر مبيعاتك، تتبع عملائك، وحقق أهدافك البيعية بكفاءة عالية.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 mt-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#c8a84b]" />
              <span className="text-slate-300 font-medium">مبيعات اليوم</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">٤.٢ مليون<span className="text-[#c8a84b] text-xl font-medium ml-1">ج.م</span></div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#c8a84b]" />
              <span className="text-slate-300 font-medium">العملاء النشطين</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">+١,٤٥٠</div>
          </div>
        </div>
        
        {/* Large Decorative Element */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#c8a84b] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>
    </div>
  );
}
