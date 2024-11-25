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
import { Trophy } from "lucide-react";

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
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedEvent || ""} onValueChange={setSelectedEvent}>
          <SelectTrigger>
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

        {selectedEvent && (
          <Select value={selectedLoop || ""} onValueChange={setSelectedLoop}>
            <SelectTrigger>
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
        )}
      </div>

      {error && (
        <div className="text-red-500 p-2 rounded bg-red-100">{error}</div>
      )}

      {selectedLoop && camels.length > 0 && (
        <Card className="p-4">
          <Reorder.Group axis="y" values={camels} onReorder={handleReorder} className="space-y-2">
            {camels.map((camel) => (
              <Reorder.Item
                key={camel.id}
                value={camel}
                className={`p-4 rounded-lg cursor-move flex items-center justify-between ${getMedalColor(camel.rank)} transition-colors duration-200`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">{camel.rank}</span>
                  {camel.rank <= 3 && <Trophy className="w-6 h-6" />}
                  <div>
                    <p className="font-medium">{camel.name}</p>
                    <p className="text-sm text-gray-600">{camel.ownerName}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p>رقم الشريحة: {camel.camelID}</p>
                  <p>الرقم الوطني: {camel.NationalID}</p>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              onClick={() => setConfirmPublish(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              نشر النتائج
            </Button>
          </div>
        </Card>
      )}

      {confirmPublish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">هل أنت متأكد من رغبتك بإعلان النتيجة؟</h3>
            <div className="flex justify-end gap-4">
              <Button disabled={publishLoading} onClick={handlePublish}>
                {publishLoading ? "جاري النشر..." : "نعم"}
              </Button>
              <Button
                onClick={() => setConfirmPublish(false)}
                variant="outline"
              >
                لا
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportForm;