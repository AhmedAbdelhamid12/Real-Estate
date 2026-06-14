import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  useRegister,
  useVerifyEmail,
  useListTeamLeaders,
  apiFetch,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RESEND_COOLDOWN = 60;

function useResendCountdown() {
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { seconds, start, canResend: seconds === 0 };
}

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(5, { message: "Phone number is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["admin", "director", "team_leader", "sales"]),
    teamLeaderId: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const verifySchema = z.object({
  code: z
    .string()
    .length(6, { message: "Code must be 6 digits" })
    .regex(/^\d+$/, { message: "Code must be numeric" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  director: "Director",
  team_leader: "Team Leader",
  sales: "Sales Agent",
};

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function OAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <a href={`${BASE_URL}/api/auth/google`}>
          <Button variant="outline" className="w-full" type="button">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </a>
        <a href={`${BASE_URL}/api/auth/facebook`}>
          <Button variant="outline" className="w-full" type="button">
            <svg className="h-4 w-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </a>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const register = useRegister();
  const verifyEmail = useVerifyEmail();
  const { data: teamLeaders = [] } = useListTeamLeaders();

  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [stage, setStage] = useState<"register" | "verify" | "pending">(
    "register"
  );
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { seconds, start: startCountdown, canResend } = useResendCountdown();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "sales",
      teamLeaderId: undefined,
    },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const watchRole = form.watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    setError(null);
    register.mutate(
      {
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
          teamLeaderId: data.role === "sales" ? (data.teamLeaderId ?? null) : null,
        },
      },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
          setStage("verify");
          startCountdown();
        },
        onError: (err) => {
          setError((err as any)?.message || "Registration failed. Please try again.");
        },
      }
    );
  };

  const handleResend = async () => {
    setResendMsg(null);
    setError(null);
    setIsResending(true);
    try {
      const res = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to resend code");
      }
      setResendMsg("A new code has been sent to your email.");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const onVerify = (data: VerifyFormValues) => {
    setError(null);
    verifyEmail.mutate(
      { data: { email: registeredEmail, code: data.code } },
      {
        onSuccess: () => setStage("pending"),
        onError: (err) => {
          setError(
            (err as any)?.message || "Invalid or expired code. Please try again."
          );
        },
      }
    );
  };

  if (stage === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl mb-4 shadow-sm">
              <Building className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TIL Real Estate Group</h1>
            <p className="text-muted-foreground mt-2">Verify your email</p>
          </div>

          <Card className="shadow-lg border-muted">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">
                Check your email
              </CardTitle>
              <CardDescription>
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {registeredEmail}
                </span>
                . It expires in 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={verifyForm.handleSubmit(onVerify)}
                className="space-y-4"
              >
                {error && (
                  <Alert variant="destructive" className="py-3">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {resendMsg && (
                  <Alert className="py-3 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                    <AlertDescription>{resendMsg}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className={`text-center text-2xl tracking-widest font-mono h-14 ${verifyForm.formState.errors.code ? "border-destructive" : ""}`}
                    {...verifyForm.register("code")}
                  />
                  {verifyForm.formState.errors.code && (
                    <p className="text-sm text-destructive">
                      {verifyForm.formState.errors.code.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={verifyEmail.isPending}
                >
                  {verifyEmail.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verify email
                </Button>

                <div className="flex items-center justify-center pt-1">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                    >
                      {isResending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Resend code
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend code in{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {seconds}s
                      </span>
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-6">
              <button
                type="button"
                onClick={() => {
                  setStage("register");
                  setError(null);
                  setResendMsg(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to registration
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-muted text-center p-6">
          <CardHeader>
            <div className="mx-auto bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 p-3 rounded-full mb-4 w-fit">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Email verified!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your account is now pending administrator approval. You'll receive
              an email once approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md my-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl mb-4 shadow-sm">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">TIL Real Estate Group</h1>
          <p className="text-muted-foreground mt-2">Request platform access</p>
        </div>

        <Card className="shadow-lg border-muted">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your details below to request access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="register-form"
            >
              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...form.register("name")}
                  className={form.formState.errors.name ? "border-destructive" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...form.register("email")}
                  className={form.formState.errors.email ? "border-destructive" : ""}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+971 50 123 4567"
                  {...form.register("phone")}
                  className={form.formState.errors.phone ? "border-destructive" : ""}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(val) =>
                    form.setValue("role", val as RegisterFormValues["role"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="role"
                    className={form.formState.errors.role ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              {watchRole === "sales" && teamLeaders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="teamLeaderId">Team Leader (optional)</Label>
                  <Select
                    value={form.watch("teamLeaderId") ?? ""}
                    onValueChange={(val) =>
                      form.setValue("teamLeaderId", val || undefined, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="teamLeaderId">
                      <SelectValue placeholder="Select your team leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamLeaders.map((tl) => (
                        <SelectItem key={tl.id} value={tl.id}>
                          {tl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  className={
                    form.formState.errors.password ? "border-destructive" : ""
                  }
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  className={
                    form.formState.errors.confirmPassword
                      ? "border-destructive"
                      : ""
                  }
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Request Account
              </Button>
            </form>

            <OAuthButtons />
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
