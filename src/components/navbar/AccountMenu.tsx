"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, CreditCard, LogOut } from "lucide-react";
import LogoutModal from "./LogoutModal";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export function AccountMenuComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    setIsLogoutModalOpen(false); // Close modal first
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay to avoid race condition
    try {
      console.log("Attempting logout...");
      await logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems: MenuItem[] = isAuthenticated
    ? [
        {
          label: "Profile",
          icon: User,
          href: "/pages/profile",
        },
        {
          label: "Settings",
          icon: Settings,
          href: "/pages/settings",
        },
      ]
    : [{ label: "Sign in", icon: User, href: "/pages/signin" }];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {isAuthenticated && user ? (
              <>
                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt="User" />
                <AvatarFallback className="bg-primaryaccent text-[#232323]">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="bg-dark-border text-gray-light">
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-dark border-dark-border text-gray-light" align="end" forceMount>
        {isAuthenticated && user && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-primaryaccent">{user.name}</p>
                <p className="text-xs leading-none text-gray-muted">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-dark-border" />
          </>
        )}

        {menuItems.map((item) => (
          <Link href={item.href} key={item.label} passHref>
            <DropdownMenuItem className="hover:bg-dark-hover hover:text-primaryaccent cursor-pointer">
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          </Link>
        ))}

        {isAuthenticated && (
          <>
            <DropdownMenuSeparator className="bg-dark-border" />
            <DropdownMenuItem
              className="hover:bg-dark-hover hover:text-primaryaccent cursor-pointer"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>

      {isLogoutModalOpen && (
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </DropdownMenu>
  );
}
