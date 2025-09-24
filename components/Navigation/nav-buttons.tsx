"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Button } from "../ui/button";
import { RedirectButton } from "../auth/redirect-button";
import { LogOut, LogIn, UserPlus } from "lucide-react";

interface Props {
  className?: string;
  enablescroll?: () => void;
  onSignOut?: () => void;
}

const NavButtons = ({ className, enablescroll, onSignOut }: Props) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      localStorage.removeItem("authToken");
      setToken(null);
      if (onSignOut) {
        onSignOut(); 
      }
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className || `flex items-center gap-3 max-lg:hidden`}>
      {token ? (
        <Button
          onClick={handleSignOut}
          disabled={isLoading}
          className="btn-modern flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <LogOut size={18} />
          )}
          <span>تسجيل خروج</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <RedirectButton path="/auth/register">
            <Button
              onClick={enablescroll}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95 bg-white/90 hover:bg-white border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">تسجيل</span>
            </Button>
          </RedirectButton>
          
          <RedirectButton path="/auth/login">
            <Button
              onClick={enablescroll}
              className="btn-modern flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            >
              <LogIn size={18} />
              <span>تسجيل الدخول</span>
            </Button>
          </RedirectButton>
        </div>
      )}
    </div>
  );
};

export default NavButtons;
