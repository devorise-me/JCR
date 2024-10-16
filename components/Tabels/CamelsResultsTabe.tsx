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

interface Camel {
  ownerId: string;
  id: string;
  name: string;
  age: string;
  sex: string;
  IBAN: string;
  bankName: string;
  ownerName: string;
  swiftCode: string;
  camelID: string; // Added camelID
  NationalID: string; // Added NationalID
}

interface Loop {
  eventId: string;
  id: string;
  age: string;
  sex: string;
  name?: string;
  capacity: number;
}

interface Event {
  id: string;
  name: string;
}

interface ReportData {
  rank: number;
  camelId: number;
  camelName: string;
  loopId: string;
  loopName: string;
  eventId: string;
  eventName: string;
  IBAN: string;
  bankName: string;
  swiftCode: string;
  camelID: string;
  ownerName: string;
  ownerId: string;
  NationalID: string; // Added NationalID
}

export const ReportForm = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [selectedCamel, setSelectedCamel] = useState<string | null>(null);
  const [rank, setRank] = useState<number>(1);
  const [results, setResults] = useState<ReportData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<boolean>(false);
  const [selectedOwnerName, setSelectedOwnerName] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch(() => setError("Error fetching events"));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getLoops`) // تأكد أن هذه النقطة تجلب الأشواط الخاصة بالفعالية فقط
        .then((response) => response.json())
        .then((data) => {
          const filteredLoops = data.filter((loop: Loop) => loop.eventId === selectedEvent); // فلترة الأشواط حسب eventId
          setLoops(filteredLoops);
        })
        .catch(() => setError("Error fetching loops"));
    }
  }, [selectedEvent]);
  

  useEffect(() => {
    if (selectedLoop && selectedEvent) {
      fetch(
        `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`
      )
        .then((response) => response.json())
        .then((data) => {
          const formattedCamels = data.map((camel: any) => ({
            id: camel.id,
            name: camel.name,
            age: camel.age,
            sex: camel.sex,
            IBAN: camel.IBAN ?? "N/A",
            bankName: camel.bankName ?? "N/A",
            swiftCode: camel.swiftCode ?? "N/A",
            ownerName: camel.ownerName ?? "N/A",
            ownerId: camel.ownerId ?? "N/A",
            camelID: camel.camelID ?? "N/A",
            NationalID: camel.NationalID ?? "N/A", // Adding NationalID
          }));
          setCamels(formattedCamels);
        })
        .catch(() => setError("Error fetching camels"));
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

  const handleAddReport = () => {
    if (!selectedCamel || !selectedLoop || !selectedEvent) {
      setError("All fields are required.");
      return;
    }

    if (results.some((report) => report.camelId === Number(selectedCamel))) {
      setError("The camel is already added.");
      return;
    }

    if (results.some((report) => report.rank === rank)) {
      setError("Duplicate rank not allowed.");
      return;
    }

    const event = events.find((event) => event.id === selectedEvent);
    const loop = loops.find((loop) => loop.id === selectedLoop);
    const camel = camels.find((camel) => camel.id === selectedCamel);

    if (!camel) {
      setError("Camel not found.");
      return;
    }

    const reportData: ReportData = {
      rank,
      camelId: Number(selectedCamel),
      camelName: camel.name || "Unknown Camel",
      loopId: selectedLoop,
      loopName: loop
        ? `${translateAge(loop.age)} - ${translateSex(loop.sex)}`
        : "Unknown Loop",
      eventId: selectedEvent,
      eventName: event?.name || "Unknown Event",
      IBAN: camel?.IBAN || "N/A",
      bankName: camel?.bankName || "N/A",
      ownerId: camel?.ownerId || "N/A",
      swiftCode: camel?.swiftCode || "N/A",
      ownerName: camel?.ownerName || "N/A",
      camelID: camel.camelID || "N/A", // Adding camelID
      NationalID: camel.NationalID || "N/A", // Adding NationalID
    };

    setResults((prevResults) => {
      const newResults = [...prevResults, reportData];
      newResults.sort((a, b) => a.rank - b.rank);
      return newResults;
    });

    setSelectedCamel(null);
    setRank(1);
    setSelectedOwnerName(camel.ownerName);
    setError(null);
  };

  const handleRemoveReport = (camelId: number) => {
    setResults((prevResults) =>
      prevResults.filter((report) => report.camelId !== camelId)
    );
  };

  const handlePublish = () => {
    if (results.length === 0) {
      setError("No results to publish.");
      return;
    }
    setConfirmPublish(true);
  };

  const confirmPublishResults = () => {
    fetch("/api/results/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error publishing results");
        return response.json();
      })
      .then(() => {
        alert("Results published successfully!");
        setResults([]);
        setConfirmPublish(false);
      })
      .catch(() => {
        setError("Error publishing results");
        setConfirmPublish(false);
      });
  };

  const handleExportToExcel = () => {
    if (results.length === 0) {
      setError("No results to export.");
      return;
    }
    const filteredResults = results.map(({camelId, loopId, eventId, ownerId, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(filteredResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "camel_race_results.xlsx");
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <Select value={selectedEvent || ""} onValueChange={setSelectedEvent}>
            <SelectTrigger className="border p-2 rounded w-full">
              <SelectValue placeholder="اختر فعالية" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedEvent && (
          <div className="w-full">
            <Select value={selectedLoop || ""} onValueChange={setSelectedLoop}>
              <SelectTrigger className="border p-2 rounded w-full">
                <SelectValue placeholder="اختر شوط" />
              </SelectTrigger>
              <SelectContent>
                {loops
                  .filter(
                    (loop) =>
                      !results.some((result) => result.loopId === loop.id)
                  )
                  .map((loop) => (
                    <SelectItem key={loop.id} value={loop.id}>
                    {translateAge(loop.age)} - {translateSex(loop.sex)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedLoop && (
          <div className="w-full">
            <Select
              value={selectedCamel || ""}
              onValueChange={setSelectedCamel}
            >
              <SelectTrigger className="border p-2 rounded w-full">
                <SelectValue placeholder="اختر الهجن" />
              </SelectTrigger>
              <SelectContent>
                {camels.map((camel) => (
                  <SelectItem key={camel.id} value={camel.id}>
                    {camel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedCamel && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <p>
                Camel Name:{" "}
                {camels.find((camel) => camel.id === selectedCamel)?.name}
              </p>
            </div>
            <div>
              <p>
                Owner:{" "}
                {camels.find((camel) => camel.id === selectedCamel)
                  ?.ownerName || "Unknown"}
              </p>
            </div>
            <div className="w-full">
              <Select
                value={rank.toString()}
                onValueChange={(value) => setRank(Number(value))}
              >
                <SelectTrigger className="border p-2 rounded w-full">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: camels.length }, (_, i) => i + 1).map(
                    (value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleAddReport}>اضف نتيجة</Button>
          </div>
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}

      <Button className="mt-2" onClick={handleAddReport}>إضافة النتيجة</Button>

      {results.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرتبة</TableHead>
                <TableHead>اسم الهجن</TableHead>
                <TableHead>الشوط</TableHead>
                <TableHead>الفعالية</TableHead>
                <TableHead>مالك الهجن</TableHead>
                <TableHead>رقم الشريحة </TableHead>
                <TableHead>الـرقم الوطني للمالك</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((report) => (
                <TableRow className="text-right" key={report.camelId}>
                  <TableCell>{report.rank}</TableCell>
                  <TableCell>{report.camelName}</TableCell>
                  <TableCell>{report.loopName}</TableCell>
                  <TableCell>{report.eventName}</TableCell>
                  <TableCell>{report.ownerName}</TableCell>
                  <TableCell>{report.camelID}</TableCell>
                  <TableCell>{report.NationalID.toString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemoveReport(report.camelId)}>
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex space-x-4 mt-4">
            <Button onClick={handlePublish}>نشر النتائج</Button>
            <Button onClick={handleExportToExcel}>
              تصدير النتائج إلى إكسل
            </Button>
          </div>
        </>
      )}

      {confirmPublish && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center m-0 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg">هل أنت متأكد من رغبتك بإعلان النتيجة؟</h3>
            <div className="mt-4 flex justify-end">
              <Button onClick={confirmPublishResults} className="mr-2">
                نعم
              </Button>
              <Button onClick={() => setConfirmPublish(false)}>لا</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportForm;

 