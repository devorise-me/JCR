"use client";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId: string;
  user?: { id: string; username?: string | null; FirstName?: string | null; FamilyName?: string | null; role?: string | null };
}

// Function to translate database paths to user-friendly labels
const translateAction = (action: string, details?: string) => {
  const actionMap: Record<string, string> = {
    "تعطيل حساب المستخدم": "تعطيل حساب مستخدم",
    "تفعيل حساب المستخدم": "تفعيل حساب مستخدم",
    "حذف حساب المستخدم": "حذف حساب مستخدم",
    "تحديد حسابات تجريبية": "تحديد حسابات تجريبية",
    "حذف حسابات تجريبية": "حذف حسابات تجريبية",
    "إخفاء فعاليات": "إخفاء فعاليات",
    "إظهار فعاليات": "إظهار فعاليات",
    "إكمال فعالية تلقائياً": "إكمال فعالية تلقائياً",
    "إكمال فعاليات منتهية تلقائياً": "إكمال فعاليات منتهية تلقائياً",
    "تعديل نتيجة السباق": "تعديل نتيجة السباق",
    "حذف نتيجة السباق": "حذف نتيجة السباق",
    "نشر نتيجة السباق": "نشر نتيجة السباق",
    "تفعيل المطية": "تفعيل مطية",
    "تعطيل المطية": "تعطيل مطية",
  };

  return actionMap[action] || action;
};

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
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : سجل نشاط المسؤول
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن المسؤول بالاسم"
                    className="border rounded-lg px-3 py-2 w-full max-w-sm"
                  />
                </div>
                {loading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : error ? (
                  <div className="text-red-600 text-center py-8">{error}</div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
                    <table className="min-w-full text-right">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">الوقت</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">النشاط</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">التفاصيل</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">المسؤول</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString("ar-SA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {translateAction(item.action, item.details)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.details || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.userId === "system" ? (
                                <span className="text-blue-600 font-medium">النظام</span>
                              ) : (
                                `${item.user?.FirstName || ''} ${item.user?.FamilyName || ''} (${item.user?.username || '-'})`
                              )}
                            </td>
                          </tr>
                        ))}
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              لا توجد أنشطة مسجلة
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


