"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditAdPage() {
  const params = useParams();
  const id = params?.id as string;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/ads/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          setDate(data.date ? new Date(data.date).toISOString().split("T")[0] : "");
        } else {
          setError("تعذر تحميل الإعلان");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/ads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء التعديل");
      } else {
        setSuccess("تم التعديل بنجاح");
        setTimeout(() => router.push("/admin/ads/manage"), 1200);
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">تعديل الإعلان</h1>
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
            <label className="block mb-1 font-semibold text-gray-700">الوصف</label>
            <textarea
              placeholder="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg w-full min-h-[120px] transition"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">تاريخ النشر</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg w-full transition"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-l from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        </form>
      </div>
    </div>
  );
}


