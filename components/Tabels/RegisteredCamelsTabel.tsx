import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Camel {
  id: string;
  name: string;
  age: string;
  sex: string;
  ownerName: string;
  camelID: string; // إضافة خاصية رقم الشريحة هنا
}

interface Loop {
  eventId: string;
  id: string;
  age: string;
  sex: string;
  camels?: Camel[];
}

interface Event {
  id: string;
  name: string;
}

// المكون الرئيسي للجدول
export const RegisteredCamelsTable = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب الفعاليات
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/getEvents");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(": حدث خطأ اثناء تحميل الفعالية", error);
        setError("حدث خطأ أثناء تحميل الفعاليات.");
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // جلب الأشواط والهجن المسجلة لكل فعالية
    if (selectedEvent) {
      const fetchLoops = async () => {
        try {
          const response = await fetch(`/api/events/${selectedEvent}/getLoops`);
          const data = await response.json();
          setLoops(data.filter((loop: Loop) => loop.eventId === selectedEvent));

          // Fetch camels registered for each loop
          for (const loop of data) {
            const registeredResponse = await fetch(
              `/api/events/${selectedEvent}/getLoops/${loop.id}/registeredCamels`
            );
            const registeredCamels = await registeredResponse.json();
            setLoops((prevLoops) =>
              prevLoops.map((prevLoop) =>
                prevLoop.id === loop.id
                  ? { ...prevLoop, camels: registeredCamels }
                  : prevLoop
              )
            );
          }
        } catch (error) {
          console.error(": حدث خطأ اثناء تحميل الأشواط", error);
          setError("حدث خطأ أثناء تحميل الأشواط والهجن المسجلة.");
        }
      };

      fetchLoops();
    }
  }, [selectedEvent]);

  if (error) return <p>{error}</p>;

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

  function translateSex(sex: string) {
    switch (sex) {
      case "Male":
        return "قعدان";
      case "Female":
        return "بكار";
      default:
        return "";
    }
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-4">
        {/* اختيار الفعالية */}
        <select
          className="border p-2 rounded w-[300px]"
          value={selectedEvent || ""}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">اختر فعالية</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* جدول الهجن المسجلة */}
      <Table className="w-full" id="RegisteredCamels">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">#</TableHead>
            <TableHead className="text-right">رقم الشريحة</TableHead> {/* إضافة عنوان رقم الشريحة */}
            <TableHead className="text-right">اسم المطية</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">مالك المطية</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loops.map((loop) => (
            <React.Fragment key={loop.id}>
              {/* عرض كل شوط والجمال المسجلة به */}
              <TableRow>
                <TableCell colSpan={5} className="font-bold text-right">
                  {translateAge(loop.age)} 
                </TableCell>
              </TableRow>
              {loop.camels && loop.camels.length > 0 ? (
                loop.camels.map((camel, index) => (
                  <TableRow key={camel.id}>
                    <TableCell className="text-right">{index + 1}</TableCell>
                    <TableCell className="text-right">{camel.camelID}</TableCell> {/* عرض رقم الشريحة */}
                    <TableCell className="text-right">{camel.name}</TableCell>
                    <TableCell className="text-right">{translateSex(camel.sex)}</TableCell>
                    <TableCell className="text-right">{camel.ownerName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    لا توجد هجن مسجلة في هذا الشوط
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
