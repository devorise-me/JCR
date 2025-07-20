"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-12 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">الأخبار</h1>
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
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
              <div className="text-gray-800 mb-2 whitespace-pre-line leading-relaxed text-lg">{item.description}</div>
              {item.author && (
                <div className="text-xs text-gray-400 mt-2 self-end">بواسطة: {item.author.username || "-"}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 