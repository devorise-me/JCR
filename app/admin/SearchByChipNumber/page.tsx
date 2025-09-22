"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CamelHistory {
  id: number;
  name: string;
  camelID: string | null;
  age: string;
  sex: string;
  ownerId: string | null;
  Date: string | null;
  typeOfMethode: string | null;
  User: {
    id: string;
    FirstName: string;
    FatherName: string;
    GrandFatherName: string;
    FamilyName: string;
    username: string;
    email: string;
  } | null;
}

interface ApiResponse {
  data: CamelHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

function translateSex(sex: string) {
  switch (sex) {
    case "Male":
      return "قعدان";
    case "Female":
      return "بكار";
    default:
      return sex;
  }
}

function translateAge(age: string) {
  switch (age) {
    case "GradeOne":
      return "مفرد";
    case "GradeTwo":
      return "حقايق";
    case "GradeThree":
      return "لقايا";
    case "GradeFour":
      return "جذاع";
    case "GradeFive":
      return "ثنايا";
    case "GradeSixMale":
      return "زمول";
    case "GradeSixFemale":
      return "حيل";
    default:
      return age;
  }
}

const ReportForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [chipNumber, setChipNumber] = useState<string>("");
  const [camelHistories, setCamelHistories] = useState<CamelHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchCamelHistory = async (searchTerm: string, page: number = 1) => {
    if (!searchTerm.trim()) {
      setCamelHistories([]);
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/camelHistory?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=50`);
      const data: ApiResponse = await response.json();
      
      if (response.ok) {
        setCamelHistories(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || "حدث خطأ أثناء جلب البيانات");
      }
    } catch (error) {
      console.error("Error fetching camel history:", error);
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCamelHistory(chipNumber, 1);
  };

  const handleExport = () => {
    if (camelHistories.length === 0) return;

    const exportData = camelHistories.map(history => ({
      "نوع الحركة": history.typeOfMethode || "غير محدد",
      "التاريخ": history.Date ? new Date(history.Date).toLocaleDateString('ar-SA') : "غير محدد",
      "اسم المطية": history.name,
      "رقم الشريحة": history.camelID || "غير محدد",
      "النوع": translateSex(history.sex),
      "الفئة": translateAge(history.age),
      "اسم مالك المطية": history.User ? `${history.User.FirstName} ${history.User.FamilyName}` : "غير محدد",
      "اسم المستخدم": history.User?.username || "غير محدد",
      "البريد الإلكتروني": history.User?.email || "غير محدد"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camel History");
    XLSX.writeFile(wb, `camel_history_${chipNumber}.xlsx`);
  };

  return (
    <div className="flex flex-col items-center w-full p-4 bg-white rounded-lg shadow-lg">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 w-full items-center mb-4">
        <input
          type="text"
          placeholder="رقم الشريحة"
          className="w-60 px-3 py-2 border border-gray-300 rounded-md"
          value={chipNumber}
          onChange={(e) => setChipNumber(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !chipNumber.trim()}
          className="px-6"
        >
          {loading ? "جاري البحث..." : "بحث"}
        </Button>
        {camelHistories.length > 0 && (
          <Button onClick={handleExport} variant="outline">
            تصدير إلى Excel
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">جاري البحث...</p>
      ) : chipNumber && camelHistories.length === 0 ? (
        <p className="text-gray-500">لا توجد نتائج لهذا الرقم</p>
      ) : camelHistories.length > 0 ? (
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع الحركة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>اسم المطية</TableHead>
                <TableHead>رقم الشريحة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>اسم مالك المطية</TableHead>
                <TableHead>اسم المستخدم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {camelHistories.map((history) => (
                <TableRow className="text-right" key={history.id}>
                  <TableCell>{history.typeOfMethode || "غير محدد"}</TableCell>
                  <TableCell>
                    {history.Date
                      ? new Date(history.Date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit", // Added seconds
                          hour12: true,
                        })
                      : "غير محدد"}
                  </TableCell>
                  <TableCell>{history.name}</TableCell>
                  <TableCell>{history.camelID || "غير محدد"}</TableCell>
                  <TableCell>{translateSex(history.sex)}</TableCell>
                  <TableCell>{translateAge(history.age)}</TableCell>
                  <TableCell>
                    {history.User
                      ? `${history.User.FirstName} ${history.User.FamilyName}`
                      : "غير محدد"}
                  </TableCell>
                  <TableCell>{history.User?.username || "غير محدد"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={() =>
                  fetchCamelHistory(chipNumber, pagination.page - 1)
                }
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                السابق
              </Button>
              <span className="px-4 py-2">
                صفحة {pagination.page} من {pagination.totalPages}
              </span>
              <Button
                onClick={() =>
                  fetchCamelHistory(chipNumber, pagination.page + 1)
                }
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const Page = () => {
  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : البحث برقم الشريحة
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              <ReportForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
