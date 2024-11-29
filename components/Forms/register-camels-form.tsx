"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface RegisterCamelFormProps {
  userId: string;
  onClose: () => void;
  refetchRegisteredCamels: () => void;
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
  startRegister: string;
  endRegister: string;
  number: number;
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
  refetchRegisteredCamels,
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
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

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
    const interval = setInterval(() => {
      const now = new Date();
      const updatedTimeLeft: Record<string, number> = {};

      loops.forEach(loop => {
        const endTime = new Date(loop.endRegister);
        const remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
        updatedTimeLeft[loop.id] = remainingTime;
      });

      setTimeLeft(updatedTimeLeft);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [loops]);

  useEffect(() => {
    if (selectedEvent) {
      const fetchLoops = async () => {
        try {
          const response = await fetch(`/api/events/${selectedEvent}/getLoops`);
          const data = await response.json();

          // Filter loops by event and available time
          const now = new Date();
          const availableLoops = data.filter((loop: Loop) => {
            const endTime = new Date(loop.endRegister);
            return loop.eventId === selectedEvent && endTime > now;
          });

          setLoops(availableLoops);

          // Fetch registered camels count for available loops
          const registrationCounts: Record<string, number> = {};
          const currentTimeLeft: Record<string, number> = {};

          for (const loop of availableLoops) {
            const [registeredResponse] = await Promise.all([
              fetch(`/api/events/${selectedEvent}/getLoops/${loop.id}/registeredCamels`)
            ]);

            const registeredData = await registeredResponse.json();
            registrationCounts[loop.id] = registeredData.length;

            const endTime = new Date(loop.endRegister);
            const remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
            currentTimeLeft[loop.id] = remainingTime;
          }

          setLoopRegistrations(registrationCounts);
          setTimeLeft(currentTimeLeft);
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

            console.log("filteredCamels: ", filteredCamels);

            const registeredResponse = await fetch(
              `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels`
            );
            const registeredData = await registeredResponse.json();
            console.log("registeredData: ", registeredData)
            setRegisteredCamels(registeredData);

            if (registeredData.length >= selectedLoopDetails.capacity) {
              setMessage("! هذا السباق وصل الحد الاقصى في التسجيل");
              setAvailableCamels([]);
            } else {
              // const availableCamels = filteredCamels.filter(
              //   (camel: Camel) =>
              //     !registeredData.some(
              //       (registered: Camel) => registered.id === camel.id
              //     )
              // );
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
        refetchRegisteredCamels()
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

  const getLoopLabel = (loop: Loop) => {
    const remaining = timeLeft[loop.id] || 0;
    const registeredCount = loopRegistrations[loop.id] || 0;

    if (remaining <= 0) {
      return `${translateAge(loop.age)} - ${translateSex(loop.sex)} (${translateTime(loop.time)}) - انتهى وقت التسجيل - شوط ${loop.number}`;
    }

    return `${translateAge(loop.age)} - ${translateSex(loop.sex)} (${translateTime(loop.time)}) - ${registeredCount}/${loop.capacity} - ${remaining} دقيقة متبقية - شوط ${loop.number}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-[500px]">
        <h2 className="text-xl mb-4">تسجيل المطية في السباق</h2>
        {message && <p className="mb-4 text-right">{message}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-right">اختر فعالية</label>
          <select
            className="w-full border rounded p-2"
            value={selectedEvent || ""}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setSelectedLoop(null);
              setSelectedCamel(null);
            }}
          >
            <option value="">-- اختر فعالية --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && loops.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-right">اختر شوط</label>
            <select
              className="w-full border rounded p-2"
              value={selectedLoop || ""}
              onChange={(e) => setSelectedLoop(e.target.value)}
            >
              <option value="">-- اختر شوط --</option>
              {loops.map((loop) => (
                <option
                  key={loop.id}
                  value={loop.id}
                  disabled={timeLeft[loop.id] <= 0}
                >
                  {getLoopLabel(loop)}
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
          <Button
            onClick={handleRegister}
            disabled={!selectedCamel || !selectedLoop || (timeLeft[selectedLoop] <= 0)}
          >
            تسجيل
          </Button>
          <Button onClick={onClose} variant="secondary">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}

