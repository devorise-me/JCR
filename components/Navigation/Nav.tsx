"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import SideMenuButton from "../side-menu";
import NavLinks from "./nav-links";
import NavButtons from "./nav-buttons";
import { FaBars, FaTimes } from "react-icons/fa";

const Nav = () => {
  const [isNavVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleSignOut = () => {
    setNavVisible(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav-modern transition-all duration-300 ${
      isScrolled 
        ? 'py-2 shadow-lg backdrop-blur-xl bg-white/90' 
        : 'py-4 bg-white/95 backdrop-blur-lg'
    }`}>
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <SideMenuButton>
            <div className="p-2 rounded-xl glass-morphism glass-morphism-hover transition-all duration-300">
              <FaBars size={20} className="text-gray-700" />
            </div>
          </SideMenuButton>
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden lg:flex">
          <NavButtons onSignOut={handleSignOut} />
        </div>

        {/* Center Content - Logo and Navigation */}
        <div className="flex items-center gap-8 justify-end flex-1 lg:justify-center">
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex">
            <NavLinks hide={isNavVisible} />
          </div>
          
          {/* Logo */}
          <div className="flex items-center justify-center">
            <div className="relative group">
              <Image
                src="/LogoHeader.png"
                height={75}
                width={225}
                alt="Logo Header"
                className={`transition-all duration-300 ${
                  isScrolled ? 'max-sm:w-[160px] w-[200px]' : 'max-sm:w-[180px] w-[225px]'
                } group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="lg:hidden">
          <NavButtons onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Enhanced Navigation Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </nav>
  );
};

export default Nav;
