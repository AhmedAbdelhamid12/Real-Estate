import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ArrowRight, User } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import "./_progressive.css";

export function Progressive() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) {
      emailInputRef.current?.focus();
    } else if (step === 2) {
      passwordInputRef.current?.focus();
    }
  }, [step]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Simulate lookup
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 400);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // Success state would go here
    }, 800);
  };

  const goBack = () => {
    setStep(1);
    setPassword("");
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden"
      style={{ backgroundColor: "#F8F9FC", fontFamily: "Inter, sans-serif" }}
    >
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-white to-transparent opacity-60 pointer-events-none" />
      
      <div className="w-full max-w-[420px] px-6 py-12 relative z-10 flex flex-col items-center">
        {/* Logo Monogram */}
        <div className="mb-12 flex flex-col items-center animate-slide-up-fade" style={{ animationDelay: "0ms" }}>
          <div 
            className="w-16 h-16 flex items-center justify-center rounded-xl shadow-sm mb-6"
            style={{ backgroundColor: "#0F2D52" }}
          >
            <span style={{ color: "#C9A84C", fontSize: "28px", fontWeight: "700", letterSpacing: "-1px" }}>T</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 relative overflow-hidden min-h-[300px]">
          
          {step === 1 && (
            <div className="animate-slide-up-fade flex flex-col h-full justify-between" style={{ animationDelay: "50ms" }}>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2 text-center">
                  Sign in
                </h1>
                <p className="text-sm text-gray-500 mb-8 text-center">
                  to continue to TIL Real Estate CRM
                </p>

                <form onSubmit={handleContinue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="sr-only">Work Email</Label>
                    <Input
                      id="email"
                      ref={emailInputRef}
                      type="email"
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base px-4 bg-gray-50/50 border-gray-200 focus-visible:ring-1 focus-visible:border-transparent transition-all"
                      style={{ focusVisible: { ringColor: "#0F2D52" } }}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium transition-all group"
                    style={{ backgroundColor: "#0F2D52", color: "white" }}
                    disabled={!email || isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button type="button" className="font-medium hover:underline transition-colors" style={{ color: "#0F2D52" }}>
                    Request access
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-right-fade flex flex-col h-full justify-between">
              <div>
                {/* Back button & User Chip */}
                <div className="flex items-center mb-8 relative">
                  <button 
                    onClick={goBack}
                    className="absolute left-0 p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="w-full flex justify-center">
                    <div className="inline-flex items-center py-1.5 px-3 rounded-full border border-gray-200 bg-gray-50/50">
                      <Avatar className="h-6 w-6 mr-2 border border-gray-100">
                        <AvatarFallback style={{ backgroundColor: "#0F2D52", color: "#C9A84C", fontSize: "10px" }}>
                          {email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                        {email}
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-8 text-center">
                  Welcome back
                </h1>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="sr-only">Password</Label>
                    </div>
                    <Input
                      id="password"
                      ref={passwordInputRef}
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base px-4 bg-gray-50/50 border-gray-200 focus-visible:ring-1 focus-visible:border-transparent transition-all"
                      style={{ focusVisible: { ringColor: "#0F2D52" } }}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium transition-all"
                    style={{ backgroundColor: "#0F2D52", color: "white" }}
                    disabled={!password || isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </div>
              
              <div className="mt-6 text-center">
                <button type="button" className="text-sm font-medium hover:underline transition-colors" style={{ color: "#0F2D52" }}>
                  Forgot password?
                </button>
              </div>
            </div>
          )}
          
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center animate-slide-up-fade" style={{ animationDelay: "150ms" }}>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} TIL Real Estate Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
