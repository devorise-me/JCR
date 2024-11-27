import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface Loop {
  id: string;
  eventId: string;
  capacity: number;
  age: string;
  sex: string;
  time: string;
  startRegister: string | Date;
  endRegister: string | Date;
  number: number;
}

interface CreateLoopFormProps {
  eventId: string;
  eventStartDate: string; // Add event start date as a prop
  eventEndDate: string; // Add event end date as a prop
  onClose: () => void;
  onAddLoop: (newLoop: Loop) => void;
  loops: Loop[];
}

const CreateLoopForm: React.FC<CreateLoopFormProps> = ({
  eventId,
  eventStartDate,
  eventEndDate,
  onClose,
  onAddLoop,
  loops
}) => {
  const [capacity, setCapacity] = useState<number>(0);
  const [age, setAge] = useState<string>("GradeOne");
  const [sex, setSex] = useState<string>("Male");
  const [time, setTime] = useState<string>("Morning");
  const [startRegisterDate, setStartRegisterDate] = useState<string>("");
  const [startRegisterTime, setStartRegisterTime] = useState<string>("00:00");
  const [endRegisterDate, setEndRegisterDate] = useState<string>("");
  const [endRegisterTime, setEndRegisterTime] = useState<string>("00:00");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [number, setNumber] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capacity || !age || !sex || !time || !startRegisterDate || !endRegisterDate || !number) {
      setError("جميع الحقول مطلوبة.");
      return;
    }

    if (loops.find(l => (l.sex === sex && l.number === number && l.age === age)) !== undefined) {
      console.log("test")
      setError("رقم الشوط موجود بالفعل.");
      return;
    }

    // Validate that all fields are filled

    const startDateTime = new Date(`${startRegisterDate}T${startRegisterTime}:00.000Z`);
    const endDateTime = new Date(`${endRegisterDate}T${endRegisterTime}:00.000Z`);
    const eventStart = new Date(eventStartDate);
    const eventEnd = new Date(eventEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the day for accurate comparison

    // Validate that the start date is today or in the future
    if (startDateTime < today) {
      setError("يجب أن يكون تاريخ البدء اليوم أو في المستقبل.");
      return;
    }
    // Validate that the end registration date is within the event's date range
    if (endDateTime > eventEnd) {
      setError("يجب أن يكون تاريخ نهاية التسجيل قبل أو يساوي تاريخ انتهاء الحدث.");
      return;
    }

    // Validate that end date is after start date
    if (endDateTime <= startDateTime) {
      setError("يجب أن يكون تاريخ النهاية بعد تاريخ البدء.");
      return;
    }

    const loopData: Loop = {
      id: "", // id will be assigned by the server
      eventId,
      capacity,
      age,
      sex,
      time,
      startRegister: startDateTime,
      endRegister: endDateTime,
      number: number,
    };

    setIsLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/loops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطأ غير معروف.");
      }

      const data = await response.json();
      onAddLoop(data); // تحديث القائمة بالشوط الجديد
      onClose(); // إغلاق النموذج مباشرة بعد الإضافة
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء الإرسال.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {isLoading && <div className="mb-4">جاري إرسال البيانات...</div>}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
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
              onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
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
          <div className="mb-4">
            <label className="block mb-2">
              تاريخ البدء للتسجيل:
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startRegisterDate}
                  onChange={(e) => setStartRegisterDate(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  required
                />
                <input
                  type="time"
                  value={startRegisterTime}
                  onChange={(e) => setStartRegisterTime(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              تاريخ النهاية للتسجيل:
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endRegisterDate}
                  onChange={(e) => setEndRegisterDate(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  required
                />
                <input
                  type="time"
                  value={endRegisterTime}
                  onChange={(e) => setEndRegisterTime(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
            </label>
          </div>
          <div className="flex justify-between">
            <Button type="submit">إنشاء</Button>
            <Button variant="outline" onClick={handleClose}>إغلاق</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoopForm;
