import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface Camel {
    id: string;
    age: string;
    sex: string;
    camelID: string;
    name: string;
    camelLoopId?: string;
    loopNumber?: number;
    eventName?: string;
    eventId?: string;
}

interface EditCamelProps {
    camel: Camel;
    onClose: () => void;
    onUpdate: (updatedCamel: Camel) => void;
}

const EditCamelDialog: React.FC<EditCamelProps> = ({ camel, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: camel.name,
        camelID: camel.camelID,
        age: camel.age,
        sex: camel.sex,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({ ...camel, ...formData });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-right">تعديل بيانات الهجين</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-right mb-1">اسم الهجين</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded text-right"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-right mb-1">رقم الشريحة</label>
                        <input
                            type="text"
                            value={formData.camelID}
                            onChange={(e) => setFormData({ ...formData, camelID: e.target.value })}
                            className="w-full p-2 border rounded text-right"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-right mb-1">العمر</label>
                        <select
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full p-2 border rounded text-right"
                            required
                        >
                            <option value="">اختر العمر</option>
                            <option value="GradeOne">مفرد</option>
                            <option value="GradeTwo">حقايق</option>
                            <option value="GradeThree">لقايا</option>
                            <option value="GradeFour">جذاع</option>
                            <option value="GradeFive">ثنايا</option>
                            <option value="GradeSixMale">زمول</option>
                            <option value="GradeSixFemale">حيل</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-right mb-1">الجنس</label>
                        <select
                            value={formData.sex}
                            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                            className="w-full p-2 border rounded text-right"
                            required
                        >
                            <option value="">اختر الجنس</option>
                            <option value="Male">قعدان</option>
                            <option value="Female">بكار</option>
                        </select>
                    </div>

                    <div className="flex justify-between mt-6">
                        <Button type="submit">
                            حفظ التعديلات
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCamelDialog;