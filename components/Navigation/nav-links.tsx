"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "../ui/select";

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

  return (
    <ul className={className || `flex items-center text-nowrap gap-5 max-lg:hidden`}>
      {hide &&
        user &&
        (user.role === "ADMIN" || user.role === "SUPERVISOR") && (
          <li onClick={enablescroll}>
            <Link href="/admin/dashboard">لائحة المسؤول</Link>
          </li>
        )}
      {hide &&
        user &&
        (user.role === "RESULTS_EDITOR") && (
          <li onClick={enablescroll}>
            <Link href="/admin/Results">لائحة محرر النتائج</Link>
          </li>
        )}
      <li onClick={enablescroll}>
        <Link href="/Results"></Link>
      </li>
      {/* <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>النتائج</NavigationMenuTrigger>
            <NavigationMenuContent className="min-w-[150px]">
              <div className="flex flex-col gap-4 w-full text-right p-4">
                <NavigationMenuLink href="/Results">النتائج</NavigationMenuLink>
                <NavigationMenuLink href="/profile/myCamels">المطايا المسجلة</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> */}
      <Select dir="rtl" open={open} onOpenChange={setOpen}>
        <SelectTrigger className='bg-transparent max-w-20 !outline-none border-none shadow-none'>
          <SelectValue placeholder="النتائج" />
        </SelectTrigger>
        <SelectContent className='max-w-20 outline-none border-none'>
          <SelectGroup className='flex flex-col gap-2'>
            <Link href="/Results">النتائج</Link>
            <Link href="/profile/myCamels">المطايا المسجلة</Link>
          </SelectGroup>
        </SelectContent>
      </Select>
      <li onClick={enablescroll}>
        <Link href="mailto:info@jocrc.com">تواصل معنا</Link>
      </li>
      {hide && token && (
        <>
          <li onClick={enablescroll}>
            <Link href="/profile">الملف الشخصي</Link>
          </li>
        </>
      )}
      {/* <li onClick={enablescroll}>
        <Link href="/registeredCamels">المطايا المشاركة</Link>
      </li> */}
      <li onClick={enablescroll}>
        <Link href="#">الأخبار</Link>
      </li>
      <li onClick={enablescroll}>
        <Link href="#">الإعلانات</Link>
      </li>
      <li onClick={enablescroll}>
        <Link href="/">الصفحة الرئيسية</Link>
      </li>
    </ul>
  );
};

export default NavLinks;
