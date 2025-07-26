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
    <div className="max-w-4xl mx-auto mt-12 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">إدارة الأخبار</h1>
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-center">لا يوجد أخبار حالياً</div>
      ) : (
        <ul className="flex flex-col gap-8">
          {news.map((item) => (
            <li key={item.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col gap-2 relative hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold text-blue-800">{item.title}</h2>
                <div className="flex flex-col md:flex-row md:gap-4 text-sm text-gray-500">
                  <span>تاريخ النشر: {new Date(item.date).toLocaleDateString()}</span>
                  {item.startDate && <span>تاريخ البداية: {new Date(item.startDate).toLocaleDateString()}</span>}
                  {item.endDate && <span>تاريخ النهاية: {new Date(item.endDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="text-gray-800 mb-2 whitespace-pre-line">{item.description}</div>
              <div className="flex gap-2 mt-2 self-end items-center">
                <button
                  className="bg-yellow-500 text-white px-4 py-1 rounded-lg font-semibold shadow hover:bg-yellow-600 transition"
                  onClick={() => router.push(`/admin/news/edit/${item.id}`)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded-lg font-semibold shadow hover:bg-red-700 transition"
                  onClick={() => handleDelete(item.id)}
                >
                  حذف
                </button>
                <button
                  className={`px-4 py-1 rounded-lg font-semibold shadow transition border ${item.isVisible ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                  onClick={() => handleToggleVisible(item.id, !!item.isVisible)}
                >
                  {item.isVisible ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 