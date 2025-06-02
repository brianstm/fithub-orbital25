"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MagicButton } from "@/components/ui/magic-button";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Dumbbell, KeyRound, Mail, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);

    try {
      await login(values.email, values.password);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Link
        href="/"
        className="mb-8 font-bold text-2xl tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-300 transition-transform hover:scale-105"
      >
        <Dumbbell className="h-6 w-6 text-primary" />
        <span>FitHub</span>
      </Link>

      <div className="w-full max-w-md">
        <MagicCard
          className="border-none shadow-lg"
          gradient
          hoverEffect="glow"
        >
          <MagicCardHeader>
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
          </MagicCardHeader>
          <MagicCardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="email@example.com"
                            className="pl-10 bg-background/50 transition-all focus:bg-background"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-background/50 transition-all focus:bg-background"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <MagicButton
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  sparkle={true}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">Signing in...</div>
                  ) : (
                    "Sign in"
                  )}
                </MagicButton>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </MagicCardContent>
        </MagicCard>
      </div>
    </div>
  );
}
