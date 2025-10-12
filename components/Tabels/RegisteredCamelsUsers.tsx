"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmationDialog from "../Forms/CDCFL";
import { useRouter } from "next/navigation";
import { translateAge, translateSex, translateTime } from "@/lib/helper";

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

const RegisterCamelsUsers = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [registeredCamels, setRegisteredCamels] = useState<Camel[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [camelToRemove, setCamelToRemove] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const userData = await response.json();
        setUserId(userData.id);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/auth/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/getEvents");
        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const fetchLoops = async () => {
        try {
          const response = await fetch(`/api/events/${selectedEvent}/getLoops`);
          if (!response.ok) {
            throw new Error(`Error fetching loops: ${response.statusText}`);
          }
          const data = await response.json();
          setLoops(data.filter((loop: Loop) => loop.eventId === selectedEvent));
        } catch (error) {
          console.error("Error fetching loops:", error);
        }
      };

      fetchLoops();
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedLoop && userId) {
      const fetchRegisteredCamels = async () => {
        try {
          const response = await fetch(
            `/api/events/${selectedEvent}/getLoops/${selectedLoop}/registeredCamels?userId=${userId}`
          );
          if (!response.ok) {
            throw new Error(
              `Error fetching registered camels: ${response.statusText}`
            );
          }
          const registeredData = await response.json();
          setRegisteredCamels(registeredData);
        } catch (error) {
          console.error("Error fetching registered camels:", error);
        }
      };

      fetchRegisteredCamels();
    }
  }, [selectedLoop, selectedEvent, userId]);

  const handleRemoveCamel = async () => {
    if (!camelToRemove || !selectedEvent || !selectedLoop || !userId) return;

    try {
      const response = await fetch(
        `/api/events/${selectedEvent}/getLoops/${selectedLoop}/removeRegisteredCamel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ camelId: camelToRemove, userId }),
        }
      );

      if (response.ok) {
        setRegisteredCamels((prev) =>
          prev.filter((camel) => camel.id !== camelToRemove)
        );
        setMessage("Camel removed successfully");
        setCamelToRemove(null);
      } else {
        setMessage("Failed to remove camel");
      }
    } catch (error) {
      console.error("Error removing camel:", error);
      setMessage("Error removing camel");
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="bg-[url('/desert.jpg')] h-screen bg-center bg-no-repeat bg-cover flex items-center justify-center">
      <div className="p-6 container bg-white rounded-lg">
        <h2 className="text-3xl mb-4 text-center font-semibold">
          المطايا المسجلة في السباق
        </h2>
        {message && <p className="mb-4">{message}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-right">اختر فعالية</label>
          <Select onValueChange={setSelectedEvent} value={selectedEvent || ""}>
            <SelectTrigger className="w-full border rounded p-2">
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
          <div className="mb-4">
            <label className="block mb-2 text-right">اختر شوط / سباق</label>
            <Select onValueChange={setSelectedLoop} value={selectedLoop || ""}>
              <SelectTrigger className="w-full border rounded p-2">
                <SelectValue placeholder="اختر شوط / سباق" />
              </SelectTrigger>
              <SelectContent>
                {loops.map((loop) => (
                  <SelectItem key={loop.id} value={loop.id}>
                    {translateAge(loop.age)} - {translateSex(loop.sex)} - {translateTime(loop.time)} {'رقم الشوط: ' + loop.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedLoop && (
          <div className="mb-4">
            <h3 className="text-lg mb-2 text-center font-semibold">
              المطايا المسجلة
            </h3>
            {registeredCamels.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصف</TableHead>
                      <TableHead>الجنس</TableHead>
                      <TableHead>العمليات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredCamels.map((camel) => (
                      <TableRow key={camel.id}>
                        <TableCell className="text-right">
                          {camel.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {translateAge(camel.age)}
                        </TableCell>
                        <TableCell className="text-right">
                          {translateSex(camel.sex)}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            onClick={() => {
                              setCamelToRemove(camel.id);
                              setIsDialogOpen(true);
                            }}
                          >
                            إزالة
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center">لا توجد مطايا مسجلة.</p>
            )}
          </div>
        )}
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onConfirm={handleRemoveCamel}
          onClose={() => setIsDialogOpen(false)}
          message="Are you sure you want to remove this camel from this loop?"
        />
      </div>
    </div>
  );
};

export default RegisterCamelsUsers;
