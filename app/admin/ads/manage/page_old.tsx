"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdItemCard from "@/components/ads/AdItemCard";

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

export default function ManageAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setAds(data);
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في تحميل الإعلانات");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAds(ads.filter((item) => item.id !== id));
      } else {
        setError("فشل في حذف الإعلان");
      }
    } catch {
      setError("فشل في حذف الإعلان");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setAds(ads.map((item) => 
          item.id === id ? { ...item, isActive: !isActive } : item
        ));
      } else {
        setError("فشل في تحديث حالة الإعلان");
      }
    } catch {
      setError("فشل في تحديث حالة الإعلان");
    }
  };

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
              إدارة الإعلانات
            </h1>
            <p className="mt-2 text-sm text-white/80">
              إنشاء، تعديل، إظهار وإخفاء الإعلانات
            </p>
            <div className="mt-4">
              <button
                className="px-4 py-2 rounded-lg font-semibold shadow border bg-amber-500 text-white hover:bg-amber-600 transition"
                onClick={() => router.push('/admin/ads/create')}
              >
                إضافة إعلان جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-8 px-4 sm:px-6 pb-10">
        {loading ? (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : ads.length === 0 ? (
          <div className="text-center text-gray-600">لا توجد إعلانات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="relative group">
                <AdItemCard 
                  item={ad}
                  onItemClick={() => openModal(ad)}
                  showAuthor={false}
                />
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/ads/edit/${ad.id}`);
                    }}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="تعديل"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                        handleDelete(ad.id);
                      }
                    }}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="حذف"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/admin/ads/edit/${selectedAd.id}`)}
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
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/ads/edit/${selectedAd.id}`)}
                  className="px-4 py-1 rounded-lg font-semibold shadow border bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                >
                  تعديل
                </button>
                <button
                  onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) handleDelete(selectedAd.id); }}
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
