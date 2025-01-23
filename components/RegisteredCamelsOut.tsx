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
      .then((data) => {
        const currentDate = new Date();
        const upcomingEvents = data.filter((event: Event) => {
          const eventEndDate = new Date(event.EndDate);
          return eventEndDate > currentDate;
        });
        setEvents(upcomingEvents);
      })
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

  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

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
    <div className="bg-[url('/desert.jpg')] pt-32 min-h-screen bg-center bg-no-repeat bg-cover py-8 px-4">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-lg">
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            المطايا المشاركة
          </h1>

          <div className="grid gap-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="event-select" className="block text-lg font-medium text-right">
                الفعالية
              </label>
              <select
                id="event-select"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={selectedEvent || ""}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setSelectedLoop(null);
                }}
              >
                <option value="">اختر فعالية</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="space-y-2">
                <label htmlFor="loop-select" className="block text-lg font-medium text-right">
                  الشوط
                </label>
                <select
                  id="loop-select"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right py-4 px-4 text-sm font-medium text-gray-700">#</TableHead>
                  <TableHead className="text-right py-4 px-4 text-sm font-medium text-gray-700">رقم الشريحة</TableHead>
                  <TableHead className="text-right py-4 px-4 text-sm font-medium text-gray-700">اسم المطية</TableHead>
                  <TableHead className="text-right py-4 px-4 text-sm font-medium text-gray-700">النوع</TableHead>
                  <TableHead className="text-right py-4 px-4 text-sm font-medium text-gray-700">مالك المطية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedLoop && camels.length > 0 ? (
                  camels.map((camel, index) => (
                    <TableRow key={camel.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <TableCell className="text-right py-4 px-4">{index + 1}</TableCell>
                      <TableCell className="text-right py-4 px-4">{camel.camelID}</TableCell>
                      <TableCell className="text-right py-4 px-4">{camel.name}</TableCell>
                      <TableCell className="text-right py-4 px-4">
                        {translateSex(camel.sex)}
                      </TableCell>
                      <TableCell className="text-right py-4 px-4">
                        {camel.ownerName}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      لا توجد جمال مسجلة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};