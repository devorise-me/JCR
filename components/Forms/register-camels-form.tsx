"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface RegisterCamelFormProps {
  userId: string;
  onClose: () => void;
}

interface Event {
  id: string;
  name: string;
}

interface Loop {
  id: string;
  age: string;
  sex: string;
  capacity: number;
  eventId: string;
  time: string;
  startRegister: Date;
  endRegister: Date;
}

interface Camel {
  id: string;
  name: string;
  camelID: string;
  age: string;
  sex: string;
}

export default function RegisterCamelForm({
  userId,
  onClose,
}: RegisterCamelFormProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [registeredCamels, setRegisteredCamels] = useState<Camel[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [selectedCamel, setSelectedCamel] = useState<string | null>(null);
  const [availableCamels, setAvailableCamels] = useState<Camel[]>([]);
  const [message, setMessage] = useState("");
  const [loopRegistrations, setLoopRegistrations] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/getEvents");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(": حدث خطأ اثناء تحميل الفعالية", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const fetchLoops = async () => {
        try {
          const response = await fetch(`/api/events/${selectedEvent}/getLoops`);
          const data = await response.json();
          setLoops(data.filter((loop: Loop) => loop.eventId === selectedEvent));

          // Fetch registered camels count for each loop
          const registrationCounts: Record<string, number> = {};
          for (const loop of data) {
            const registeredResponse = await fetch(
              `/api/events/${selectedEvent}/getLoops/${loop.id}/registeredCamels`
            );
            const registeredData = await registeredResponse.json();
            registrationCounts[loop.id] = registeredData.length;
          }
          setLoopRegistrations(registrationCounts);
        } catch (error) {
          console.error(": حدث خطأ اثناء تحميل السباق", error);
        }
      };

      fetchLoops();
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedLoop) {
      const fetchUserCamels = async () => {
        try {
          const response = await fetch(`/api/camels/${userId}`);
          const camelsData = await response.json();
          setCamels(camelsData);

          const selectedLoopDetails = loops.find(
            (loop) => loop.id === selectedLoop
          );
          if (selectedLoopDetails) {
            const filteredCamels = camelsData.filter(
              (camel: Camel) =>
                camel.age === selectedLoopDetails.age &&
                camel.sex === selectedLoopDetails.sex
            );

            const registeredResponse = await fetch(
              `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`
            );
            const registeredData = await registeredResponse.json();
            setRegisteredCamels(registeredData);

            if (registeredData.length >= selectedLoopDetails.capacity) {
              setMessage("! هذا السباق وصل الحد الاقصى في التسجيل");
              setAvailableCamels([]);
            } else {
              const availableCamels = filteredCamels.filter(
                (camel: Camel) =>
                  !registeredData.some(
                    (registered: Camel) => registered.id === camel.id
                  )
              );
              setAvailableCamels(availableCamels);
            }
          }
        } catch (error) {
          console.error(": حدث خطأ اثناء تحميل الهجن", error);
        }
      };

      fetchUserCamels();
    }
  }, [selectedLoop, loops, userId, selectedEvent]);

  const handleRegister = async () => {
    if (!selectedCamel || !selectedLoop) {
      setMessage("يرجى اختيار مطية وشوط.");
      return;
    }

    try {
      const selectedLoopDetails = loops.find(
        (loop) => loop.id === selectedLoop
      );
      if (!selectedLoopDetails) {
        setMessage("حدث خطأ أثناء تحميل تفاصيل الشوط");
        return;
      }

      const now = new Date();

      const startRegisterDate = new Date(
        selectedLoopDetails.startRegister
      ).toLocaleDateString("ar-EG");
      const endRegisterDate = new Date(
        selectedLoopDetails.endRegister
      ).toLocaleDateString("ar-EG");

      if (
        now < new Date(selectedLoopDetails.startRegister) ||
        now > new Date(selectedLoopDetails.endRegister)
      ) {
        setMessage(
          `لا يمكنك التسجيل خارج فترة التسجيل المحددة. فترة التسجيل تبدأ من ${startRegisterDate} وتنتهي في ${endRegisterDate}.`
        );
        return;
      }

      const res = await fetch(
        `/api/events/${selectedEvent}/getLoops/${selectedLoop}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ camelId: selectedCamel, userId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("! تم تسجيل المطية في السباق بنجاح");
        const registeredResponse = await fetch(
          `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`
        );
        const registeredData = await registeredResponse.json();
        setRegisteredCamels(registeredData);

        // Close the popup after successful registration
        onClose();
      } else {
        setMessage(data.error || "فشلت عملية تسجيل المطية");
      }
    } catch (error) {
      console.error(": حدث خطأ اثناء تسجيل المطية", error);
      setMessage("حدث خطأ اثناء تسجيل المطية");
    }
  };

  function translateAge(Age: string) {
    switch (Age) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-[500px]">
        <h2 className="text-xl mb-4"> تسجيل المطية في السباق</h2>
        {message && <p className="mb-4">{message}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-right">اختر فعالية</label>
          <select
            className="w-full border rounded p-2"
            value={selectedEvent || ""}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">-- اختر فعالية --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="mb-4">
            <label className="block mb-2 text-right">اختر شوط</label>
            <select
              className="w-full border rounded p-2"
              value={selectedLoop || ""}
              onChange={(e) => setSelectedLoop(e.target.value)}
            >
              <option value="">-- اختر شوط --</option>
              {loops.map((loop) => (
                <option key={loop.id} value={loop.id}>
                  {translateAge(loop.age)} - {translateSex(loop.sex)} (
                  {translateTime(loop.time)}) - {
                    loopRegistrations[loop.id]
                  }/{loop.capacity}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedLoop && availableCamels.length >= 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-right">اختر مطية</label>
            <select
              className="w-full border rounded p-2"
              value={selectedCamel || ""}
              onChange={(e) => setSelectedCamel(e.target.value)}
            >
              <option value="">-- اختر مطية --</option>
              {availableCamels.map((camel) => (
                <option key={camel.id} value={camel.id}>
                  {camel.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={handleRegister}>تسجيل</Button>
          <Button onClick={onClose} variant="secondary">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}

