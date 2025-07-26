import React, { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trophy, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface Camel {
  id: string;
  name: string;
  age: string;
  sex: string;
  IBAN: string;
  bankName: string;
  ownerName: string;
  swiftCode: string;
  camelID: string;
  ownerId: string;
  NationalID: string;
}

interface Loop {
  eventId: string;
  id: string;
  age: string;
  sex: string;
  name?: string;
  capacity: number;
  number: number;
}

interface Event {
  id: string;
  name: string;
}

interface RankedCamel extends Camel {
  rank: number;
}

const ReportForm = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [camels, setCamels] = useState<RankedCamel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [rankInputValue, setRankInputValue] = useState<string>("");

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then(setEvents)
      .catch(() => setError("Error fetching events"));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getLoops`)
        .then((response) => response.json())
        .then((data) => {
          const filteredLoops = data.filter((loop: Loop) =>
            loop.eventId === selectedEvent
          );
          console.log(filteredLoops);
          console.log(data);
          setLoops(filteredLoops);
        })
        .catch(() => setError("Error fetching loops"));
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedLoop && selectedEvent) {
      fetch(`/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`)
        .then((response) => response.json())
        .then((data) => {
          const rankedCamels = data.map((camel: Camel, index: number) => ({
            ...camel,
            rank: index + 1
          }));
          console.log(rankedCamels);
          setCamels(rankedCamels);
        })
        .catch(() => setError("Error fetching camels"));
    }
  }, [selectedLoop, selectedEvent]);

  const handleReorder = (newOrder: RankedCamel[]) => {
    const updatedCamels = newOrder.map((camel, index) => ({
      ...camel,
      rank: index + 1
    }));
    setCamels(updatedCamels);
  };

  // Move camel to a new rank position
  const handleRankChange = (camelId: string, newRank: number) => {
    if (!newRank || newRank < 1 || newRank > camels.length) return;
    const currentIdx = camels.findIndex((c) => c.id === camelId);
    if (currentIdx === -1 || newRank - 1 === currentIdx) return;
    const updated = [...camels];
    const [moved] = updated.splice(currentIdx, 1);
    updated.splice(newRank - 1, 0, moved);
    // Re-rank
    const reRanked = updated.map((camel, idx) => ({ ...camel, rank: idx + 1 }));
    setCamels(reRanked);
  };

  // Handle input key events
  const handleRankInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, camelId: string) => {
    if (e.key === "Enter") {
      const newRank = Number(rankInputValue);
      handleRankChange(camelId, newRank);
      setEditingRankId(null);
    } else if (e.key === "Escape") {
      setEditingRankId(null);
    }
  };

  // Handle input blur (cancel edit)
  const handleRankInputBlur = () => {
    setEditingRankId(null);
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-300";
      case 3:
        return "bg-amber-600";
      default:
        return "bg-white";
    }
  };

  const handlePublish = async () => {
    if (camels.length === 0) {
      setError("No results to publish.");
      return;
    }

    setPublishLoading(true);

    const event = events.find(e => e.id === selectedEvent);
    const loop = loops.find(l => l.id === selectedLoop);

    const results = camels.map(camel => ({
      rank: camel.rank,
      camelId: Number(camel.id),
      camelName: camel.name,
      loopId: selectedLoop,
      loopName: `${translateAge(loop?.age || '')} - ${translateSex(loop?.sex || '')}`,
      eventId: selectedEvent,
      eventName: event?.name || "Unknown Event",
      IBAN: camel.IBAN,
      bankName: camel.bankName,
      ownerId: camel.ownerId,
      swiftCode: camel.swiftCode,
      ownerName: camel.ownerName,
      camelID: camel.camelID,
      NationalID: camel.NationalID,
    }));

    try {
      const response = await fetch("/api/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results),
      });

      if (!response.ok) throw new Error("Error publishing results");

      alert("Results published successfully!");
      setCamels([]);
      setSelectedLoop(null);
      setConfirmPublish(false);
    } catch (error) {
      setError("Error publishing results");
      setConfirmPublish(false);
    }
    finally {
      setPublishLoading(false);
    }
  };

  // Export camels to Excel
  const handleExportExcel = () => {
    if (!camels.length) return;
    const data = camels.map(camel => ({
      الترتيب: camel.rank,
      "اسم الجمل": camel.name,
      "اسم المالك": camel.ownerName,
      "رقم الشريحة": camel.camelID,
      "الرقم الوطني": camel.NationalID,
      IBAN: camel.IBAN,
      "اسم البنك": camel.bankName,
      SWIFT: camel.swiftCode,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النتائج");
    XLSX.writeFile(wb, "camel_results.xlsx");
  };

  function translateAge(age: string) {
    const ageMap: Record<string, string> = {
      "GradeOne": "مفرد",
      "GradeTwo": "حقايق",
      "GradeThree": "لقايا",
      "GradeFour": "جذاع",
      "GradeFive": "ثنايا",
      "GradeSixMale": "زمول",
      "GradeSixFemale": "حيل",
    };
    return ageMap[age] || "";
  }

  function translateSex(sex: string) {
    return sex === "Male" ? "قعدان" : sex === "Female" ? "بكار" : "";
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-gradient-to-br from-slate-50 to-slate-200 py-10 px-2">
      <div className="w-full space-y-8">
        <Card className="p-6 shadow-xl border-0 bg-white/90 w-full">
          {/* Export to Excel Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              استخراج النتائج إلى Excel
            </Button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">إدارة نتائج الهجن</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">الفعالية</label>
              <Select value={selectedEvent || ""} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full">
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
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">الشوط</label>
              <Select value={selectedLoop || ""} onValueChange={setSelectedLoop} disabled={!selectedEvent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر شوط" />
                </SelectTrigger>
                <SelectContent>
                  {loops.map((loop) => (
                    <SelectItem key={loop.id} value={loop.id}>
                      {translateAge(loop.age)} - {translateSex(loop.sex)} {'رقم الشوط: ' + loop.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded-md px-4 py-2 mb-4 animate-in fade-in">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {selectedLoop && camels.length > 0 && (
            <div className="mt-6 w-full">
              <Reorder.Group axis="y" values={camels} onReorder={handleReorder} className="space-y-3 w-full" style={{width: '100%'}}>
                {camels.map((camel, idx) => (
                  <Reorder.Item
                    key={camel.id}
                    value={camel}
                    className={cn(
                      "flex items-center justify-between border shadow-sm transition-all duration-200 hover:shadow-md group w-full px-0 py-0 rounded-none overflow-hidden min-w-0",
                      camel.rank === 1 && "bg-yellow-50",
                      camel.rank === 2 && "bg-gray-100",
                      camel.rank === 3 && "bg-amber-100",
                      camel.rank > 3 && "bg-white"
                    )}
                    style={{ width: '100%' }}
                  >
                    <div className="flex items-center gap-4 min-w-0 px-4 py-4 w-full">
                      {/* Rank badge or input */}
                      {editingRankId === camel.id ? (
                        <input
                          type="number"
                          min={1}
                          max={camels.length}
                          value={rankInputValue}
                          autoFocus
                          onChange={e => setRankInputValue(e.target.value.replace(/[^0-9]/g, ""))}
                          onKeyDown={e => handleRankInputKeyDown(e, camel.id)}
                          onBlur={handleRankInputBlur}
                          className="w-14 h-8 flex items-center justify-center text-lg font-bold mr-2 border rounded text-center focus:ring-2 focus:ring-primary outline-none transition-all"
                          title="تغيير ترتيب النتيجة"
                        />
                      ) : (
                        <Badge
                          className={cn(
                            "w-8 h-8 flex items-center justify-center text-lg font-bold mr-2 cursor-pointer",
                            camel.rank === 1 && "bg-yellow-400 text-white",
                            camel.rank === 2 && "bg-gray-300 text-gray-800",
                            camel.rank === 3 && "bg-amber-600 text-white"
                          )}
                          variant={camel.rank > 3 ? "secondary" : "default"}
                          onClick={() => {
                            setEditingRankId(camel.id);
                            setRankInputValue(String(camel.rank));
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label="تغيير ترتيب النتيجة"
                        >
                          {camel.rank}
                        </Badge>
                      )}
                      {camel.rank <= 3 && <Trophy className={cn("w-6 h-6", camel.rank === 1 ? "text-yellow-500" : camel.rank === 2 ? "text-gray-400" : "text-amber-700")} />}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 group-hover:text-primary transition-colors truncate">{camel.name}</p>
                        <p className="text-xs text-slate-500 truncate">{camel.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-4">
                      <div className="text-xs text-right space-y-1">
                        <p>رقم الشريحة: <span className="font-mono text-slate-700">{camel.camelID}</span></p>
                        <p>الرقم الوطني: <span className="font-mono text-slate-700">{camel.NationalID}</span></p>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  onClick={() => setConfirmPublish(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-base font-semibold shadow-lg"
                >
                  نشر النتائج
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" /> تأكيد نشر النتائج
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                هل أنت متأكد من رغبتك بإعلان النتيجة؟ لا يمكن التراجع بعد النشر.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={publishLoading} onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                {publishLoading ? "جاري النشر..." : "نعم، انشر النتائج"}
              </Button>
              <Button
                onClick={() => setConfirmPublish(false)}
                variant="outline"
                className="border-slate-300"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReportForm;