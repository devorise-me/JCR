import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface Camel {
    id: string;
    name: string;
    camelID: string;
    age: string;
    sex: string;
}

interface AddCamelButtonProps {
    userId: string;
    onCamelAdded: () => void;
}

const AddCamelButton: React.FC<AddCamelButtonProps> = ({ userId, onCamelAdded }) => {
    const [showAddCamelForm, setShowAddCamelForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        camelID: '',
        age: '',
        sex: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/camels/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ownerId: userId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create camel');
            }

            setFormData({ name: '', camelID: '', age: '', sex: '' });
            setShowAddCamelForm(false);
            onCamelAdded();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create camel');
        }
    };

    return (
        <>
            <Button onClick={() => setShowAddCamelForm(true)}>
                إضافة هجين جديد
            </Button>

            {showAddCamelForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-right">إضافة هجين جديد</h2>
                        {error && <p className="text-red-500 mb-4 text-right">{error}</p>}

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
                                    إضافة
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddCamelForm(false)}
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddCamelButton;