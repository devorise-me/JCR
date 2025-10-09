import { useCallback, useState } from "react";
import { Button } from "../ui/button";
// import { Loop } from "@prisma/client";

type Loop = {
  eventId: string;
  id: string;
  capacity: number;
  age: string;
  sex: string;
  time: string;
  startRegister: string | Date;
  endRegister: string | Date;
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

  const calculateInitialTimer = useCallback(() => {
    const now = new Date();
    const endTime = new Date(loop.endRegister);
    const remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
    return remainingTime;
  }, [loop]);

  const [capacity, setCapacity] = useState<number>(loop.capacity);
  const [age, setAge] = useState<string>(loop.age);
  const [sex, setSex] = useState<string>(loop.sex);
  const [timerMinutes, setTimerMinutes] = useState<number>(calculateInitialTimer());
  const [time, setTime] = useState<string>(loop.time);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState<number>(loop.number);

  const handleUpdateLoop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loops.find(l => (l.sex === sex && l.number === number && l.age === age)) !== undefined) {
      console.log("test")
      setError("رقم الشوط موجود بالفعل.");
      return;
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + timerMinutes * 60000);

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
          startRegister: now,
          endRegister: endTime,
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
            <select
              id="number"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 border rounded"
              required
            >
              <option value={1}>رقم الشوط 1</option>
              <option value={2}>رقم الشوط 2</option>
              <option value={3}>رقم الشوط 3</option>
            </select>
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
              نوع الشوط
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded "
            >
              <option value="Morning">صباحي</option>
              <option value="Evening">مسائي</option>
              <option value="Local">محلي</option>
              <option value="General">عام</option>
              <option value="International">دولي</option>
              <option value="GeneralSymbolRound">شوط رمز عام</option>
              <option value="InternationalCodeRound">شوط رمز دولي</option>
              <option value="SymbolRun">شوط رمز</option>
            </select>
          </div>
          <div className="mb-4 text-end">
            <label htmlFor="timer" className="block text-sm font-bold mb-1">
              مدة التسجيل (بالدقائق)
            </label>
            <input
              id="timer"
              type="number"
              min="1"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
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
