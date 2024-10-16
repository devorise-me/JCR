"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Button } from "../ui/button";
import { RedirectButton } from "../auth/redirect-button";

interface Props {
  className?: string;
  enablescroll?: () => void;
  onSignOut?: () => void;
}

const NavButtons = ({ className, enablescroll, onSignOut }: Props) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
  }, []);

  const handleSignOut = async () => {
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
    }
  };

  return (
    <div className={className || `flex items-center gap-5 max-lg:hidden`}>
      {token ? (
        <Button
          onClick={handleSignOut}
          className="rounded-xl bg-gray-200 opacity-60 text-black font-bold hover:bg-gray-300 duration-200"
        >
          تسجيل خروج
        </Button>
      ) : (
        <RedirectButton path="/auth/login">
          <Button
            onClick={enablescroll}
            className="rounded-xl bg-gray-200 opacity-60 text-black font-bold hover:bg-gray-300 duration-200"
          >
            تسجيل الدخول
          </Button>
        </RedirectButton>
      )}
    </div>
  );
};

export default NavButtons;
