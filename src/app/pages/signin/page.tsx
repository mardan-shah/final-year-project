"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";

const SignInComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox.",
      });

      startResendCooldown();
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Unable to resend verification email",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      
      toast({
        title: "Sign In Successful",
        description: "Redirecting to dashboard...",
      });

      // Let the AuthContext handle the redirect
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email for verification link.",
          action: resendCooldown === 0 ? (
            <Button variant="outline" onClick={handleResendVerification}>
              Resend Verification
            </Button>
          ) : undefined,
        });
        startResendCooldown();
      } else {
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full flex justify-center my-5">
      <Card className="w-[350px] bg-dark border-dark-border text-gray-light">
        <CardHeader>
          <CardTitle className="text-primaryaccent">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-dark-hover border-dark-border text-gray-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-dark-hover border-dark-border text-gray-light"
              />
            </div>
            {resendCooldown > 0 && (
              <div className="text-sm text-gray-muted">
                Resend verification available in {resendCooldown} seconds
              </div>
            )}
            <Button
              type="submit"
              className="w-full text-gray-light bg-primaryaccent hover:bg-dark-hover hover:border border-primaryaccent"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/pages/reset-password" passHref>
            <Button variant="link" className="text-primaryaccent" disabled={loading}>
              Forgot password?
            </Button>
          </Link>
          <div className="text-sm">
            Dont have an account?{" "}
            <Link href="/pages/signup" passHref>
              <Button variant="link" className="text-primaryaccent" disabled={loading}>
                Sign Up
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInComponent;