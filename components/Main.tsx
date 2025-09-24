"use client";
import Image from "next/image";
import CalendarContainer from "./Tabels/CalendarContainer";
import { useEffect, useState } from "react";
import { ChevronDown, Star, Trophy, Users } from "lucide-react";

function Main() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToCalendar = () => {
    const calendarElement = document.getElementById('calendar-section');
    if (calendarElement) {
      calendarElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { icon: Trophy, label: "سباقات منجزة", value: "150+" },
    { icon: Users, label: "مشاركين", value: "500+" },
    { icon: Star, label: "تقييم المستخدمين", value: "4.9" },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[url('/desert2.jpg')] bg-no-repeat bg-center bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className={`card-modern transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          
          {/* Hero Section */}
          <div className="flex max-lg:flex-col items-center justify-between gap-12 mb-16">
            {/* Image Section */}
            <div className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="relative">
                <Image 
                  src="/Camel.png" 
                  width={512} 
                  height={512} 
                  alt="Camel"
                  className="drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
              </div>
            </div>

            {/* Text Section */}
            <div className={`flex flex-col items-end justify-center gap-8 max-lg:items-center text-right max-lg:text-center transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <h1 className="text-6xl max-lg:text-5xl max-md:text-4xl max-sm:text-3xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  انضم إلى مجتمع سباقات الهجن
                </span>
                <br />
                <span className="text-gray-700">
                  وتواصل من أي مكان!
                </span>
              </h1>
              
              <p className="text-2xl max-lg:text-xl max-md:text-lg max-sm:text-base text-gray-600 font-medium">
                ابدأ رحلتك الآن واستمتع بتجربة فريدة!
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 max-sm:flex-col max-sm:w-full">
                <button 
                  onClick={scrollToCalendar}
                  className="btn-modern px-8 py-4 text-lg font-semibold"
                >
                  استكشف السباقات
                </button>
                <button className="btn-secondary px-8 py-4 text-lg font-semibold">
                  تعرف على المزيد
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {stats.map((stat, index) => (
              <div key={index} className="glass-morphism glass-morphism-hover p-6 text-center group">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center">
            <button 
              onClick={scrollToCalendar}
              className="p-3 rounded-full glass-morphism glass-morphism-hover animate-bounce hover:animate-none transition-all duration-300"
            >
              <ChevronDown size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <div id="calendar-section" className={`mt-20 transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <CalendarContainer />
        </div>
      </div>
    </section>
  );
}

export default Main;
