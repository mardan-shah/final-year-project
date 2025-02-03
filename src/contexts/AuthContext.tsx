"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string | undefined;
  avatar: string | undefined;
  role: string | undefined;
  organization: string | undefined;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: string, organization?: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  const updateUserState = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      return null;
    }

    try {
      const userProfile = await fetchUserProfile(session.user.id);
      
      const updatedUser = {
        id: session.user.id,
        email: session.user.email!,
        name: userProfile?.name || session.user.user_metadata?.name,
        avatar: userProfile?.avatar,
        role: userProfile?.role || session.user.user_metadata?.role,
        organization: userProfile?.company
      };
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user state:", error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          await updateUserState(session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        await updateUserState(session);
        router.push("/pages/dashboard");
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push("/pages/signin");
      } else if (event === 'USER_UPDATED') {
        await updateUserState(session);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Login failed - no user returned");

      await updateUserState(data.session);
      return data;
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string, organization?: string) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      });
  
      if (authError) throw authError;
      if (!authData.user) throw new Error('User registration failed');
  
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name,
          email,
          role,
          company: organization || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
  
      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
  
      // Manually fetch session after signup
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
  
      await updateUserState(sessionData.session);
  
      // Redirect to login page after successful sign-up
      router.push("/pages/signin");
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      router.push("/pages/signin");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error("No user logged in");

      // Update auth user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          name: updates.name 
        }
      });

      if (metadataError) throw metadataError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          company: updates.organization,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}