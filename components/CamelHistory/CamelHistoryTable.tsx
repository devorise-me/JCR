"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";
import CamelHistoryForm, { CamelHistory } from "./CamelHistoryForm";
import { translateAge, translateSex } from "@/lib/helper";


const CamelHistoryTable: React.FC = () => {
  const [camelHistories, setCamelHistories] = useState<CamelHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCamelHistory, setEditingCamelHistory] = useState<CamelHistory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCamelHistories();
  }, [currentPage, searchTerm]);

  const fetchCamelHistories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
      });

      const response = await fetch(`/api/camelHistory?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCamelHistories(data.camelHistories);
        setHasMore(data.pagination.hasMore);
      } else {
        setError(data.error || "Failed to fetch camel history");
      }
    } catch (error) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (camelHistory: CamelHistory) => {
    if (editingCamelHistory) {
      setCamelHistories(prev =>
        prev.map(item =>
          item.id === camelHistory.id ? camelHistory : item
        )
      );
    } else {
      setCamelHistories(prev => [camelHistory, ...prev]);
    }
    setShowForm(false);
    setEditingCamelHistory(null);
  };

  const handleEdit = (camelHistory: CamelHistory) => {
    setEditingCamelHistory(camelHistory);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/camelHistory/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCamelHistories(prev => prev.filter(item => item.id !== id));
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete camel history");
      }
    } catch (error) {
      setError("An error occurred while deleting");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  if (showForm) {
    return (
      <div className="p-6">
        <CamelHistoryForm
          camelHistory={editingCamelHistory || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCamelHistory(null);
          }}
          isEditing={!!editingCamelHistory}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">سجل الجمال</h1>
        <Button onClick={() => setShowForm(true)}>
          <MdAdd className="mr-2" />
          إضافة سجل جديد
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="البحث في سجل الجمال..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الجمل</TableHead>
              <TableHead>رقم الشريحة</TableHead>
              <TableHead>العمر</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المالك</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>نوع الطريقة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : camelHistories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  لا توجد سجلات
                </TableCell>
              </TableRow>
            ) : (
              camelHistories.map((camelHistory) => (
                <TableRow key={camelHistory.id}>
                  <TableCell className="font-medium">{camelHistory.name}</TableCell>
                  <TableCell>{camelHistory.camelID || "غير محدد"}</TableCell>
                  <TableCell>{translateAge(camelHistory.age)}</TableCell>
                  <TableCell>{translateSex(camelHistory.sex)}</TableCell>
                  <TableCell>
                    {camelHistory.User
                      ? `${camelHistory.User.FirstName} ${camelHistory.User.FamilyName}`
                      : "غير محدد"}
                  </TableCell>
                  <TableCell>{formatDate(camelHistory.Date)}</TableCell>
                  <TableCell>{camelHistory.typeOfMethode || "غير محدد"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(camelHistory)}
                      >
                        <MdEdit />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(camelHistory.id || null)}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          الصفحة {currentPage}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore}
          >
            التالي
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="mb-4">هل أنت متأكد من حذف هذا السجل؟</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(confirmDelete)}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamelHistoryTable; 