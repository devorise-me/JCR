"use client";
import { useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";

interface AdItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function AdsPage() {
  const [items, setItems] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[80vh]">
      {/* Hero with background image */}
      <div
        className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/WadiRam.jpeg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">الإعلانات</h1>
            <p className="mt-3 text-white/80">أحدث الإعلانات والتنبيهات للمستخدمين</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-10 px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="text-center text-gray-600">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-700">لا يوجد إعلانات حالياً</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative rounded-2xl bg-white/90 backdrop-blur ring-1 ring-amber-100 hover:ring-amber-300 shadow-sm hover:shadow-xl transition-all duration-200 border-l-4 border-amber-400"
              >
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <HiSpeakerphone className="h-5 w-5" />
                      <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-amber-800 transition-colors">
                        {item.title}
                      </h2>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px]">
                    {item.description}
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



