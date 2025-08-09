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
                  <span className="shrink-0 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px]">
                  {item.description}
                </div>
                {item.author && (
                  <div className="text-xs text-gray-400 self-end">بواسطة: {item.author.username || "-"}</div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-l from-blue-600/70 to-indigo-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 