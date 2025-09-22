"use client";
import { useState, useEffect } from "react";
import React from "react";
import NavLinks from "./Navigation/nav-links";
import NavButtons from "./Navigation/nav-buttons";
import { X, Menu } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const SideMenuButton = ({ children }: Props) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMenuToggle = () => {
    if (isOpened) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpened(false);
        setIsAnimating(false);
      }, 300);
    } else {
      setIsOpened(true);
    }
  };

  useEffect(() => {
    if (isOpened) {
      document.body.style.overflowY = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflowY = "auto";
      document.body.style.touchAction = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [isOpened]);

  const enableScrolling = () => {
    handleMenuToggle();
  };

  return (
    <>
      {/* Menu Button */}
      <div
        className="lg:hidden flex items-center justify-center hover:cursor-pointer z-50 relative"
        onClick={handleMenuToggle}
      >
        <div className="p-3 rounded-2xl glass-morphism glass-morphism-hover transition-all duration-300 hover:scale-110 active:scale-95">
          {isOpened ? (
            <X size={24} className="text-gray-700 transition-transform duration-300" />
          ) : (
            <Menu size={24} className="text-gray-700 transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {(isOpened || isAnimating) && (
        <div 
          className={`mobile-menu ${
            isAnimating ? 'animate-out fade-out slide-out-to-top duration-300' : 'animate-in fade-in slide-in-from-top duration-400'
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }}></div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleMenuToggle}
            className="absolute top-8 right-8 p-3 rounded-2xl glass-morphism glass-morphism-hover transition-all duration-300 hover:scale-110 active:scale-95 z-10"
          >
            <X size={24} className="text-gray-700" />
          </button>

          {/* Menu Content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-8">
            {/* Logo Section */}
            <div className="mb-8">
              <div className="w-32 h-32 rounded-full glass-morphism flex items-center justify-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JCR
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="w-full max-w-md">
              <NavLinks
                enablescroll={enableScrolling}
                className="flex flex-col items-center justify-center gap-4 w-full"
                hide={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <NavButtons
                enablescroll={enableScrolling}
                className="flex flex-col gap-4 items-center"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-12 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-12 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-2000"></div>
            <div className="absolute bottom-1/3 right-8 w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
      )}
    </>
  );
};

export default SideMenuButton;
