"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NewsItem } from "@/components/news/NewsItemCard";
import NewsItemCard from "@/components/news/NewsItemCard";

export default function ManageNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (typeof document !== 'undefined') document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في تحميل الأخبار");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (item: NewsItem) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/news/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNews(news.filter((n) => n.id !== item.id));
      } else {
        setError("فشل في حذف الخبر");
      }
    } catch {
      setError("فشل في حذف الخبر");
    }
  };

  const handleToggleVisible = async (item: NewsItem) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/news/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !item.isVisible }),
      });
      if (res.ok) {
        setNews(news.map((n) => n.id === item.id ? { ...n, isVisible: !n.isVisible } : n));
      } else {
        setError("فشل في تحديث حالة الظهور");
      }
    } catch {
      setError("فشل في تحديث حالة الظهور");
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/Camel.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">إدارة الأخبار</h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80">إنشاء، تعديل، إظهار وإخفاء الأخبار</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto -mt-6 px-4 sm:px-6 pb-10">
        <div className="flex justify-center sm:justify-end">
          <button
            className="mt-4 px-4 py-2 rounded-lg font-semibold shadow border bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => router.push('/admin/news/create')}
          >
            إضافة أخبار جديدة
          </button>
        </div>
      <div className="mt-6">
        {loading ? (
          <div className="text-center">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : news.length === 0 ? (
          <div className="text-center text-gray-600">لا يوجد أخبار حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsItemCard
                key={item.id}
                item={item}
                onItemClick={(item) => openModal(item)}
                onDeleteClick={handleDelete}
                onToggleVisibleClick={handleToggleVisible}
                showAdminActions={true}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      {isModalOpen && selectedNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{selectedNews.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/admin/news/edit/${selectedNews.id}`)}
                  className="rounded-md px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  تعديل
                </button>
                <button
                  onClick={closeModal}
                  className="rounded-full p-2 hover:bg-gray-100"
                  aria-label="إغلاق"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-5 py-4 flex-1 overflow-y-auto">
              <div
                className="prose max-w-none text-gray-800 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: selectedNews.description }}
              />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-500">
                <span>تاريخ النشر: {selectedNews.date ? new Date(selectedNews.date).toLocaleDateString('ar-EG') : '-'}</span>
                <span>البداية: {selectedNews.startDate ? new Date(selectedNews.startDate).toLocaleDateString('ar-EG') : '-'}</span>
                <span>النهاية: {selectedNews.endDate ? new Date(selectedNews.endDate).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/news/edit/${selectedNews.id}`)}
                  className="px-4 py-1 rounded-lg font-semibold shadow border bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                >
                  تعديل
                </button>
                <button
                  onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) handleDelete(selectedNews); }}
                  className="px-4 py-1 rounded-lg font-semibold shadow border bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}