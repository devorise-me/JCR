"use client";
import { useRouter } from "next/navigation";

interface RedirectButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  path: string;
  className?: string;
}

export const RedirectButton = ({
  children,
  mode,
  asChild,
  path,
  className,
}: RedirectButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`${path}`);
  };

  if (mode === "modal") {
    return <span></span>;
  }

  return (
    <span onClick={onClick} className={className || `cursor-pointer relative`}>
      {children}
    </span>
  );
};
