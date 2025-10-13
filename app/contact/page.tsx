"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Navigation/Nav";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contactPage")
      .then((r) => r.json())
      .then((data) => {
        setContent(data?.content || "");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Nav />
      <div className="min-h-[80vh] mt-20">
        {/* Hero Section */}
        <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          {/* Contact icons decoration */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="absolute top-8 right-12 w-16 h-16 text-white animate-float" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg className="absolute bottom-12 left-16 w-20 h-20 text-white animate-float-delayed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="animate-fade-in">
              <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-2">تواصل معنا</h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">نرحب بملاحظاتكم واستفساراتكم</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <article className="prose prose-lg prose-slate max-w-none prose-headings:text-gray-800 prose-strong:text-gray-900 prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline prose-li:marker:text-teal-600" dir="rtl">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </article>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}


