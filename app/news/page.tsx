"use client";
import { useEffect, useState } from "react";
import NewsItemCard from "@/components/news/NewsItemCard";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startDate?: string;
  endDate?: string;
  author?: { id: string; username: string | null; role: string | null };
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-blue-700 to-indigo-600">
          الأخبار
        </h1>
        <p className="mt-2 text-sm text-gray-500">آخر المستجدات والإعلانات</p>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : news.length === 0 ? (
        <div className="text-center text-gray-600">لا يوجد أخبار حالياً</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <NewsItemCard 
              key={item.id}
              item={item}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      )}
      {isModalOpen && selectedNews && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedNews.title}
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
                {new Date(selectedNews.date).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div 
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: selectedNews.description }}
              />
              
              {selectedNews.author && (
                <div className="mt-6 text-sm text-gray-500 text-left">
                  نشر بواسطة: {selectedNews.author.username || 'مجهول'}
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
  );
}