import React, { useEffect, useState } from "react";

import { Age, Camel, Sex } from "@prisma/client";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

interface Props {
  className?: string;
  userId: string;
  onClose: () => void;
  onAddCamel: (newCamel: Camel) => void;
  onUpdateCamel?: (updatedCamel: Camel) => void;
  editingCamel?: {
    id: number;
    name: string;
    camelID: string;  // Keep as string
    age: Age;
    sex: Sex;
    ownerId: string;
    disabled?: boolean;
  } | null;
}

const AddCamelsForm: React.FC<Props> = ({
  onClose,
  className,
  userId,
  onAddCamel,
  onUpdateCamel,
  editingCamel,
}) => {
  const [camelDetails, setCamelDetails] = useState({
    name: "",
    camelID: "",  // Ensure this remains a string
    ownerId: userId,
    age: "GradeOne" as Age,
    sex: "Male" as Sex,
  });

  const [errors, setErrors] = useState({
    name: "",
    camelID: "",
    age: "",
    sex: "",
  });

  useEffect(() => {
    if (editingCamel) {
      setCamelDetails({
        name: editingCamel.name || "",
        camelID: editingCamel.camelID || "",  // Ensure this is string
        ownerId: editingCamel.ownerId || userId,
        age: editingCamel.age || "GradeOne",
        sex: editingCamel.sex || "Male",
      });
    }
  }, [editingCamel, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCamelDetails({ ...camelDetails, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCamelDetails({ ...camelDetails, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {
      name: camelDetails.name ? "" : "اسم الجمل مطلوب",
      camelID: camelDetails.camelID ? "" : "رقم الشريحة مطلوب",
      age: camelDetails.age ? "" : "عمر الجمل مطلوب",
      sex: camelDetails.sex ? "" : "جنس الجمل مطلوب",
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Do not submit the form if there are validation errors
    }

    const camelToSubmit = {
      ...camelDetails,
      ownerId: userId,
      camelID: camelDetails.camelID, 
    };

    try {
      if (editingCamel) {
        if (onUpdateCamel) {
          onUpdateCamel({
            ...editingCamel,
            ...camelToSubmit,
            disabled: editingCamel.disabled ?? false,
          });
        }
      } else {
        const response = await fetch("/api/camels/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(camelToSubmit),
        });

        const result = await response.json();
        if (response.ok) {
          onAddCamel(result);
        }
      }
      onClose();
    } catch (error) {
      console.error("Error adding/updating camel:", error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editingCamel ? " تعديل جمل" : "إضافة جمل "}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <Input
              name="name"
              value={camelDetails.name}
              onChange={handleChange}
              placeholder="اسم المطية"
              className="w-full text-right"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="mb-2">
            <Input
              name="camelID"
              type="text" // Ensure this is a text input
              value={camelDetails.camelID}
              onChange={handleChange}
              placeholder="رقم الشريحة"
              className="w-full text-right"
            />
            {errors.camelID && (
              <p className="text-red-500 text-sm">{errors.camelID}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-right">جنس المطية</label>
            <Select
              value={camelDetails.sex}
              onValueChange={(value) => handleSelectChange("sex", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">قعدان</SelectItem>
                <SelectItem value="Female">بكار</SelectItem>
              </SelectContent>
            </Select>
            {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 text-right">صنف المطية</label>
            <Select
              value={camelDetails.age}
              onValueChange={(value) => handleSelectChange("age", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Age" />
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
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          </div>

          <Button type="submit" className="mr-2">
            {editingCamel ? "تحديث البيانات" : "أضف المطية"}
          </Button>
          <Button type="button" onClick={onClose}>
            الغاء
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddCamelsForm;

