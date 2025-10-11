"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewsItemCard, { NewsItem } from "@/components/news/NewsItemCard";

interface AdItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  author?: { id: string; username: string | null; role: string | null };
}

export default function AdsPage() {
  const [items, setItems] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const toNewsItem = (ad: AdItem): NewsItem => ({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    date: ad.startDate, // show start date like news 'date'
    startDate: ad.startDate,
    endDate: ad.endDate,
    author: ad.author,
    // isVisible not applicable for ads; omit
  });

  const openModal = (item: AdItem) => {
    setSelectedAd(item);
    setIsModalOpen(true);
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (typeof document !== 'undefined') document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[80vh]">
      {/* Hero with background */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url(/desert2.jpg)" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
              الإعلانات
            </h1>
            <p className="mt-2 text-sm text-white/80">
              تصفح أحدث الإعلانات المتاحة
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-8 px-4 sm:px-6 pb-10">
        {loading ? (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-600">لا توجد إعلانات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <NewsItemCard
                key={item.id}
                item={toNewsItem(item)}
                onItemClick={(_n) => openModal(item)}
                showAuthor={false}
              />
            ))}
          </div>
        )}
      </div>
      {isModalOpen && selectedAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{selectedAd.title}</h2>
              <button
                onClick={closeModal}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
            {selectedAd.imageUrl && (
              <img
                src={selectedAd.imageUrl}
                alt={selectedAd.title}
                className="w-full max-h-80 object-cover"
              />
            )}
            <div className="px-5 py-4 flex-1 overflow-y-auto">
              <div
                className="prose max-w-none text-gray-800 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: selectedAd.description }}
              />
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>من: {new Date(selectedAd.startDate).toLocaleDateString('ar-EG')}</span>
                <span>إلى: {new Date(selectedAd.endDate).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



