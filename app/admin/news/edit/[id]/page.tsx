"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TinyEditor from "@/components/admin/TinyEditor";

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImage(data.url);
      } else {
        setError(data.error || 'فشل رفع الصورة');
      }
    } catch (err) {
      setError('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/news`)
      .then((res) => res.json())
      .then((data) => {
        const news = data.find((n: any) => n.id === id);
        if (news) {
          setTitle(news.title);
          setDescription(news.description);
          setImage(news.image || "");
          setStartDate(news.startDate ? news.startDate.slice(0, 10) : "");
          setEndDate(news.endDate ? news.endDate.slice(0, 10) : "");
          setIsPinned(news.isPinned || false);
        } else {
          setError("الخبر غير موجود");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("فشل في تحميل الخبر");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, image, startDate, endDate, isPinned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ ما");
      } else {
        setSuccess("تم تحديث الخبر بنجاح");
        setTimeout(() => router.push("/admin/news/manage"), 1500);
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">تعديل الخبر</h1>
        {loading ? (
          <div className="text-center">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">العنوان</label>
              <input
                type="text"
                placeholder="العنوان"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg w-full transition"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">صورة الخبر</label>
              <div className="relative group">
                {image ? (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img src={image} alt="معاينة" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      حذف وتغيير
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-blue-300 border-dashed rounded-xl bg-blue-50/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-blue-700 font-semibold text-lg">جاري رفع الصورة...</p>
                        <p className="text-blue-500 text-sm mt-1">يرجى الانتظار</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center py-16 px-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 group">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">اضغط لاختيار صورة الخبر</p>
                        <p className="text-gray-500 text-sm mb-4">أو اسحب الصورة وأفلتها هنا</p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          PNG, JPG, GIF حتى 10MB
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">الوصف الكامل</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100">
                <TinyEditor
                  value={description}
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY as string | undefined}
                  init={{
                    height: 350,
                    menubar: false,
                    directionality: "rtl",
                    language: "ar",
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "help",
                      "wordcount",
                    ],
                    toolbar:
                      "undo redo | blocks | bold italic underline forecolor backcolor | " +
                      "alignright aligncenter alignleft alignjustify | bullist numlist outdent indent | " +
                      "removeformat | link image media table | code | help",
                    content_style: "body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; font-size:14px }",
                  }}
                  onEditorChange={(val) => setDescription(val)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">تاريخ البداية</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">تاريخ النهاية</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPinned" className="font-semibold text-gray-700 cursor-pointer">
                تثبيت الخبر في الأعلى
              </label>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-l from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "جاري التحديث..." : "تحديث الخبر"}
            </button>
            {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
            {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 