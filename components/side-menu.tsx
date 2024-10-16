"use client";
import { useState, useEffect } from "react";
import React from "react";
import NavLinks from "./Navigation/nav-links";
import NavButtons from "./Navigation/nav-buttons";

interface Props {
  children: React.ReactNode;
}

const SideMenuButton = ({ children }: Props) => {
  const [isOpned, setIsOpned] = useState(false);

  const handleMenuOpen = () => {
    setIsOpned((prev) => !prev);
  };

  useEffect(() => {
    if (isOpned) {
      document.body.style.overflowY = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflowY = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [isOpned]);

  const enablescrolling = () => {
    document.body.style.overflowY = "auto";
    document.body.style.touchAction = "auto";
  };

  return (
    <div
      className="lg:hidden flex items-center justify-center hover:cursor-pointer z-50"
      onClick={handleMenuOpen}
    >
      {children}
      {isOpned && (
        <div className="top-0 right-0 left-0 bottom-0 absolute z-50 bg-white/95 w-full h-screen flex flex-col items-center justify-center backdrop-blur-3xl">
          <NavLinks
            enablescroll={enablescrolling}
            className=" flex flex-col items-center hover:cursor-default justify-center gap-5 relative text-2xl p-4 w-full z-50"
            hide={true}
          />
          <NavButtons
            enablescroll={enablescrolling}
            className="flex flex-col relative gap-5"
          />
        </div>
      )}
    </div>
  );
};

export default SideMenuButton;
