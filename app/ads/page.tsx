"use client";
import { useEffect, useState } from "react";
import AdItemCard from "@/components/ads/AdItemCard";
import Nav from "@/components/Navigation/Nav";
import Footer from "@/components/Footer";

interface AdItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  isPinned?: boolean;
  isVisible?: boolean;
  author?: { id: string; username: string | null; role: string | null };
}

export default function AdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAds, setSelectedAds] = useState<AdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: AdItem) => {
    setSelectedAds(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        // Filter only visible ads
        const visibleAds = data.filter((item: AdItem) => item.isVisible !== false);
        setAds(visibleAds);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Nav />
      <div className="min-h-[80vh] mt-20">
      {/* Hero with background */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Ads icons decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          <svg className="absolute top-12 right-16 w-20 h-20 text-white animate-float" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <svg className="absolute top-1/2 left-12 w-16 h-16 text-white animate-float-delayed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <svg className="absolute bottom-16 right-1/4 w-24 h-24 text-white animate-float" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="animate-fade-in">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-4 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl mb-3">الإعلانات</h1>
            <p className="text-base sm:text-lg text-white/95 font-semibold max-w-2xl mx-auto">آخر المستجدات والإعلانات والأحداث المهمة</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto -mt-8 px-4 sm:px-6 pb-10">
      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : ads.length === 0 ? (
        <div className="text-center text-gray-600">لا يوجد إعلانات حالياً</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((item) => (
            <AdItemCard 
              key={item.id}
              item={item}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      )}
      </div>
      {isModalOpen && selectedAds && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" 
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              {selectedAds.image && (
                <div className="mb-4 -mt-6 -mx-6">
                  <img
                    src={selectedAds.image}
                    alt={selectedAds.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAds.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="text-gray-600 mb-4">
                {selectedAds.startDate && new Date(selectedAds.startDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: selectedAds.description }}
              />

              {selectedAds.author && (
                <div className="mt-6 text-sm text-gray-500 text-left">
                  نشر بواسطة: {selectedAds.author.username || 'مجهول'}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}