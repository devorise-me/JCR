import { useState } from "react";
import { Button } from "../ui/button";
// import { Loop } from "@prisma/client";

type Loop = {
  eventId: string;
  id: string;
  capacity: number;
  age: string;
  sex: string;
  time: string;
  startRegister: Date;
  endRegister: Date;
  number: number;
}

interface UpdateLoopFormProps {
  loop: Loop;
  eventEndDate: Date; // Add this line
  onClose: () => void;
  onLoopUpdated: () => void;
  loops: Loop[];
}

const UpdateLoopForm: React.FC<UpdateLoopFormProps> = ({ loop, eventEndDate, onClose, onLoopUpdated, loops }) => {
  const [capacity, setCapacity] = useState<number>(loop.capacity);
  const [age, setAge] = useState<string>(loop.age);
  const [sex, setSex] = useState<string>(loop.sex);
  const [time, setTime] = useState<string>(loop.time);
  const [startRegister, setStartRegister] = useState<Date>(new Date(loop.startRegister));
  const [endRegister, setEndRegister] = useState<Date>(new Date(loop.endRegister));
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState<number>(loop.number);

  const handleUpdateLoop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loops.find(l => (l.sex === sex && l.number === number)) !== undefined) {
      console.log("test")
      setError("رقم الشوط موجود بالفعل.");
      return;
    }

    // Validate endRegister date
    if (new Date(endRegister) > new Date(eventEndDate)) {
      setError("تاريخ نهاية الشوط لا يمكن أن يتجاوز تاريخ نهاية الفعالية");
      return;
    }

    try {
      const response = await fetch(`/api/events/${loop.eventId}/getLoops/${loop.id}/updateLoop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capacity,
          age,
          sex,
          time,
          startRegister: startRegister.toISOString(),
          endRegister: endRegister.toISOString(),
          number,
        }),
      });
      if (response.ok) {
        onLoopUpdated();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating loop:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">تحديث الشوط</h3>
        <form onSubmit={handleUpdateLoop}>
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4 text-end">
            <label htmlFor="capacity" className="block text-sm font-bold mb-1">
              سعة الشوط
            </label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 text-end">
            <label htmlFor="number" className="block text-sm font-bold mb-1">
              رقم الشوط
            </label>
            <input
              id="number"
              type="number"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 text-end">
            <label htmlFor="age" className="block text-sm font-bold mb-1">
              الفئة / السن
            </label>
            <select
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="GradeOne">مفرد</option>
              <option value="GradeTwo">حقايق</option>
              <option value="GradeThree">لقايا</option>
              <option value="GradeFour">جذاع</option>
              <option value="GradeFive">ثنايا</option>
              <option value="GradeSixMale">زمول</option>
              <option value="GradeSixFemale">حيل</option>
            </select>
          </div>
          <div className="mb-4 text-end">
            <label htmlFor="sex" className="block text-sm font-bold mb-1">
              النوع
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Male">قعدان</option>
              <option value="Female">بكار</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-bold mb-1 text-end">
              الوقت
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded "
            >
              <option value="Morning">صباحي</option>
              <option value="Evening">مسائي</option>
            </select>
          </div>
          <label className="block mb-2">
            تاريخ البدء:
            <input
              type="date"
              value={startRegister.toISOString().split('T')[0]}
              onChange={(e) => setStartRegister(new Date(e.target.value))}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </label>
          <label className="block mb-2">
            تاريخ الانتهاء:
            <input
              type="date"
              value={endRegister.toISOString().split('T')[0]}
              onChange={(e) => setEndRegister(new Date(e.target.value))}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </label>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              onClick={onClose}
              variant="outline"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
            >
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLoopForm;
