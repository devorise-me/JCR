"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startDate?: string;
  endDate?: string;
  isVisible?: boolean;
}

export default function ManageAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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

  const handleToggleVisible = async (id: string, isVisible: boolean) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      if (res.ok) {
        setAds(ads.map((item) => (item.id === id ? { ...item, isVisible: !isVisible } : item)));
      } else {
        setError("فشل في تحديث حالة الظهور");
      }
    } catch {
      setError("فشل في تحديث حالة الظهور");
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero with background */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/desert2.jpg)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">إدارة الإعلانات</h1>
            <p className="mt-2 text-sm text-white/80">إنشاء، تعديل، إظهار وإخفاء الإعلانات</p>
            <div className="mt-4 flex justify-center">
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
        <div className="text-center text-gray-600">لا يوجد إعلانات حالياً</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((item) => (
            <li
              key={item.id}
              className="group relative rounded-2xl bg-white/90 backdrop-blur ring-1 ring-amber-100 hover:ring-amber-300 shadow-sm hover:shadow-xl transition-all duration-200 border-l-4 border-amber-400"
            >
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
                    {item.title}
                  </h2>
                  <div className="flex flex-col items-end text-xs text-gray-500">
                    <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px]">
                  {item.description}
                </div>
                <div className="flex gap-2 mt-2 self-end items-center">
                  <button
                    className="px-4 py-1 rounded-lg font-semibold shadow border bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                    onClick={() => router.push(`/admin/ads/edit/${item.id}`)}
                  >
                    تعديل
                  </button>
                  <button
                    className="px-4 py-1 rounded-lg font-semibold shadow border bg-red-50 text-red-700 hover:bg-red-100 transition"
                    onClick={() => handleDelete(item.id)}
                  >
                    حذف
                  </button>
                  <button
                    className={`px-4 py-1 rounded-lg font-semibold shadow border transition ${item.isVisible ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleToggleVisible(item.id, !!item.isVisible)}
                  >
                    {item.isVisible ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-l from-amber-500/80 to-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}


