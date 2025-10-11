"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdItem } from "@/components/ads/AdItemCard";
import AdItemCard from "@/components/ads/AdItemCard";

export default function ManageAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedAds, setSelectedAds] = useState<AdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  const openModal = (item: AdItem) => {
    setSelectedAds(item);
    setIsModalOpen(true);
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsImageEnlarged(false);
    if (typeof document !== 'undefined') document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data);
        } else {
          setError("فشل في تحميل الإعلانات");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في تحميل الإعلانات");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (item: AdItem) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setAds(ads.filter((n) => n.id !== item.id));
      } else {
        setError("فشل في حذف الإعلان");
      }
    } catch {
      setError("فشل في حذف الإعلان");
    }
  };

  const handleToggleVisible = async (item: AdItem) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !item.isVisible }),
      });
      if (res.ok) {
        setAds(ads.map((n) => n.id === item.id ? { ...n, isVisible: !n.isVisible } : n));
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
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Adspaper icons decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute top-8 right-12 w-16 h-16 text-white animate-float" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <svg className="absolute bottom-12 left-16 w-20 h-20 text-white animate-float-delayed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="animate-fade-in">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-2">إدارة الإعلانات</h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">إنشاء وتعديل وإدارة جميع الإعلانات</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex justify-center sm:justify-end -mt-6">
          <button
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            onClick={() => router.push('/admin/ads/create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            إضافة إعلان جديد
          </button>
        </div>
      <div className="mt-6">
        {loading ? (
          <div className="text-center">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : ads.length === 0 ? (
          <div className="text-center text-gray-600">لا يوجد إعلانات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((item) => (
              <AdItemCard
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
      {isModalOpen && selectedAds && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{selectedAds.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/admin/ads/edit/${selectedAds.id}`)}
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
                dangerouslySetInnerHTML={{ __html: selectedAds.description }}
              />
              {selectedAds.image && (
                <div className="mt-4 mb-4 bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => setIsImageEnlarged(true)}>
                  <img
                    src={selectedAds.image}
                    alt={selectedAds.title}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500">
                <span>البداية: {selectedAds.startDate ? new Date(selectedAds.startDate).toLocaleDateString('ar-EG') : '-'}</span>
                <span>النهاية: {selectedAds.endDate ? new Date(selectedAds.endDate).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
              {selectedAds.isPinned && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  إعلان مثبت
                </div>
              )}
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ml-2" style={{
                backgroundColor: selectedAds.isVisible ? '#dcfce7' : '#fef3c7',
                color: selectedAds.isVisible ? '#15803d' : '#a16207'
              }}>
                {selectedAds.isVisible ? 'ظاهر' : 'مخفي'}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/ads/edit/${selectedAds.id}`)}
                  className="px-4 py-1 rounded-lg font-semibold shadow border bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                >
                  تعديل
                </button>
                <button
                  onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) handleDelete(selectedAds); }}
                  className="px-4 py-1 rounded-lg font-semibold shadow border bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {isImageEnlarged && selectedAds?.image && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60]"
          onClick={() => setIsImageEnlarged(false)}
        >
          <button
            onClick={() => setIsImageEnlarged(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={selectedAds.image}
            alt={selectedAds.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}