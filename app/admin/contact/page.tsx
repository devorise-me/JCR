"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const TinyEditor = dynamic(() => import("@/components/admin/TinyEditor"), { ssr: false });

export default function AdminContactPage() {
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [authorId, setAuthorId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setAuthorId(d?.id || null));
    }
    fetch("/api/contactPage").then(r => r.json()).then(d => setContent(d?.content || ""));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/contactPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, authorId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "فشل الحفظ");
      } else {
        setMessage("تم الحفظ بنجاح");
      }
    } catch {
      setMessage("حدث خطأ ما");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Contact icons decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute top-8 right-12 w-16 h-16 text-white animate-float" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <svg className="absolute bottom-12 left-16 w-20 h-20 text-white animate-float-delayed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="animate-fade-in">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-2">تعديل صفحة تواصل معنا</h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">إدارة محتوى صفحة التواصل</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 -mt-8 relative z-10">
          <TinyEditor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            value={content}
            onEditorChange={(v: string) => setContent(v)}
            init={{
              height: 500,
              menubar: true,
              directionality: 'rtl',
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar:
                'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | removeformat | help',
              table_advtab: true,
              table_tab_navigation: true,
              content_style: 'body { font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-size:14px }'
            }}
          />
          <div className="mt-6 flex gap-3 justify-end items-center">
            {message && (
              <div className={`text-sm font-medium ${message.includes('نجاح') ? 'text-green-700' : 'text-red-700'}`}>
                {message}
              </div>
            )}
            <button
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


