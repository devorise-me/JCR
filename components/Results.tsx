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
import { Button } from "@/components/ui/button";
import { translateAge, translateSex, translateTime } from "@/lib/helper";

interface Loop {
  eventId: string;
  id: string;
  age: string;
  sex: string;
  capacity: number;
  time: string;
  number: number;
  numberOfResults?: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 10;

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

          // Limit results based on loop's numberOfResults setting
          const loop = loops.find((l) => l.id === selectedLoop);
          const maxResults = loop?.numberOfResults || 10;
          const limitedResults = formattedResults.slice(0, maxResults);

          setResults(limitedResults);
        })
        .catch(() => setError("Error fetching results"));
    }
  }, [selectedLoop, selectedEvent, loops]);

  // Pagination logic
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results
    .sort((a, b) => a.rank - b.rank)
    .slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE);

  // Reset to page 1 when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results, selectedLoop]);


  return (
    <div className="bg-[url('/desert.jpg')] min-h-screen bg-center bg-no-repeat bg-cover flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-2xl p-4 sm:p-6 rounded-2xl bg-white/90 flex flex-col justify-center gap-4 shadow-2xl border border-slate-100">
        <h1 className="text-3xl font-bold mb-4 text-center text-slate-800">نتائج السباق</h1>

        <div className="mb-4 flex flex-col gap-3 w-full">
          <Select onValueChange={setSelectedEvent} value={selectedEvent || ""}>
            <SelectTrigger className="w-full h-12 rounded-lg border-slate-300 shadow-sm text-base" >
              <SelectValue placeholder="اختر الفعالية" />
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
              <SelectTrigger className="w-full h-12 rounded-lg border-slate-300 shadow-sm text-base" >
                <SelectValue placeholder="اختر الشوط" />
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
              <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white/80 shadow w-full">
                <div className="w-full overflow-x-auto">
                  <Table className="w-full min-w-[500px]">
                    <TableHeader className="sticky top-0 bg-white/90 z-10">
                      <TableRow>
                        <TableHead className="text-slate-700 font-bold text-base px-2 py-2 sm:px-4 sm:py-3">اسم المطية</TableHead>
                        <TableHead className="text-slate-700 font-bold text-base px-2 py-2 sm:px-4 sm:py-3">صاحب المطية</TableHead>
                        <TableHead className="text-slate-700 font-bold text-base px-2 py-2 sm:px-4 sm:py-3">المركز</TableHead>
                        <TableHead className="text-slate-700 font-bold text-base px-2 py-2 sm:px-4 sm:py-3">رقم الشريحة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedResults.map((result) => (
                        <TableRow
                          className="text-right hover:bg-blue-50/60 transition-colors"
                          key={result.camelId}
                        >
                          <TableCell className="text-sm sm:text-base font-medium text-slate-800 px-2 py-2 sm:px-4 sm:py-3">{result.camelName}</TableCell>
                          <TableCell className="text-sm sm:text-base text-slate-700 px-2 py-2 sm:px-4 sm:py-3">{result.ownerName}</TableCell>
                          <TableCell className="text-sm sm:text-base font-bold text-blue-700 px-2 py-2 sm:px-4 sm:py-3">{result.rank}</TableCell>
                          <TableCell className="text-sm sm:text-base font-mono text-slate-600 px-2 py-2 sm:px-4 sm:py-3">{result.camelID}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <p className="text-center mt-4">لم يتم اعلان النتائج بعد</p>
            )}

            {/* Pagination Controls */}
            {results.length > RESULTS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 w-full sm:w-auto"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  السابق
                </Button>
                <span className="text-slate-700 font-semibold text-sm sm:text-base">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 w-full sm:w-auto"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}

        {error && <p className="text-red-500 text-center font-semibold mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ResultsTabel;
