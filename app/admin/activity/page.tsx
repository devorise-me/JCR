"use client";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  type: string;
  path: string;
  element?: string;
  createdAt: string;
  user?: { id: string; username?: string | null; FirstName?: string | null; FamilyName?: string | null; role?: string | null };
}

export default function AdminActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const url = `/api/admin-activity?limit=200${query ? `&q=${encodeURIComponent(query)}` : ""}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else setError(data?.error || "فشل التحميل");
      })
      .catch(() => setError("فشل التحميل"))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">سجل نشاط المسؤول</h1>
      <div className="flex items-center justify-between mb-4 gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن المسؤول بالاسم"
          className="border rounded-lg px-3 py-2 w-full max-w-sm"
        />
      </div>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
          <table className="min-w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">الوقت</th>
                <th className="px-4 py-2">النوع</th>
                <th className="px-4 py-2">المسار</th>
                <th className="px-4 py-2">العنصر</th>
                <th className="px-4 py-2">المسؤول</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-2 text-gray-500">{new Date(it.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{it.type}</td>
                  <td className="px-4 py-2 font-mono text-xs">{it.path}</td>
                  <td className="px-4 py-2">{it.element || '-'}</td>
                  <td className="px-4 py-2">{it.user?.FirstName || ''} {it.user?.FamilyName || ''} ({it.user?.username || '-'})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


