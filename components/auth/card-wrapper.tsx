"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";
interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  showSocial?: boolean;
  heading: string;
}

export const CardWrapper = ({
  children,
  headerLabel,
  heading,
}: CardWrapperProps) => {
  return (
    <Card className="w-[500px]  max-sm:w-screen shadow-md rounded-xl">
      <CardHeader>
        <Header head={heading} label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
