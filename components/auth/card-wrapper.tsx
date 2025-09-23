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
    <div className="relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
      
      <Card className="card-modern w-[500px] max-sm:w-[95vw] max-sm:mx-auto shadow-2xl border-0 relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        <CardHeader className="relative z-10 pb-8 pt-8">
          <Header head={heading} label={headerLabel} />
        </CardHeader>
        
        <CardContent className="relative z-10 px-8 pb-8">
          {children}
        </CardContent>
        
        <CardFooter className="relative z-10 pb-8">
          {/* Optional footer content */}
        </CardFooter>

        {/* Floating Decorative Elements */}
        <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-4 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-2000"></div>
      </Card>
    </div>
  );
};
