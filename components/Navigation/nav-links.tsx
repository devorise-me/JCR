"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "../ui/select";
import { ChevronDown, Home, Trophy, Users, Phone, User, Newspaper, Megaphone, Settings } from "lucide-react";

interface Props {
  className?: string;
  hide: boolean;
  enablescroll?: () => void;
}

interface UserProfile {
  role: string;
}

const NavLinks = ({ className, enablescroll, hide }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);

    if (storedToken) {
      fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, []);

  const navItems = [
    { href: "/", label: "الصفحة الرئيسية", icon: Home },
    { href: "/ads", label: "الإعلانات", icon: Megaphone },
    { href: "/news", label: "الأخبار", icon: Newspaper },
    { href: "/contact", label: "تواصل معنا", icon: Phone },
  ];

  const adminItems = [
    { href: "/admin/dashboard", label: "لائحة المسؤول", icon: Settings, roles: ["ADMIN", "SUPERVISOR"] },
    { href: "/admin/Results", label: "لائحة محرر النتائج", icon: Trophy, roles: ["RESULTS_EDITOR"] },
  ];

  const userItems = token ? [
    { href: "/profile", label: "الملف الشخصي", icon: User },
  ] : [];

  return (
    <ul className={className || `flex items-center text-nowrap gap-2 max-lg:hidden`}>
      {/* Admin Links */}
      {hide && user && adminItems.map((item) => (
        item.roles.includes(user.role) && (
          <li key={item.href} onClick={enablescroll}>
            <Link 
              href={item.href}
              className="nav-link flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 group"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
              <span>{item.label}</span>
            </Link>
          </li>
        )
      ))}

      {/* User Profile Links */}
      {hide && userItems.map((item) => (
        <li key={item.href} onClick={enablescroll}>
          <Link 
            href={item.href}
            className="nav-link flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 group"
          >
            <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span>{item.label}</span>
          </Link>
        </li>
      ))}

      {/* Racing Dropdown */}
      <li className="relative">
        <Select dir="rtl" open={open} onOpenChange={setOpen}>
          <SelectTrigger className="nav-link flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 bg-transparent border-none shadow-none outline-none group min-w-[140px]">
            <Trophy size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <SelectValue placeholder="سباقات الهجن" />
            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </SelectTrigger>
          <SelectContent className="dropdown-modern min-w-[200px] border-none shadow-2xl">
            <SelectGroup className="p-2">
              <Link 
                href="/Results" 
                onClick={enablescroll}
                className="dropdown-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 group"
              >
                <Trophy size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span>نتائج السباق</span>
              </Link>
              <Link 
                href="/registeredCamels" 
                onClick={enablescroll}
                className="dropdown-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 group"
              >
                <Users size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span>الهجن المشاركة في السباق</span>
              </Link>
            </SelectGroup>
          </SelectContent>
        </Select>
      </li>

      {/* Regular Navigation Items */}
      {navItems.map((item) => (
        <li key={item.href} onClick={enablescroll}>
          <Link 
            href={item.href}
            className="nav-link flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 group"
          >
            <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
