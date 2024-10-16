"use client";
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
  camelID: string;
}

interface Event {
  EndDate: any;
  id: string;
  name: string;
  endDate: string;
}

interface Loop {
  endRegister: string | number | Date;
  sex: string;
  age: string;
  id: string;
  name: string;
  date: string;
  eventId: string;
}

export const RegisteredCamelsOut = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [filteredLoops, setFilteredLoops] = useState<Loop[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch(() => setError("حدث خطأ أثناء جلب الفعاليات"));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getLoops`)
        .then((response) => response.json())
        .then((data) => {
          const currentDate = new Date(); 
          const activeLoops = data.filter((loop: Loop) => {
            const loopEndRegisterDate = new Date(loop.endRegister);
            return loopEndRegisterDate < currentDate; 
          });
          setLoops(activeLoops);
          setFilteredLoops(
            activeLoops.filter((loop: Loop) => loop.eventId === selectedEvent)
          );
        })
        .catch(() => setError("حدث خطأ أثناء جلب الأشواط"));
    } else {
      setLoops([]); 
      setFilteredLoops([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent && selectedLoop) {
      fetch(
        `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`
      )
        .then((response) => response.json())
        .then((camelsData) => {
          setCamels(camelsData);
        })
        .catch(() => setError("حدث خطأ أثناء جلب الجمال"));
    } else {
      setCamels([]); 
    }
  }, [selectedEvent, selectedLoop]);
  if (error) return <p>{error}</p>;

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
        return "";
    }
  }

  return (
    <div className="bg-[url('/desert.jpg')] h-screen bg-center  bg-no-repeat bg-cover flex items-center justify-center">
      <div className="container w-full max-w-[800px] p-6 rounded-lg  bg-white flex flex-col justify-center gap-4">
        <h1 className="text-3xl font-bold mb-4 text-center">
          المطايا المشاركة
        </h1>

        <div className="flex flex-col gap-4 mb-4">
          {/* اختيار الفعالية */}
          <select
            className="border p-2 rounded w-full"
            value={selectedEvent || ""}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setSelectedLoop(null); // إعادة تعيين الشوط عند تغيير الفعالية
            }}
          >
            <option value="">اختر فعالية</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          {selectedEvent && (
            <select
              className="border p-2 rounded w-full"
              value={selectedLoop || ""}
              onChange={(e) => {
                setSelectedLoop(e.target.value);
              }}
            >
              <option value="">اختر شوط</option>
              {filteredLoops.map((loop) => (
                <option key={loop.id} value={loop.id}>
                  {translateAge(loop.age) + ` - ` + translateSex(loop.sex)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* جدول الجمال المسجلة */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">#</TableHead>
              <TableHead className="text-right">رقم الشريحة</TableHead>
              <TableHead className="text-right">اسم المطية</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">مالك المطية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedLoop && camels.length > 0 ? (
              camels.map((camel, index) => (
                <TableRow key={camel.id}>
                  <TableCell className="text-right">{index + 1}</TableCell>
                  <TableCell className="text-right">{camel.camelID}</TableCell>
                  <TableCell className="text-right">{camel.name}</TableCell>
                  <TableCell className="text-right">
                    {translateSex(camel.sex)}
                  </TableCell>
                  <TableCell className="text-right">
                    {camel.ownerName}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  لا توجد جمال مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
