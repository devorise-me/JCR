import {
  FaEnvelope,
  FaMobileAlt,
  FaInstagram,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";
import { MapPin, Mail, Phone, Heart } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    {
      href: "https://www.instagram.com/desert_magic/",
      icon: FaInstagram,
      label: "Instagram",
      color: "hover:text-pink-400"
    },
    {
      href: "https://www.facebook.com/desert.Magic.rum/?locale=ar_AR",
      icon: FaFacebook,
      label: "Facebook", 
      color: "hover:text-blue-400"
    },
    {
      href: "https://www.youtube.com/@camelracejo/videos",
      icon: FaYoutube,
      label: "YouTube",
      color: "hover:text-red-400"
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white w-full overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 py-20 px-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Company Info Section */}
            <div className="text-right max-lg:text-center space-y-6">
              <div className="space-y-4">
                <h2 className="font-bold text-4xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  رياضة الهجن الأردنية
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  البطولات المحلية في الأردن لسباق الهجن
                </p>
              </div>

              {/* Enhanced Map Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13872.90061804163!2d35.5189175!3d29.6262032!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1500ebd250cabcb3%3A0xb7f08658dd3db1c4!2sSheikh%20Zayed%20Bin%20Sultan%20Al%20Nahyan%20Camel%20Stadium!5e0!3m2!1sen!2sjo!4v1726321189938!5m2!1sen!2sjo" 
                    className="border-0 max-w-[600px] aspect-video w-full rounded-2xl" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col items-end justify-start gap-8 max-lg:items-center">
              <div className="text-right max-lg:text-center space-y-6">
                <h2 className="font-bold text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  تواصل معنا
                </h2>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-end max-lg:justify-center group">
                    <a 
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300 underline decoration-2 underline-offset-4" 
                      href="mailto:info@crfjo.com"
                    >
                      info@crfjo.com
                    </a>
                    <span className="text-gray-300">: ايميل</span>
                    <div className="p-2 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300">
                      <Mail size={20} className="text-blue-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end max-lg:justify-center group">
                    <span className="text-gray-300">الموقع</span>
                    <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300">
                      <MapPin size={20} className="text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-300">تابعنا على</h3>
                  <div className="flex gap-4 justify-end max-lg:justify-center">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                        aria-label={social.label}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
                          <social.icon
                            size={24}
                            className={`text-white transition-colors duration-300 ${social.color}`}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 border-t border-white/10">
        <div className="container mx-auto px-10 py-8">
          <div className="flex flex-col space-y-4">
            {/* Copyright */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-300">
                <span>جميع الحقوق محفوظة</span>
                <Heart size={16} className="text-red-400 animate-pulse" />
                <span>&copy; 2024</span>
              </div>
            </div>

            {/* Powered By */}
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span>powered by</span>
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Devorise Media and Business Solutions
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default Footer;
