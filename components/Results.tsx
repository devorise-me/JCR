"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

interface Loop {
  eventId: string;
  id: string;
  age: string;
  sex: string;
  capacity: number;
  time: string;
  number: number;
}

interface Event {
  id: string;
  name: string;
}

interface ReportData {
  rank: number;
  camelId: number;
  camelName: string;
  ownerName: string;
  loopId: string;
  loopName: string;
  eventId: string;
  eventName: string;
  camelID: string; // إضافة حقل camelID
}

const ResultsTabel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [results, setResults] = useState<ReportData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch(() => setError("Error fetching events"));
  }, []);
  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getLoops`) // تأكد أن هذه النقطة تجلب الأشواط الخاصة بالفعالية فقط
        .then((response) => response.json())
        .then((data) => {
          const filteredLoops = data.filter(
            (loop: Loop) => loop.eventId === selectedEvent
          ); // فلترة الأشواط حسب eventId
          setLoops(filteredLoops);
        })
        .catch(() => setError("Error fetching loops"));
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedLoop && selectedEvent) {
      fetch(`/api/results/${selectedEvent}/getLoops/${selectedLoop}/getRes`)
        .then((response) => response.json())
        .then((data) => {
          const formattedResults = data.map((result: any) => ({
            rank: result.rank,
            camelId: result.camelId,
            camelName: result.camelName,
            ownerName: result.ownerName,
            camelID: result.camelID,
          }));

          setResults(formattedResults);
        })
        .catch(() => setError("Error fetching results"));
    }
  }, [selectedLoop, selectedEvent]);

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

  function translateTime(time: string) {
    switch (time) {
      case "Morning":
        return "صباحي";
      case "Evening":
        return "مسائي";
      default:
        return "";
    }
  }

  return (
    <div className="bg-[url('/desert.jpg')] h-screen bg-center bg-no-repeat bg-cover flex items-center justify-center">
      <div className="container w-full max-w-[600px] p-6 rounded-lg bg-white flex flex-col justify-center gap-2">
        <h1 className="text-3xl font-bold mb-4 text-center">نتائج السباق</h1>

        <div className="mb-4 flex flex-col justify-center gap-2">
          <Select onValueChange={setSelectedEvent} value={selectedEvent || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEvent && (
            <Select onValueChange={setSelectedLoop} value={selectedLoop || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Loop" />
              </SelectTrigger>
              <SelectContent>
                {loops.map((loop) => (
                  <SelectItem key={loop.id} value={loop.id}>
                    {translateAge(loop.age) +
                      ` - ` +
                      translateSex(loop.sex) +
                      ` - ` +
                      translateTime(loop.time) +
                      ` - ` +
                      'رقم الشوط: ' + loop.number}

                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedLoop && (
          <>
            {results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المطية</TableHead>
                      <TableHead>صاحب المطية</TableHead>
                      <TableHead>المركز</TableHead>
                      <TableHead>رقم الشريحة</TableHead>{" "}
                      {/* إضافة عنوان لرقم الشريحة */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .sort((a, b) => a.rank - b.rank)
                      .map((result) => (
                        <TableRow
                          className="text-right max-h-[300px] overflow-y-auto"
                          key={result.camelId}
                        >
                          <TableCell>{result.camelName}</TableCell>
                          <TableCell>{result.ownerName}</TableCell>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell>{result.camelID}</TableCell>{" "}
                          {/* إضافة رقم الشريحة */}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center mt-4">لم يتم اعلان النتائج بعد</p>
            )}
          </>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default ResultsTabel;
