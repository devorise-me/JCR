import Link from "next/link";
import { Button } from "../ui/button";

interface BackButtonProps {
  label?: string;
  href: string;
  className?: string;
  children?: React.ReactNode;
}

export const BackButton = ({
  label,
  href,
  className,
  children,
}: BackButtonProps) => {
  return (
    <Button variant="link" asChild size="sm" className="font-normal w-full">
      <Link href={href} className={className}>
        {children}
        {label}
      </Link>
    </Button>
  );
};
