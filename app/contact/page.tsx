"use client";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        setContent(data?.content || "");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-white to-blue-50/40">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-blue-700 to-indigo-600">
            تواصل معنا
          </h1>
          <p className="mt-2 text-sm text-gray-500">نرحب بملاحظاتكم واستفساراتكم</p>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        ) : (
          <article className="prose prose-slate max-w-none prose-headings:text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-li:marker:text-blue-600" dir="rtl">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}
      </div>
    </div>
  );
}


