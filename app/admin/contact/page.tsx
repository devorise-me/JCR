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
      fetch("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setAuthorId(d?.id || null));
    }
    fetch("/api/contact").then(r => r.json()).then(d => setContent(d?.content || ""));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/contact", {
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">تعديل صفحة تواصل معنا</h1>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
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
        <div className="mt-4 flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded-lg font-semibold shadow border bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
        {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
}


