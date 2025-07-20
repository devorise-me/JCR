"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CamelHistory {
  id?: number;
  name: string;
  camelID?: string;
  age: string;
  sex: string;
  ownerId?: string;
  Date?: string;
  typeOfMethode?: string;
  User?: {
    id: string;
    FirstName: string;
    FamilyName: string;
    username: string;
    email: string;
  };
}

interface User {
  id: string;
  FirstName: string;
  FatherName: string;
  GrandFatherName: string;
  FamilyName: string;
  username: string;
  email: string;
}

interface CamelHistoryFormProps {
  camelHistory?: CamelHistory;
  onSave: (camelHistory: CamelHistory) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CamelHistoryForm: React.FC<CamelHistoryFormProps> = ({
  camelHistory,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CamelHistory>({
    name: "",
    camelID: "",
    age: "",
    sex: "",
    ownerId: "",
    Date: new Date().toISOString().split("T")[0],
    typeOfMethode: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    if (camelHistory) {
      setFormData({
        ...camelHistory,
        Date: camelHistory.Date ? new Date(camelHistory.Date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    }
  }, [camelHistory]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/getUsers?limit=1000");
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        isEditing ? `/api/camelHistory/${camelHistory?.id}` : "/api/camelHistory",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onSave(data);
      } else {
        setError(data.error || "Failed to save camel history");
      }
    } catch (error) {
      setError("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CamelHistory, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? "تعديل سجل الجمل" : "إضافة سجل جمل جديد"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">اسم الجمل *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="camelID">رقم الشريحة</Label>
            <Input
              id="camelID"
              value={formData.camelID || ""}
              onChange={(e) => handleInputChange("camelID", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">العمر *</Label>
            <Select
              value={formData.age}
              onValueChange={(value) => handleInputChange("age", value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر العمر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GradeOne">مفرد</SelectItem>
                <SelectItem value="GradeTwo">حقايق</SelectItem>
                <SelectItem value="GradeThree">لقايا</SelectItem>
                <SelectItem value="GradeFour">جذاع</SelectItem>
                <SelectItem value="GradeFive">ثنايا</SelectItem>
                <SelectItem value="GradeSixMale">زمول</SelectItem>
                <SelectItem value="GradeSixFemale">حيل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sex">النوع *</Label>
            <Select
              value={formData.sex}
              onValueChange={(value) => handleInputChange("sex", value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">قعدان</SelectItem>
                <SelectItem value="Female">بكار</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ownerId">المالك</Label>
            <Select
              value={formData.ownerId || ""}
              onValueChange={(value) => handleInputChange("ownerId", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر المالك" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.FirstName} {user.FamilyName} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="Date">التاريخ</Label>
            <Input
              id="Date"
              type="date"
              value={formData.Date || ""}
              onChange={(e) => handleInputChange("Date", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="typeOfMethode">نوع الطريقة</Label>
          <Input
            id="typeOfMethode"
            value={formData.typeOfMethode || ""}
            onChange={(e) => handleInputChange("typeOfMethode", e.target.value)}
            className="mt-1"
            placeholder="مثال: نقل، بيع، إرث..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEditing ? "تحديث" : "حفظ"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CamelHistoryForm; 