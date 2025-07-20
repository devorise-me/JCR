"use client";
import { useState, useEffect } from "react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/side-bar";
import { MdInsertDriveFile } from "react-icons/md";
import { GrCertificate } from "react-icons/gr";
import { FaAmericanSignLanguageInterpreting, FaDatabase, FaMagento, FaMicrochip, FaNewspaper, FaPhoenixFramework, FaRegEye, FaSearch } from "react-icons/fa";

interface UserProfile {
  id: string;
  username: string;
  image?: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname()

  useEffect(() => {
    async function fetchUserProfile() {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("! توكن مفقود ، الرجاء تسجيل الدخول");
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch user profile.");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setError("An unexpected error occurred.");
      }
    }

    fetchUserProfile();
  }, [router]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex justify-center items-center mb-4 transition-transform duration-500 ease-in-out transform hover:scale-110">
          <Image
            src={"/loadingPage.jpeg"}
            width={150}
            height={150}
            alt="loading"
            className="rounded-full shadow-lg"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 transition-transform duration-500 ease-in-out hover:translate-x-2">
            رياضـة الـهـجـن الأردنـيـة
          </h1>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN" && user.role !== "SUPERVISOR" && user.role !== "RESULTS_EDITOR") {
    router.push("/error");
    return null;
  }

  if (user.role === "RESULTS_EDITOR" && (pathname.includes("/admin/dashboard") || pathname.includes("/admin/users") || pathname.includes("/admin/registeredCamels"))) {
    router.push("/admin/Results/");
  }

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("authToken");
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const links = [
    {
      label: "اللائحة",
      href: "/admin/dashboard/",
      icon: (
        <IconBrandTabler className={cn("text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0", user.role === 'RESULTS_EDITOR' && 'opacity-50 cursor-default')} />
      ),
      disabled: user.role === 'RESULTS_EDITOR'
    },
    {
      label: "المستخدمين",
      href: "/admin/users/",
      icon: (
        <IconUserBolt className={cn("text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0", user.role === 'RESULTS_EDITOR' && 'opacity-50 cursor-default')} />
      ),
      disabled: user.role === 'RESULTS_EDITOR'
    },
    {
      label: "المطايا المسجلة",
      href: "/admin/registeredCamels/",
      icon: (
        <MdInsertDriveFile className={cn("text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0", user.role === 'RESULTS_EDITOR' && 'opacity-50 cursor-default')} />
      ),
      disabled: user.role === 'RESULTS_EDITOR'
    },
    {
      label: "النتائج",
      href: "/admin/Results/",
      icon: (
        <GrCertificate className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "عرض النتائج",
      href: "/admin/ShowResults/",
      icon: (
        <FaRegEye className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "البحث برقم الشريحة",
      href: "/admin/SearchByChipNumber",
      icon: (
        <FaSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "جميع البيانات",
      href: "/admin/AllInformation/",
      icon: (
        <FaDatabase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "إدارة الأخبار",
      href: "/admin/news/manage",
      icon: (
        <FaNewspaper className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "تسجيل الخروج",
      href: "",
      onClick: async (e: React.MouseEvent) => {
        e.preventDefault();
        await handleSignOut();
      },
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className={"mt-8 flex flex-col gap-2"}>
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  onClick={(link.onClick && !link.disabled) ? (e) => link.onClick(e) : undefined}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user.username,
                href: "#",
                icon: (
                  <Image
                    src="/PFP.jpg"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export const Logo = () => (
  <Link
    href="/"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <span className="text-2xl">🐪</span>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      <h1 className="font-semibold"> سباق الهجن</h1>
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link
    href="/"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <span className="text-2xl flex">🐪</span>
  </Link>
);
