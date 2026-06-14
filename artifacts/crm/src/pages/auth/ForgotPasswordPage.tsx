import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
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
import { Building, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormValues) => {
    setError(null);
    forgotPassword.mutate(
      { data },
      {
        onSuccess: () => setSent(true),
        onError: () =>
          setError("Something went wrong. Please try again."),
      }
    );
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-muted text-center p-6">
          <CardHeader>
            <div className="mx-auto bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 p-3 rounded-full mb-4 w-fit">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base mt-2">
              If that email is registered, you'll receive a password reset link
              shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
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
          <p className="text-muted-foreground mt-2">Password recovery</p>
        </div>

        <Card className="shadow-lg border-muted">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Forgot password?
            </CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...form.register("email")}
                  className={
                    form.formState.errors.email ? "border-destructive" : ""
                  }
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send reset link
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
