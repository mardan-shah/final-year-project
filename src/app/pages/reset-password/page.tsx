"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/supabase';

const ResetPasswordComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePasswordResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Password Reset Link Sent",
        description: "Check your email for the reset link.",
      });

      setMode('reset');
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Unable to send reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password Reset Successful",
        description: "You can now sign in with your new password",
      });

      setTimeout(() => {
        router.push("/pages/signin");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Unable to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center my-5">
      <Card className="w-[350px] bg-dark border-dark-border text-gray-light">
        <CardHeader>
          <CardTitle className="text-primaryaccent">
            {mode === 'request' ? 'Reset Password' : 'Set New Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'request' 
              ? 'Enter your email to receive a reset link' 
              : 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={mode === 'request' ? handlePasswordResetRequest : handlePasswordReset} 
            className="space-y-4"
          >
            {mode === 'request' ? (
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
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-dark-hover border-dark-border text-gray-light"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-dark-hover border-dark-border text-gray-light"
                  />
                </div>
              </>
            )}
            <Button
              type="submit"
              className="w-full text-gray-light bg-primaryaccent hover:bg-dark-hover hover:border border-primaryaccent"
              disabled={loading}
            >
              {loading 
                ? (mode === 'request' ? "Sending Link..." : "Resetting Password...") 
                : (mode === 'request' ? "Send Reset Link" : "Reset Password")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/pages/signin" passHref>
            <Button variant="link" className="text-primaryaccent">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordComponent;