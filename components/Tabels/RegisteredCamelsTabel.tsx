import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { TransferCamelModal } from "../ui/TransferCamelModal";
import { useRouter } from "next/navigation";
import { TransferLoopModal } from "../ui/TransferLoopModal";

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
  number: number;
}

interface Event {
  id: string;
  name: string;
}

// المكون الرئيسي للجدول
export const RegisteredCamelsTable = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCamel, setSelectedCamel] = useState<Camel | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isLoopTransferModalOpen, setIsLoopTransferModalOpen] = useState(false);
  const [currentLoopId, setCurrentLoopId] = useState<string>("");

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

  useEffect(() => {
    // جلب الفعاليات
    fetchEvents();
  }, [refresh]);

  const fetchLoops = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/getLoopsWithCamels`);
      if (!response.ok) throw new Error('Failed to fetch loops');
      const data = await response.json();
      setLoops(data);
    } catch (error) {
      console.error("Error fetching loops:", error);
      setError("حدث خطأ أثناء تحميل الأشواط والهجن المسجلة.");
    } finally {
    }
  };

  useEffect(() => {
    // جلب الأشواط والهجن المسجلة لكل فعالية
    if (selectedEvent) {
      fetchLoops(selectedEvent);
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

  const handleTransfer = async (newOwnerId: string) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("! الرجاء تسجيل الدخول");
        router.push("/auth/login");
        return;
      }

      const response = await fetch('/api/camels/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          camelId: selectedCamel?.id,
          newOwnerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      if (selectedEvent) fetchLoops(selectedEvent)


    } catch (error) {
      throw error;
    }
  };

  const handleLoopTransfer = async (camelId: string, newLoopId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("! الرجاء تسجيل الدخول");
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`/api/loops/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          camelId,
          newLoopId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Refresh the loops data
      if (selectedEvent) fetchLoops(selectedEvent);

    } catch (error) {
      throw error;
    }
  };

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
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">اسم المطية</TableHead>
            <TableHead className="text-right">مالك المطية</TableHead>
            <TableHead className="text-right">رقم الشوط</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
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
                    <TableCell className="text-right">{translateSex(camel.sex)}</TableCell>
                    <TableCell className="text-right">{camel.name}</TableCell>
                    <TableCell className="text-right">{camel.ownerName}</TableCell>
                    <TableCell className="text-right">{loop.number}</TableCell>
                    <TableCell className="text-right">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCamel(camel);
                          setIsTransferModalOpen(true);
                        }}
                      >
                        نقل الملكية
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCamel(camel);
                          setCurrentLoopId(loop.id);
                          setIsLoopTransferModalOpen(true);
                        }}
                      >
                        نقل لشوط آخر
                      </Button>
                    </TableCell>
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
      {selectedCamel && (
        <>
          <TransferCamelModal
            isOpen={isTransferModalOpen}
            onClose={() => {
              setIsTransferModalOpen(false);
              setSelectedCamel(null);
            }}
            camel={selectedCamel}
            onTransfer={handleTransfer}
          />
          <TransferLoopModal
            isOpen={isLoopTransferModalOpen}
            onClose={() => {
              setIsLoopTransferModalOpen(false);
              setSelectedCamel(null);
              setCurrentLoopId("");
            }}
            camel={selectedCamel}
            availableLoops={loops}
            currentLoopId={currentLoopId}
            onTransfer={handleLoopTransfer}
          />
        </>
      )}
    </div>
  );
};
