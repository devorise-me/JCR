"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TinyEditor from "@/components/admin/TinyEditor";
import { Editor as TinyMCEEditor } from 'tinymce';

export default function CreateNewsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) setAuthorId(data.id);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      if (!authorId) {
        setError("تعذر الحصول على هوية المستخدم");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date, authorId, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ ما");
      } else {
        setSuccess("تمت إضافة الخبر بنجاح");
        setTitle("");
        setDescription("");
        setDate("");
        setStartDate("");
        setEndDate("");
        setTimeout(() => router.push("/admin/news/manage"), 1500);
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">إضافة خبر جديد</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">العنوان</label>
            <input
              type="text"
              placeholder="العنوان"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg w-full transition"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">الوصف</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TinyEditor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={description}
                onEditorChange={(content) => setDescription(content)}
                init={{
                  height: 300,
                  menubar: true,
                  directionality: 'rtl',
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help',
                  content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">تاريخ النشر</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">تاريخ البداية</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">تاريخ النهاية</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-l from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "جاري الإضافة..." : "إضافة الخبر"}
          </button>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        </form>
      </div>
    </div>
  );
} 