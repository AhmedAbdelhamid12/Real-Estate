import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
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
import { Building, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    setError(null);
    resetPassword.mutate(
      { data: { token, password: data.password } },
      {
        onSuccess: () => setDone(true),
        onError: (err) =>
          setError(
            (err as any)?.message || "Invalid or expired reset link."
          ),
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-muted text-center p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Invalid link</CardTitle>
            <CardDescription>
              This password reset link is missing or invalid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button variant="outline" className="w-full">
                Request a new link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-muted text-center p-6">
          <CardHeader>
            <div className="mx-auto bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 p-3 rounded-full mb-4 w-fit">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Password updated</CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been changed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Sign in with new password</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl mb-4 shadow-sm">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">PropOS CRM</h1>
          <p className="text-muted-foreground mt-2">Set a new password</p>
        </div>

        <Card className="shadow-lg border-muted">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Reset password
            </CardTitle>
            <CardDescription>Enter and confirm your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
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
                <Label htmlFor="confirmPassword">Confirm new password</Label>
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
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Set new password
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
