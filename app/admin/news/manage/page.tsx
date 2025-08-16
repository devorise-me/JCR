"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startDate?: string;
  endDate?: string;
  isVisible?: boolean;
}

export default function ManageNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNews(news.filter((item) => item.id !== id));
      } else {
        setError("فشل في حذف الخبر");
      }
    } catch {
      setError("فشل في حذف الخبر");
    }
  };

  const handleToggleVisible = async (id: string, isVisible: boolean) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      if (res.ok) {
        setNews(news.map((item) => item.id === id ? { ...item, isVisible: !isVisible } : item));
      } else {
        setError("فشل في تحديث حالة الظهور");
      }
    } catch {
      setError("فشل في تحديث حالة الظهور");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-blue-700 to-indigo-600">
          إدارة الأخبار
        </h1>
        <p className="mt-2 text-sm text-gray-500">إنشاء، تعديل، إظهار وإخفاء الأخبار</p>
        <div className="mt-4 flex justify-center">
              <button
                className="px-4 py-2 rounded-lg font-semibold shadow border bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={() => router.push('/admin/news/create')}
              >
                إضافة أخبار جديدة
              </button>
            </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-center text-gray-600">لا يوجد أخبار حالياً</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <li
              key={item.id}
              className="group relative rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-100 hover:ring-blue-200 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
                    {item.title}
                  </h2>
                  <div className="flex flex-col items-end text-xs text-gray-500">
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="mt-1 text-[11px] text-gray-400">
                      {item.startDate && <span className="ml-2">بداية: {new Date(item.startDate).toLocaleDateString()}</span>}
                      {item.endDate && <span>نهاية: {new Date(item.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px]">
                  {item.description}
                </div>
                <div className="flex gap-2 mt-2 self-end items-center">
                  <button
                    className="px-4 py-1 rounded-lg font-semibold shadow border bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition"
                    onClick={() => router.push(`/admin/news/edit/${item.id}`)}
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
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-l from-blue-600/70 to-indigo-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 