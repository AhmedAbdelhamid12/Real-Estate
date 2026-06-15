import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AccessibilityFirst() {
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setHasError(true);
    } else {
      setHasError(false);
      // Simulate login
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] text-[#0D1E35] flex flex-col items-center justify-center p-4 sm:p-8 font-sans"
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[#0D1E35] rounded-md flex items-center justify-center mb-6">
            <span className="text-[#c8a84b] font-bold text-2xl tracking-wider">TIL</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-[#0D1E35]">تسجيل الدخول</h1>
          <p className="text-base text-slate-600 leading-relaxed">
            مرحباً بك في نظام إدارة علاقات العملاء العقاري
          </p>
        </div>

        {hasError && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900">
            <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            <AlertDescription className="text-base font-medium">
              يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-base font-semibold text-[#0D1E35]">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-12 text-base px-4 border-slate-300 focus-visible:ring-2 focus-visible:ring-[#9a7c2a] focus-visible:border-[#9a7c2a]"
              aria-invalid={hasError && !email ? "true" : "false"}
            />
            {hasError && !email && (
              <p className="text-red-700 text-sm font-medium flex items-center mt-1.5">
                <AlertCircle className="h-4 w-4 ml-1.5 inline" />
                البريد الإلكتروني مطلوب
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-base font-semibold text-[#0D1E35]">
                كلمة المرور
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base px-4 border-slate-300 focus-visible:ring-2 focus-visible:ring-[#9a7c2a] focus-visible:border-[#9a7c2a]"
                aria-invalid={hasError && !password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-0 top-0 h-12 w-12 flex items-center justify-center text-slate-500 hover:text-[#0D1E35] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7c2a] rounded-md"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {hasError && !password && (
              <p className="text-red-700 text-sm font-medium flex items-center mt-1.5">
                <AlertCircle className="h-4 w-4 ml-1.5 inline" />
                كلمة المرور مطلوبة
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-[#0D1E35] hover:bg-[#1a2d4c] text-white transition-colors focus-visible:ring-4 focus-visible:ring-[#9a7c2a]/50"
            >
              تسجيل الدخول
            </Button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center space-y-4 border-t border-slate-200 pt-6">
          <a
            href="#"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-base font-medium text-[#9a7c2a] hover:text-[#7a6221] underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7c2a] rounded"
          >
            نسيت كلمة المرور؟
          </a>
          <div className="text-base text-slate-600 flex items-center justify-center flex-wrap gap-2">
            <span>ليس لديك حساب؟</span>
            <a
              href="#"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] font-bold text-[#0D1E35] hover:text-[#9a7c2a] underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7c2a] rounded"
            >
              طلب حساب جديد
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
