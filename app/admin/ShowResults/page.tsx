"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
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

interface Event {
  id: string;
  name: string;
}

interface Loop {
  eventId: string;
  id: string;
  name: string;
  age: string;
  sex: string;
  capacity: number;
  time: string;
  number: number;
}

interface Result {
  rank: number;
  camelName: string;
  ownerName: string;
  IBAN: string;
  SwiftCode: string;
  bankName: string;
  NationalID?: string;
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

const ReportForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then((data: Event[]) => {
        setEvents(data);
      })
      .catch(() => setError("Error fetching events"));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getResultsLoops`)
        .then((response) => response.json())
        .then((data: Loop[]) => {
          setLoops(data);
        })
        .catch(() => setError("Error fetching loops"));
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent && selectedLoop) {
      fetch(`/api/results/${selectedEvent}/getLoops/${selectedLoop}/getRes`)
        .then((response) => response.json())
        .then((data: Result[]) => {
          setResults(data);
        })
        .catch(() => setError("Error fetching race results"));
    }
  }, [selectedEvent, selectedLoop]);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Race Results");
    XLSX.writeFile(wb, "race_results.xlsx");
  };

  return (
    <div className="flex flex-col items-center w-full p-4 bg-white rounded-lg shadow-lg">
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4 w-full items-center mb-4">
        <Select onValueChange={(value) => setSelectedEvent(value)}>
          <SelectTrigger className="w-60">
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

        <Select
          onValueChange={(value) => setSelectedLoop(value)}
          disabled={!selectedEvent}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Select Loop" />
          </SelectTrigger>
          <SelectContent>
            {loops.length > 0 && loops?.map((loop) => (
              <SelectItem key={loop.id} value={loop.id}>
                {translateAge(loop.age) + " - " + translateSex(loop.sex) + " - " + "رقم الشوط" + " " + loop.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleExport} disabled={results.length === 0}>
          طباعة
        </Button>
      </div>

      {selectedLoop && results.length === 0 ? (
        <p className="text-red-500">لا توجد نتائج بعد</p>
      ) : (
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرتبة</TableHead>
                <TableHead>اسم المطية</TableHead>
                <TableHead>اسم المالك</TableHead>
                <TableHead>الآيبان</TableHead>
                <TableHead>السويفت كود</TableHead>
                <TableHead>اسم البنك</TableHead>
                <TableHead>الرقم الوطني</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results
                .sort((a, b) => a.rank - b.rank)
                .map((result, index) => (
                  <TableRow className="text-right" key={index}>
                    <TableCell>{result.rank}</TableCell>
                    <TableCell>{result.camelName}</TableCell>
                    <TableCell>{result.ownerName}</TableCell>
                    <TableCell>{result.IBAN}</TableCell>
                    <TableCell>{result.SwiftCode}</TableCell>
                    <TableCell>{result.bankName}</TableCell>
                    <TableCell>{result.NationalID || "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
const Page = () => {
  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : النتائج السباق
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              <ReportForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
